export const REVIEW_STATUSES = ['draft', 'pending_clinical_review', 'clinician_reviewed', 'retired'];

export const reviewFields = {
  reviewStatus: {
    type: String,
    enum: REVIEW_STATUSES,
    default: 'pending_clinical_review',
    index: true,
  },
  reviewedBy: { type: String, trim: true },
  reviewedAt: { type: Date },
};

export const sourceSchemaDefinition = {
  title: { type: String, required: true, trim: true },
  publisher: { type: String, required: true, trim: true },
  url: {
    type: String,
    required: true,
    match: [/^https:\/\//, 'source url must use https'],
  },
};

export function validateReviewed(schema) {
  schema.pre('validate', function requireReviewer(next) {
    if (this.reviewStatus === 'clinician_reviewed' && (!this.reviewedBy || !this.reviewedAt)) {
      this.invalidate('reviewedBy', 'clinician_reviewed content needs reviewedBy and reviewedAt');
    }
    next();
  });
}
