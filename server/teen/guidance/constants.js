export const ASSESSMENT_TYPES = ['cramps', 'irregular'];

// Ordered from least to most urgent.
export const GUIDANCE_LEVELS = ['self_care', 'see_doctor', 'urgent'];

/**
 * Version of the rule set + guidance copy. Bump whenever rules.js or the
 * assessment guidance content changes, and re-run clinical review.
 */
export const GUIDANCE_VERSION = '2026.10-draft.1';

/** Reason codes that are too sensitive to persist (minimum necessary). */
export const SENSITIVE_REASON_CODES = new Set(['possible_pregnancy', 'pregnancy_with_severe_pain']);
