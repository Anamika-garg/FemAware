import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarRange,
  Check,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  PencilLine,
  Plus,
  Printer,
  Save,
  Sparkles,
  Stethoscope,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { addMonths } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../lib/api';
import { formatDate, toISODate, todayISO } from '../../lib/dates';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Field from '../../components/ui/Field';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States';
import { REPORT_RANGES } from '../../lib/constants';
import { cn } from '../../lib/utils';

const severityTone = {
  mild: 'bg-rose-mist text-deep-rose',
  moderate: 'bg-soft-petal text-deep-rose',
  severe: 'bg-pink-glow text-white',
};

const DoctorReport = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [range, setRange] = useState('6');
  const [questionsText, setQuestionsText] = useState(
    (user?.clinicianQuestions || []).join('\n')
  );
  const [notes, setNotes] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedReports, setSavedReports] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);

  const dateRange = useMemo(() => {
    const to = todayISO();
    const from = toISODate(addMonths(new Date(), -Number(range)));
    return { from, to };
  }, [range]);

  const parseQuestions = () =>
    questionsText
      .split('\n')
      .map((question) => question.trim())
      .filter(Boolean)
      .slice(0, 15);

  const loadSaved = useCallback(async () => {
    try {
      const response = await api.get('/reports');
      setSavedReports(response.data.reports);
    } catch {
      // A saved-report fetch failure should not block generating a new report.
    }
  }, []);

  const generatePreview = useCallback(
    async ({ from, to, silent = false } = {}) => {
      if (silent) setLoading(true);
      else setGenerating(true);
      setError('');
      setActiveReportId(null);
      try {
        const response = await api.post('/reports/preview', {
          from: from || dateRange.from,
          to: to || dateRange.to,
        });
        setSnapshot(response.data.snapshot);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    },
    [dateRange.from, dateRange.to]
  );

  useEffect(() => {
    generatePreview({
      from: toISODate(addMonths(new Date(), -6)),
      to: todayISO(),
      silent: true,
    });
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSaved]);

  const handleGenerate = () => {
    generatePreview({ from: dateRange.from, to: dateRange.to });
  };

  const saveReport = async () => {
    if (!snapshot) return;
    setSaving(true);
    try {
      const response = await api.post('/reports', {
        from: dateRange.from,
        to: dateRange.to,
        title: `Cycle summary Â· ${formatDate(dateRange.from, 'd MMM')} â€“ ${formatDate(dateRange.to, 'd MMM yyyy')}`,
        questions: parseQuestions(),
        notes,
      });
      setActiveReportId(response.data.report._id);
      addToast({
        title: 'Report saved',
        message: 'You can reopen, print or delete it from your saved reports.',
      });
      loadSaved();
    } catch (err) {
      addToast({ type: 'error', title: 'Could not save report', message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const openSaved = async (report) => {
    setGenerating(true);
    setError('');
    try {
      const response = await api.get(`/reports/${report._id}`);
      setSnapshot(response.data.report.snapshot);
      setQuestionsText((response.data.report.questions || []).join('\n'));
      setNotes(response.data.report.notes || '');
      setActiveReportId(report._id);
      addToast({ title: 'Saved report opened', message: `${formatDate(report.rangeStart)} â€“ ${formatDate(report.rangeEnd)}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast({ type: 'error', title: 'Could not open report', message: getErrorMessage(err) });
    } finally {
      setGenerating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/reports/${deleteTarget._id}`);
      setSavedReports((current) => current.filter((item) => item._id !== deleteTarget._id));
      if (activeReportId === deleteTarget._id) setActiveReportId(null);
      setDeleteTarget(null);
      addToast({ title: 'Report deleted' });
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete report', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const downloadJson = () => {
    if (!snapshot) return;
    const payload = { ...snapshot, clinicianQuestions: parseQuestions(), notes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyclesense-report-${snapshot.rangeStart}-to-${snapshot.rangeEnd}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full skeleton" />
        <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
          <CardSkeleton rows={7} />
          <CardSkeleton rows={10} />
        </div>
      </div>
    );
  }

  const questions = parseQuestions();
  const patient = snapshot?.patient;
  const summary = snapshot?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visit preparation"
        title="Bring clarity to your next appointment."
        description="Turn months of self-reported logs into a calm, structured summary. Your clinician sees the patterns; you bring the questions that matter."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={downloadJson} disabled={!snapshot}>
              JSON
            </Button>
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!snapshot}>
              Print / PDF
            </Button>
            <Button icon={Save} onClick={saveReport} loading={saving} disabled={!snapshot}>
              Save report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4 no-print">
          <section className="card p-5" aria-labelledby="settings-title">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft-petal text-deep-rose">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 id="settings-title" className="font-display text-lg font-semibold text-deep-rose">
                  Report details
                </h2>
                <p className="text-[10px] text-muted">Choose what to include.</p>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-blush-pink bg-rose-mist p-3 text-xs text-deep-rose" role="alert">
                {error}
              </div>
            ) : null}

            <div className="mt-5">
              <p className="field-label">Date range</p>
              <div className="grid grid-cols-3 gap-1.5">
                {REPORT_RANGES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRange(item.value)}
                    aria-pressed={range === item.value}
                    className={cn(
                      'rounded-lg border px-1 py-2 text-[10px] font-bold transition-colors',
                      range === item.value && !activeReportId
                        ? 'border-pink-glow bg-pink-glow text-white'
                        : 'border-blush-pink/70 bg-white text-muted hover:border-pink-glow'
                    )}
                  >
                    {item.label.replace('Last ', '')}
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted">
                <CalendarRange className="h-3 w-3" aria-hidden="true" />
                {formatDate(dateRange.from, 'd MMM yyyy')} â€“ {formatDate(dateRange.to, 'd MMM yyyy')}
              </p>
            </div>

            <div className="mt-5">
              <Field
                label="Questions for your clinician"
                htmlFor="report-questions"
                hint="One question per line. These appear in your printed report."
                optional
              >
                <textarea
                  id="report-questions"
                  rows={4}
                  value={questionsText}
                  onChange={(event) => setQuestionsText(event.target.value)}
                  className="input-field resize-none text-xs"
                  placeholder={'My cycles vary by about a week â€” should I be tested?\nAre my severe cramps something to investigate?'}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Notes for this visit"
                htmlFor="report-notes"
                hint="Symptoms you want to describe, medicines, or context."
                optional
              >
                <textarea
                  id="report-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="input-field resize-none text-xs"
                  placeholder="e.g. I started a new job in June and my sleep changedâ€¦"
                />
              </Field>
            </div>

            <Button
              className="mt-5 w-full"
              onClick={handleGenerate}
              loading={generating}
              icon={Sparkles}
              variant="primary"
            >
              Update preview
            </Button>
            <p className="mt-2 text-center text-[9px] leading-relaxed text-muted">
              Nothing is shared automatically. You choose when and with whom.
            </p>
          </section>

          <section className="card overflow-hidden" aria-labelledby="saved-title">
            <div className="flex items-center justify-between bg-soft-petal/45 px-4 py-3">
              <div>
                <h2 id="saved-title" className="font-display text-base font-semibold text-deep-rose">
                  Saved reports
                </h2>
                <p className="text-[9px] text-muted">{savedReports.length} in your account</p>
              </div>
              <Badge tone="outline">{savedReports.length}</Badge>
            </div>
            {savedReports.length ? (
              <ul className="divide-y divide-blush-pink/40 px-4">
                {savedReports.map((report) => (
                  <li key={report._id} className="flex items-start gap-2 py-3">
                    <button
                      type="button"
                      onClick={() => openSaved(report)}
                      className={cn(
                        'min-w-0 flex-1 rounded-lg p-1 text-left transition-colors hover:bg-rose-mist/60',
                        activeReportId === report._id && 'bg-rose-mist'
                      )}
                    >
                      <p className="truncate text-[11px] font-bold text-ink">{report.title}</p>
                      <p className="mt-0.5 text-[9px] text-muted">
                        {formatDate(report.rangeStart, 'd MMM')} â€“ {formatDate(report.rangeEnd, 'd MMM yyyy')}
                      </p>
                      <p className="text-[9px] text-muted">
                        Saved {formatDate(report.generatedAt, 'd MMM yyyy')}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(report)}
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                      aria-label={`Delete saved report ${report.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-[10px] leading-relaxed text-muted">
                Saved reports live here for easy reprinting. Create one, then choose â€œSave reportâ€.
              </p>
            )}
          </section>

          <div className="flex items-start gap-2 rounded-xl border border-blush-pink/60 bg-white/70 p-3.5">
            <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-pink-glow" aria-hidden="true" />
            <p className="text-[10px] leading-relaxed text-muted">
              This report is a record of what you logged, not a medical opinion. It is designed to
              support â€” not replace â€” a conversation with a qualified clinician.
            </p>
          </div>
        </aside>

        <section className="min-w-0" aria-labelledby="preview-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <h2 id="preview-title" className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Live preview
              </h2>
              {activeReportId ? <Badge tone="calm" icon={Check}>Saved report</Badge> : <Badge tone="pink">Preview</Badge>}
            </div>
            <p className="text-[10px] text-muted">A4 Â· Print or save as PDF from your browser</p>
          </div>

          {snapshot ? (
            <article className="print-report overflow-hidden rounded-2xl border border-blush-pink/60 bg-white shadow-card">
              <header className="border-b-4 border-deep-rose px-6 pb-5 pt-6 sm:px-9 sm:pt-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-pink-glow">
                      CycleSense Â· Health summary
                    </p>
                    <h1 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight text-deep-rose sm:text-3xl">
                      Cycle &amp; symptom report
                    </h1>
                    <p className="mt-1 text-xs text-muted">
                      Prepared for a clinical conversation Â· Not a diagnosis
                    </p>
                  </div>
                  <div className="text-right text-[10px] leading-relaxed text-muted">
                    <p className="font-bold text-deep-rose">Report date</p>
                    <p>{formatDate(snapshot.generatedAt, 'd MMMM yyyy')}</p>
                    <p className="mt-2 font-bold text-deep-rose">Reporting period</p>
                    <p>
                      {formatDate(snapshot.rangeStart, 'd MMM yyyy')} â€“{' '}
                      {formatDate(snapshot.rangeEnd, 'd MMM yyyy')}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-xl bg-rose-mist/70 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted">Patient</p>
                    <p className="mt-0.5 text-sm font-bold text-deep-rose">{patient?.name}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted">Age</p>
                    <p className="mt-0.5 text-sm font-bold text-deep-rose">{patient?.age || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted">Focus areas</p>
                    <p className="mt-0.5 text-xs font-semibold capitalize text-deep-rose">
                      {(patient?.lifeStages || []).join(', ')}
                    </p>
                  </div>
                </div>
              </header>

              <div className="space-y-7 px-6 py-6 sm:px-9 sm:py-8">
                <section className="print-avoid-break" aria-labelledby="summary-heading">
                  <h2 id="summary-heading" className="font-display text-base font-semibold text-deep-rose">
                    1. Cycle summary
                  </h2>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: 'Average cycle', value: `${summary.averageCycleLength} days` },
                      { label: 'Average period', value: `${summary.averagePeriodLength} days` },
                      { label: 'Variation', value: `Â±${summary.variation} days` },
                      { label: 'Regularity', value: summary.regularity },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-blush-pink/60 bg-rose-mist/50 p-2.5">
                        <p className="text-[8px] font-bold uppercase tracking-wide text-muted">{item.label}</p>
                        <p className="mt-0.5 text-xs font-bold capitalize text-deep-rose">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-muted">
                    Based on {summary.cyclesLogged} logged cycles and {summary.symptomsLogged} symptom
                    entries. {summary.regularity === 'regular'
                      ? 'Cycle lengths are relatively consistent.'
                      : 'Cycle timing shows some variability across the reporting period.'}
                  </p>
                </section>

                <section className="print-avoid-break" aria-labelledby="cycles-heading">
                  <h2 id="cycles-heading" className="font-display text-base font-semibold text-deep-rose">
                    2. Period history
                  </h2>
                  {snapshot.cycles.length ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[520px] border-collapse text-left text-[10px]">
                        <thead>
                          <tr className="bg-soft-petal/70 text-deep-rose">
                            <th className="rounded-l-md px-2.5 py-2 font-bold">Start</th>
                            <th className="px-2.5 py-2 font-bold">End</th>
                            <th className="px-2.5 py-2 font-bold">Cycle length</th>
                            <th className="px-2.5 py-2 font-bold">Bleeding days</th>
                            <th className="rounded-r-md px-2.5 py-2 font-bold">Flow</th>
                          </tr>
                        </thead>
                        <tbody>
                          {snapshot.cycles.map((cycle) => (
                            <tr key={cycle.id || `${cycle.startDate}-${cycle.endDate}`} className="border-b border-blush-pink/40">
                              <td className="px-2.5 py-2 font-semibold text-ink">{formatDate(cycle.startDate, 'd MMM yyyy')}</td>
                              <td className="px-2.5 py-2 text-muted">{cycle.endDate ? formatDate(cycle.endDate, 'd MMM yyyy') : 'Ongoing'}</td>
                              <td className="px-2.5 py-2 text-muted">{cycle.cycleLength ? `${cycle.cycleLength} days` : 'â€”'}</td>
                              <td className="px-2.5 py-2 text-muted">{cycle.periodLength ? `${cycle.periodLength} days` : 'â€”'}</td>
                              <td className="px-2.5 py-2 capitalize text-deep-rose">{cycle.flow}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-2 rounded-lg bg-rose-mist/60 p-3 text-[10px] text-muted">
                      No period entries were recorded within this reporting window.
                    </p>
                  )}
                </section>

                <section className="print-avoid-break" aria-labelledby="symptoms-heading">
                  <h2 id="symptoms-heading" className="font-display text-base font-semibold text-deep-rose">
                    3. Symptom patterns
                  </h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Most frequent physical symptoms</p>
                      {snapshot.topPhysical.length ? (
                        <ul className="mt-2 space-y-1.5">
                          {snapshot.topPhysical.map((item) => (
                            <li key={item.name} className="flex items-center justify-between gap-2 text-[10px]">
                              <span className="text-ink">{item.name}</span>
                              <span className="flex items-center gap-1.5">
                                <span className={cn('rounded-full px-1.5 py-0.5 text-[8px] font-bold capitalize', severityTone[item.worstSeverity])}>
                                  {item.worstSeverity}
                                </span>
                                <span className="font-bold text-deep-rose">{item.count}Ã—</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-[10px] italic text-muted">No physical symptoms in this period.</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Mood &amp; flow</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {snapshot.topMood.length ? (
                          snapshot.topMood.map((item) => (
                            <span key={item.name} className="rounded-full bg-rose-mist px-2 py-0.5 text-[9px] font-semibold text-deep-rose">
                              {item.name} Â· {item.count}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] italic text-muted">No moods logged.</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {snapshot.flowDistribution.length ? (
                          snapshot.flowDistribution.map((item) => (
                            <span key={item.name} className="rounded-full border border-blush-pink/70 px-2 py-0.5 text-[9px] font-semibold capitalize text-deep-rose">
                              {item.name}: {item.count}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] italic text-muted">No flow data.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="print-avoid-break" aria-labelledby="conversation-heading">
                  <h2 id="conversation-heading" className="font-display text-base font-semibold text-deep-rose">
                    4. Conversation starters &amp; notes
                  </h2>
                  <div className="mt-3 rounded-xl border border-blush-pink/60 p-4">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted">
                      <ClipboardList className="h-3 w-3" aria-hidden="true" />
                      Questions for my clinician
                    </p>
                    {questions.length ? (
                      <ol className="mt-2 space-y-1.5 pl-4 text-[10px] leading-relaxed text-ink" style={{ listStyle: 'decimal' }}>
                        {questions.map((question, index) => (
                          <li key={`${question}-${index}`}>{question}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-1.5 text-[10px] italic text-muted">
                        No questions added yet. Use the panel to prepare.
                      </p>
                    )}

                    <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-muted">
                      Patterns worth discussing
                    </p>
                    <ul className="mt-1.5 space-y-1 pl-4 text-[10px] leading-relaxed text-ink" style={{ listStyle: 'disc' }}>
                      {snapshot.discussionPoints.map((point, index) => (
                        <li key={`${point}-${index}`}>{point}</li>
                      ))}
                    </ul>

                    {notes ? (
                      <>
                        <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-muted">My notes</p>
                        <p className="mt-1 whitespace-pre-line text-[10px] leading-relaxed text-ink">{notes}</p>
                      </>
                    ) : null}

                    {snapshot.flags?.heavyFlowReports || snapshot.flags?.prolongedBleeding || snapshot.flags?.severeSymptoms?.length ? (
                      <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-mist p-2.5">
                        <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-deep-rose" aria-hidden="true" />
                        <p className="text-[9px] leading-relaxed text-deep-rose/80">
                          This report includes logged heavy flow, prolonged bleeding, or severe symptoms.
                          These are worth raising at your appointment.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <footer className="border-t border-blush-pink/50 pt-4">
                  <p className="text-[8px] leading-relaxed text-muted">{snapshot.disclaimer}</p>
                  <p className="mt-2 text-[8px] text-muted">
                    Generated by CycleSense on {formatDate(snapshot.generatedAt, 'd MMMM yyyy')} Â· Data entered by the patient.
                  </p>
                </footer>
              </div>
            </article>
          ) : (
            <EmptyState
              icon={FileText}
              title="No preview yet"
              description="Choose a date range and update the preview to build your summary."
              action={
                <Button onClick={handleGenerate} loading={generating} icon={Sparkles}>
                  Generate report
                </Button>
              }
            />
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this saved report?"
        description="The saved snapshot will be removed. Your underlying cycle and symptom logs stay safe."
        confirmLabel="Delete report"
        loading={deleting}
      />
    </div>
  );
};

export default DoctorReport;
