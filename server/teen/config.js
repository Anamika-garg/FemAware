const env = process.env;

/**
 * Teen lessons and guided-check guidance must be clinician reviewed before
 * production serves them. Outside production, drafts are shown with a notice.
 * Kept as a mutable object so tests can flip the gate.
 */
export const teenConfig = {
  allowUnreviewedGuidance: env.ALLOW_UNREVIEWED_GUIDANCE
    ? env.ALLOW_UNREVIEWED_GUIDANCE === 'true'
    : env.NODE_ENV !== 'production',
};

/** Mongo filter for lessons and guidance that may be served right now. */
export const servableFilter = () =>
  teenConfig.allowUnreviewedGuidance
    ? { reviewStatus: { $in: ['pending_clinical_review', 'clinician_reviewed'] } }
    : { reviewStatus: 'clinician_reviewed' };
