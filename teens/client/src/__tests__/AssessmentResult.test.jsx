import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AssessmentResult } from '../components/AssessmentResult';

const guidance = (overrides = {}) => ({
  title: 'Please get medical help now',
  body: 'Call your local emergency number.',
  actions: ['Tell a trusted adult right now.'],
  sources: [{ title: 'Period pain', publisher: 'NHS', url: 'https://www.nhs.uk/conditions/period-pain/' }],
  reviewStatus: 'pending_clinical_review',
  reasons: [
    { code: 'fainting', text: 'Fainting needs checking right away.' },
    { code: 'unknown', text: null },
  ],
  ...overrides,
});

describe('AssessmentResult', () => {
  it('announces urgent guidance as an alert', () => {
    render(<AssessmentResult level="urgent" guidance={guidance()} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Get help now');
    expect(alert).toHaveTextContent('Please get medical help now');
    expect(screen.getByText('Fainting needs checking right away.')).toBeInTheDocument();
  });

  it('uses a status role for non-urgent guidance and always shows the non-diagnosis notice', () => {
    render(<AssessmentResult level="self_care" guidance={guidance({ title: 'Common cramps', reasons: [] })} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Common cramps');
    expect(screen.getByText(/not a diagnosis/i)).toBeInTheDocument();
    expect(screen.getByText(/awaiting clinician review/i)).toBeInTheDocument();
  });
});
