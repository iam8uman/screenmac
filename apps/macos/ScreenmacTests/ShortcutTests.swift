import Carbon.HIToolbox
import XCTest
@testable import Screenmac

final class ShortcutTests: XCTestCase {
    func testDefaultsAvoidSystemShortcutsAndEachOther() {
        var existing: [ShortcutAction: Shortcut] = [:]
        for action in ShortcutAction.allCases {
            XCTAssertEqual(ShortcutRules.validate(action.defaultShortcut, for: action, existing: existing), .ok, action.label)
            existing[action] = action.defaultShortcut
        }
    }

    func testSystemScreenshotShortcutIsRejected() {
        let s = Shortcut(keyCode: UInt32(kVK_ANSI_4), modifiers: [.shift, .command])
        XCTAssertEqual(ShortcutRules.validate(s, for: .captureArea, existing: [:]), .reservedBySystem("screenshots"))
    }

    func testPlainKeysAreRejected() {
        let s = Shortcut(keyCode: UInt32(kVK_ANSI_A), modifiers: [.shift])
        XCTAssertEqual(ShortcutRules.validate(s, for: .captureArea, existing: [:]), .needsModifier)
    }

    func testDuplicatesAreRejected() {
        let s = ShortcutAction.captureWindow.defaultShortcut
        XCTAssertEqual(ShortcutRules.validate(s, for: .captureArea, existing: [.captureWindow: s]), .duplicate(.captureWindow))
    }

    func testDisplayStringAndCarbonModifiers() {
        let s = ShortcutAction.captureArea.defaultShortcut
        XCTAssertEqual(s.displayString, "⌥⇧⌘4")
        XCTAssertEqual(s.carbonModifiers, UInt32(cmdKey | optionKey | shiftKey))
    }

    func testCodableRoundTrip() throws {
        let s = Shortcut(keyCode: 12, modifiers: [.control, .option])
        XCTAssertEqual(try JSONDecoder().decode(Shortcut.self, from: JSONEncoder().encode(s)), s)
    }
}
