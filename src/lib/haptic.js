/**
 * Haptic / vibration helper.
 *
 * Uses the Web Vibration API (`navigator.vibrate`) when available.
 * - Works on Android Chrome / Firefox / etc.
 * - iOS Safari does NOT expose haptics to web pages — calls are no-ops there,
 *   but visual scale/glow feedback already provides the perceived tactile cue.
 *
 * All functions are safe to call on any device.
 */

function v(pattern) {
	if (typeof navigator === 'undefined') return false;
	if (typeof navigator.vibrate !== 'function') return false;
	try {
		return navigator.vibrate(pattern);
	} catch {
		return false;
	}
}

/** Light tap — for button presses, toggles, taps. */
export function tap() {
	return v(8);
}

/** Stronger tap — for primary actions, submits. */
export function strongTap() {
	return v(15);
}

/** Success pulse — for completing a habit / milestone. */
export function success() {
	return v([12, 28, 24]);
}

/** Warning buzz — for destructive confirms, decrements past 0. */
export function warn() {
	return v(28);
}

/** Error pattern — form validation errors, failed API. */
export function error() {
	return v([22, 60, 22]);
}

/** Stop any ongoing vibration. */
export function stop() {
	return v(0);
}
