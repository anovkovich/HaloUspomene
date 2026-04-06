/**
 * Cross-platform haptic feedback.
 * - Android: navigator.vibrate()
 * - iOS 18+: hidden <input type="checkbox" switch> trick.
 *   Safari triggers a native haptic "tick" when a label toggles a switch input.
 *   The element must have real dimensions and pointer-events for iOS to fire the haptic.
 */

let initialized = false;
let hapticLabel: HTMLLabelElement | null = null;
let isIOSDevice = false;

function ensureHapticElement() {
  if (initialized) return;
  initialized = true;

  if (typeof document === "undefined") return;

  isIOSDevice =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOSDevice) return;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.id = "__haptic_switch";
  // Must have real dimensions for iOS to register the interaction,
  // but visually hidden offscreen with overflow clipped
  input.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.01;";

  const label = document.createElement("label");
  label.htmlFor = "__haptic_switch";
  label.id = "__haptic_label";
  // Label needs pointer-events enabled for iOS to treat .click() as user gesture
  label.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.01;";

  document.body.appendChild(input);
  document.body.appendChild(label);
  hapticLabel = label;
}

export function triggerHaptic() {
  // Android — Vibration API
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(30);
    return;
  }

  // iOS 18+ — hidden switch trick
  ensureHapticElement();
  if (hapticLabel) {
    hapticLabel.click();
  }
}
