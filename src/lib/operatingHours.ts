/**
 * SN-OPS-007 — Operating Hours Utility
 * Sweet News hours: Noon (12:00 PM) to Midnight (11:59 PM) Mountain Time
 */

const MT_TIMEZONE = 'America/Denver';

/** Returns the current hour (0–23) in Mountain Time */
function getMTHour(): number {
  const now = new Date();
  const mtString = now.toLocaleString('en-US', { timeZone: MT_TIMEZONE, hour: 'numeric', hour12: false });
  return parseInt(mtString, 10);
}

/** Returns the current minute (0–59) in Mountain Time */
function getMTMinute(): number {
  const now = new Date();
  const mtString = now.toLocaleString('en-US', { timeZone: MT_TIMEZONE, minute: 'numeric' });
  return parseInt(mtString, 10);
}

/** Returns total minutes past midnight in Mountain Time */
function getMTMinutesSinceMidnight(): number {
  return getMTHour() * 60 + getMTMinute();
}

const OPEN_MINUTE  = 12 * 60;       // 12:00 PM = 720 minutes
const CLOSE_MINUTE = 24 * 60 - 1;   // 11:59 PM = 1439 minutes

/** True if current Mountain Time is between 12:00 PM and 11:59 PM */
export function isOpen(): boolean {
  const mins = getMTMinutesSinceMidnight();
  return mins >= OPEN_MINUTE && mins <= CLOSE_MINUTE;
}

/** Minutes until the store opens (0 if already open) */
export function minutesUntilOpen(): number {
  const mins = getMTMinutesSinceMidnight();
  if (mins >= OPEN_MINUTE) return 0;
  return OPEN_MINUTE - mins;
}

/** Minutes until the store closes (0 if already closed) */
export function minutesUntilClose(): number {
  const mins = getMTMinutesSinceMidnight();
  if (mins > CLOSE_MINUTE) return 0;
  return CLOSE_MINUTE - mins + 1;
}

/** Human-readable time remaining string, e.g. "Opens in 2h 15m" or "Closes in 45m" */
export function openStatusLabel(): string {
  if (isOpen()) {
    const remaining = minutesUntilClose();
    if (remaining <= 60) return `Closes in ${remaining}m`;
    const h = Math.floor(remaining / 60);
    const m = remaining % 60;
    return m > 0 ? `Closes in ${h}h ${m}m` : `Closes in ${h}h`;
  } else {
    const wait = minutesUntilOpen();
    if (wait <= 0) return 'Opening now';
    if (wait <= 60) return `Opens in ${wait}m`;
    const h = Math.floor(wait / 60);
    const m = wait % 60;
    return m > 0 ? `Opens in ${h}h ${m}m` : `Opens in ${h}h`;
  }
}

/** Returns 'Open' or 'Closed' */
export function openStatusShort(): 'Open' | 'Closed' {
  return isOpen() ? 'Open' : 'Closed';
}
