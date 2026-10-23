import AppKit
import Carbon.HIToolbox

/// Registers system-wide shortcuts with Carbon's `RegisterEventHotKey`, which
/// needs no Accessibility permission and works while other apps are active.
@MainActor
final class HotkeyCenter {
    private var refs: [ShortcutAction: EventHotKeyRef] = [:]
    private var handlerRef: EventHandlerRef?
    private var handler: ((ShortcutAction) -> Void)?
    /// Actions whose shortcut couldn't be registered (usually taken by another app).
    private(set) var failures: [ShortcutAction: OSStatus] = [:]

    private static let signature: OSType = {
        var result: OSType = 0
        for scalar in "SCMC".unicodeScalars { result = (result << 8) + OSType(scalar.value) }
        return result
    }()

    func start(onPress: @escaping (ShortcutAction) -> Void) {
        handler = onPress
        guard handlerRef == nil else { return }
        var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        let context = Unmanaged.passUnretained(self).toOpaque()
        InstallEventHandler(GetApplicationEventTarget(), { _, event, userData -> OSStatus in
            guard let event, let userData else { return OSStatus(eventNotHandledErr) }
            var id = EventHotKeyID()
            let status = GetEventParameter(event, EventParamName(kEventParamDirectObject), EventParamType(typeEventHotKeyID),
                                           nil, MemoryLayout<EventHotKeyID>.size, nil, &id)
            guard status == noErr else { return status }
            let center = Unmanaged<HotkeyCenter>.fromOpaque(userData).takeUnretainedValue()
            let index = Int(id.id)
            DispatchQueue.main.async {
                MainActor.assumeIsolated {
                    guard ShortcutAction.allCases.indices.contains(index) else { return }
                    center.handler?(ShortcutAction.allCases[index])
                }
            }
            return noErr
        }, 1, &spec, context, &handlerRef)
    }

    /// Replace all registrations. Returns the actions that failed to register.
    @discardableResult
    func register(_ shortcuts: [ShortcutAction: Shortcut]) -> [ShortcutAction: OSStatus] {
        unregisterAll()
        failures = [:]
        for (action, shortcut) in shortcuts {
            guard let index = ShortcutAction.allCases.firstIndex(of: action) else { continue }
            var ref: EventHotKeyRef?
            let id = EventHotKeyID(signature: Self.signature, id: UInt32(index))
            let status = RegisterEventHotKey(shortcut.keyCode, shortcut.carbonModifiers, id, GetApplicationEventTarget(), 0, &ref)
            if status == noErr, let ref {
                refs[action] = ref
            } else {
                failures[action] = status
            }
        }
        return failures
    }

    func unregisterAll() {
        for ref in refs.values { UnregisterEventHotKey(ref) }
        refs.removeAll()
    }
}
