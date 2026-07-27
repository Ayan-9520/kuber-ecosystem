export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Minimum matchScore to treat a line as matched (EXACT or PROBABLE). */
export const MATCH_SCORE_THRESHOLD = 50;

/** Amount tolerance ratio for PAN / fuzzy name matching (2%). */
export const AMOUNT_TOLERANCE_RATIO = 0.02;

/** Absolute amount tolerance floor (₹). */
export const AMOUNT_TOLERANCE_ABS = 1;

export const MATCH_REVIEW_TRANSITIONS: Record<
  string,
  Array<'accept' | 'dispute' | 'write-off' | 'resolve'>
> = {
  PENDING_REVIEW: ['accept', 'dispute', 'write-off'],
  ACCEPTED: ['dispute', 'write-off'],
  DISPUTED: ['resolve', 'write-off', 'accept'],
  WRITTEN_OFF: [],
  RESOLVED: ['dispute'],
};
