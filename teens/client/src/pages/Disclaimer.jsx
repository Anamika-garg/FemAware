import { ShieldAlert } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';

export default function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={ShieldAlert} title="Health disclaimer" />
      <Card>
        <h2 className="text-xl font-black">FemAware does not diagnose</h2>
        <p className="mt-2">
          FemAware is an educational tool. It does not diagnose, treat, cure, or prevent any medical condition, and it is not a
          medical device. The guided symptom check only suggests general next steps — like self-care, talking to a doctor, or
          getting help urgently — based on your answers.
        </p>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Always talk to a professional</h2>
        <p className="mt-2">
          If you are worried about your health, talk to a doctor, nurse, or another qualified health professional. Never ignore
          professional advice or delay getting it because of something you read here.
        </p>
      </Card>
      <Card className="border-deep bg-petal">
        <h2 className="text-xl font-black">In an emergency</h2>
        <p className="mt-2">
          Call your local emergency number (for example 911 in the US, 999 in the UK, or 112 in the EU and India) or go to the
          nearest emergency department.
        </p>
      </Card>
      <Card>
        <h2 className="text-xl font-black">About our content</h2>
        <p className="mt-2">
          Lessons and guidance are written from public health sources (such as ACOG, the NHS, and Nemours KidsHealth), which are
          listed on each page. Content marked “awaiting clinician review” has not yet been checked by a qualified clinician.
          Predictions such as your next period date are estimates and can be wrong.
        </p>
      </Card>
    </div>
  );
}
