import { describe, expect, it } from "vitest";
import { HISTORY_LIMIT, canRedo, canUndo, createEditorState, editorReducer, isDirty, nextCounterValue, type EditorAction, type EditorState } from "./history";
import type { Annotation, CounterAnnotation, ShapeAnnotation } from "./model";

const rect = (id: string, x = 0): ShapeAnnotation => ({ id, kind: "rectangle", rect: { x, y: 0, width: 20, height: 20 }, color: "#000", strokeWidth: 4, filled: false });
const run = (state: EditorState, ...actions: EditorAction[]) => actions.reduce(editorReducer, state);

describe("editor history", () => {
  it("adds annotations as undoable steps and selects them", () => {
    const state = run(createEditorState("s"), { type: "add", annotation: rect("a") });
    expect(state.doc.annotations).toHaveLength(1);
    expect(state.selectedId).toBe("a");
    expect(canUndo(state)).toBe(true);
  });

  it("undoes and redoes in order", () => {
    let state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "add", annotation: rect("b") });
    state = run(state, { type: "undo" });
    expect(state.doc.annotations.map((a) => a.id)).toEqual(["a"]);
    state = run(state, { type: "undo" });
    expect(state.doc.annotations).toHaveLength(0);
    expect(canUndo(state)).toBe(false);
    state = run(state, { type: "redo" }, { type: "redo" });
    expect(state.doc.annotations.map((a) => a.id)).toEqual(["a", "b"]);
    expect(canRedo(state)).toBe(false);
  });

  it("clears redo after a new edit", () => {
    const state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "undo" }, { type: "add", annotation: rect("b") });
    expect(canRedo(state)).toBe(false);
  });

  it("records a whole drag gesture as one step", () => {
    let state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "gestureStart" });
    for (let x = 1; x <= 5; x += 1) {
      state = editorReducer(state, { type: "gesturePreview", doc: { ...state.doc, annotations: [rect("a", x)] } });
    }
    state = editorReducer(state, { type: "gestureEnd" });
    expect(state.past).toHaveLength(2);
    expect(state.doc.annotations[0]).toMatchObject({ rect: { x: 5 } });
    state = editorReducer(state, { type: "undo" });
    expect(state.doc.annotations[0]).toMatchObject({ rect: { x: 0 } });
  });

  it("does not record a gesture that changed nothing", () => {
    const state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "gestureStart" }, { type: "gestureEnd" });
    expect(state.past).toHaveLength(1);
  });

  it("cancels a gesture back to where it began", () => {
    let state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "gestureStart" });
    state = editorReducer(state, { type: "gesturePreview", doc: { ...state.doc, annotations: [] } });
    state = editorReducer(state, { type: "gestureCancel" });
    expect(state.doc.annotations).toHaveLength(1);
  });

  it("removes and duplicates", () => {
    let state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "duplicate", id: "a", offset: 10, newId: "b" });
    expect(state.doc.annotations[1]).toMatchObject({ id: "b", rect: { x: 10, y: 10 } });
    expect(state.selectedId).toBe("b");
    state = run(state, { type: "remove", id: "b" });
    expect(state.selectedId).toBeNull();
    expect(state.doc.annotations).toHaveLength(1);
  });

  it("makes sample switching undoable", () => {
    let state = run(createEditorState("one"), { type: "add", annotation: rect("a") }, { type: "switchSample", sampleId: "two" });
    expect(state.doc).toMatchObject({ sampleId: "two", annotations: [] });
    state = run(state, { type: "undo" });
    expect(state.doc.sampleId).toBe("one");
    expect(state.doc.annotations).toHaveLength(1);
  });

  it("resets annotations, crop, and backdrop but keeps reset undoable", () => {
    let state = run(
      createEditorState("s"),
      { type: "add", annotation: rect("a") },
      { type: "setCrop", crop: { x: 1, y: 1, width: 50, height: 50 } },
      { type: "setBackdrop", backdrop: { id: "violet", padding: 7, radius: 16, shadow: true } },
    );
    expect(isDirty(state)).toBe(true);
    state = run(state, { type: "reset" });
    expect(isDirty(state)).toBe(false);
    state = run(state, { type: "undo" });
    expect(state.doc.backdrop.id).toBe("violet");
    expect(state.doc.crop).not.toBeNull();
  });

  it("caps history length", () => {
    let state = createEditorState("s");
    for (let i = 0; i < HISTORY_LIMIT + 20; i += 1) state = editorReducer(state, { type: "add", annotation: rect(`r${i}`) });
    expect(state.past).toHaveLength(HISTORY_LIMIT);
  });

  it("nudges and reorders", () => {
    let state = run(createEditorState("s"), { type: "add", annotation: rect("a") }, { type: "add", annotation: rect("b") });
    state = run(state, { type: "nudge", id: "b", dx: 1, dy: 0 }, { type: "reorder", id: "b", to: "back" });
    expect(state.doc.annotations.map((a) => a.id)).toEqual(["b", "a"]);
    expect(state.doc.annotations[0]).toMatchObject({ rect: { x: 1 } });
  });

  it("numbers counters sequentially from the highest", () => {
    const counter = (value: number): CounterAnnotation => ({ id: `c${value}`, kind: "counter", center: { x: 0, y: 0 }, value, color: "#000", radius: 10 });
    const items: Annotation[] = [counter(1), counter(4), rect("x")];
    expect(nextCounterValue(items)).toBe(5);
    expect(nextCounterValue([])).toBe(1);
  });
});
