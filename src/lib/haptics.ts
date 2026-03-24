/**
 * Cross-platform haptic feedback.
 * - Android: navigator.vibrate()
 * - iOS 18+: hidden <input type="checkbox" switch> trick
 *   Safari triggers a native haptic "tick" when a label toggles a switch input.
 */

let initialized = false;
let hapticLabel: HTMLLabelElement | null = null;

function ensureHapticElement() {
  if (initialized) return;
  initialized = true;

  if (typeof document === "undefined") return;

  // Only set up the iOS trick if we're on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.id = "__haptic_switch";
  input.style.cssText =
    "position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none;width:0;height:0;";

  const label = document.createElement("label");
  label.htmlFor = "__haptic_switch";
  label.id = "__haptic_label";
  label.style.cssText =
    "position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none;width:0;height:0;";

  document.body.appendChild(input);
  document.body.appendChild(label);
  hapticLabel = label;
}

export function triggerHaptic() {
  // Android — Vibration API
  if (navigator.vibrate) {
    navigator.vibrate(30);
    return;
  }

  // iOS 18+ — hidden switch trick
  ensureHapticElement();
  if (hapticLabel) {
    hapticLabel.click();
  }
}
