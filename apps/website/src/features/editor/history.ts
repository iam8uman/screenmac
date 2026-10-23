import { translateAnnotation } from "./geometry";
import { createDocument, type Annotation, type Backdrop, type EditorDocument, type Rect } from "./model";

export const HISTORY_LIMIT = 100;

export interface EditorState {
  doc: EditorDocument;
  past: EditorDocument[];
  future: EditorDocument[];
  /** Document at the start of an in-progress pointer gesture. */
  gestureBase: EditorDocument | null;
  selectedId: string | null;
}

export type EditorAction =
  | { type: "add"; annotation: Annotation; select?: boolean }
  | { type: "update"; annotation: Annotation }
  | { type: "remove"; id: string }
  | { type: "duplicate"; id: string; offset: number; newId: string }
  | { type: "reorder"; id: string; to: "front" | "back" }
  | { type: "nudge"; id: string; dx: number; dy: number }
  | { type: "setCrop"; crop: Rect | null }
  | { type: "setBackdrop"; backdrop: Backdrop }
  | { type: "select"; id: string | null }
  | { type: "gestureStart" }
  | { type: "gesturePreview"; doc: EditorDocument }
  | { type: "gestureEnd" }
  | { type: "gestureCancel" }
  | { type: "switchSample"; sampleId: string }
  | { type: "reset" }
  | { type: "undo" }
  | { type: "redo" };

export function createEditorState(sampleId: string, seed?: Partial<Omit<EditorDocument, "sampleId">>): EditorState {
  return {
    doc: { ...createDocument(sampleId), ...seed },
    past: [],
    future: [],
    gestureBase: null,
    selectedId: null,
  };
}

export const canUndo = (state: EditorState) => state.past.length > 0;
export const canRedo = (state: EditorState) => state.future.length > 0;
export const isDirty = (state: EditorState) =>
  state.doc.annotations.length > 0 || state.doc.crop !== null || state.doc.backdrop.id !== "none";

function pushPast(past: EditorDocument[], doc: EditorDocument): EditorDocument[] {
  const next = [...past, doc];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

/** Record `doc` as a new undoable step. */
function commit(state: EditorState, doc: EditorDocument, selectedId = state.selectedId): EditorState {
  if (doc === state.doc) return state;
  return {
    doc,
    past: pushPast(state.past, state.doc),
    future: [],
    gestureBase: null,
    selectedId: selectedId && doc.annotations.some((a) => a.id === selectedId) ? selectedId : null,
  };
}

function mapAnnotations(doc: EditorDocument, fn: (items: Annotation[]) => Annotation[]): EditorDocument {
  return { ...doc, annotations: fn(doc.annotations) };
}

function documentsEqual(a: EditorDocument, b: EditorDocument): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/** Finish any in-flight gesture so undo/redo never strands a half-applied drag. */
function settle(state: EditorState): EditorState {
  if (!state.gestureBase) return state;
  return editorReducer(state, { type: "gestureEnd" });
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "add":
      return commit(
        state,
        mapAnnotations(state.doc, (items) => [...items, action.annotation]),
        action.select === false ? state.selectedId : action.annotation.id,
      );
    case "update": {
      if (!state.doc.annotations.some((a) => a.id === action.annotation.id)) return state;
      return commit(
        state,
        mapAnnotations(state.doc, (items) => items.map((a) => (a.id === action.annotation.id ? action.annotation : a))),
      );
    }
    case "remove": {
      if (!state.doc.annotations.some((a) => a.id === action.id)) return state;
      return commit(
        state,
        mapAnnotations(state.doc, (items) => items.filter((a) => a.id !== action.id)),
        state.selectedId === action.id ? null : state.selectedId,
      );
    }
    case "duplicate": {
      const source = state.doc.annotations.find((a) => a.id === action.id);
      if (!source) return state;
      const copy = { ...translateAnnotation(source, action.offset, action.offset), id: action.newId };
      return commit(state, mapAnnotations(state.doc, (items) => [...items, copy]), copy.id);
    }
    case "reorder": {
      const target = state.doc.annotations.find((a) => a.id === action.id);
      if (!target) return state;
      const rest = state.doc.annotations.filter((a) => a.id !== action.id);
      const ordered = action.to === "front" ? [...rest, target] : [target, ...rest];
      if (ordered.every((a, i) => a === state.doc.annotations[i])) return state;
      return commit(state, { ...state.doc, annotations: ordered });
    }
    case "nudge": {
      const target = state.doc.annotations.find((a) => a.id === action.id);
      if (!target) return state;
      const moved = translateAnnotation(target, action.dx, action.dy);
      return commit(
        state,
        mapAnnotations(state.doc, (items) => items.map((a) => (a.id === action.id ? moved : a))),
      );
    }
    case "setCrop":
      return commit(state, { ...state.doc, crop: action.crop ? { ...action.crop } : null });
    case "setBackdrop":
      return commit(state, { ...state.doc, backdrop: { ...action.backdrop } });
    case "select":
      if (action.id !== null && !state.doc.annotations.some((a) => a.id === action.id)) return state;
      return { ...state, selectedId: action.id };
    case "gestureStart":
      return { ...state, gestureBase: state.gestureBase ?? state.doc };
    case "gesturePreview":
      if (!state.gestureBase) return state;
      return { ...state, doc: action.doc };
    case "gestureEnd": {
      const base = state.gestureBase;
      if (!base) return state;
      if (documentsEqual(base, state.doc)) return { ...state, doc: base, gestureBase: null };
      return { ...state, past: pushPast(state.past, base), future: [], gestureBase: null };
    }
    case "gestureCancel":
      if (!state.gestureBase) return state;
      return { ...state, doc: state.gestureBase, gestureBase: null };
    case "switchSample": {
      const settled = settle(state);
      if (settled.doc.sampleId === action.sampleId) return settled;
      // Undoable: the previous sample and its annotations come back with ⌘Z.
      return commit(settled, createDocument(action.sampleId), null);
    }
    case "reset": {
      const settled = settle(state);
      const fresh = createDocument(settled.doc.sampleId);
      if (documentsEqual(fresh, settled.doc)) return { ...settled, selectedId: null };
      return commit(settled, fresh, null);
    }
    case "undo": {
      const settled = settle(state);
      const previous = settled.past.at(-1);
      if (!previous) return settled;
      return {
        doc: previous,
        past: settled.past.slice(0, -1),
        future: [settled.doc, ...settled.future],
        gestureBase: null,
        selectedId: previous.annotations.some((a) => a.id === settled.selectedId) ? settled.selectedId : null,
      };
    }
    case "redo": {
      const settled = settle(state);
      const next = settled.future[0];
      if (!next) return settled;
      return {
        doc: next,
        past: pushPast(settled.past, settled.doc),
        future: settled.future.slice(1),
        gestureBase: null,
        selectedId: next.annotations.some((a) => a.id === settled.selectedId) ? settled.selectedId : null,
      };
    }
  }
}

export function nextCounterValue(annotations: readonly Annotation[]): number {
  let max = 0;
  for (const a of annotations) if (a.kind === "counter" && a.value > max) max = a.value;
  return max + 1;
}
