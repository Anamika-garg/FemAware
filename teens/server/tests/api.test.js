import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { seedContent } from '../src/scripts/seedContent.js';
import {
  AssessmentSession,
  CycleEntry,
  DemoSession,
  GuidanceContent,
  LearningModule,
} from '../src/models/index.js';
import { isoDay, newVisitor, useTestDatabase } from './helpers.js';

useTestDatabase();
const app = createApp();

describe('demo sessions', () => {
  it('issues an httpOnly cookie and stores only a token hash', async () => {
    const res = await request(app).post('/api/session').set('X-FemAware-Client', '1').expect(201);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^fa_sid=/);
    expect(cookie).toMatch(/HttpOnly/i);
    const token = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
    const stored = await DemoSession.findOne().lean();
    expect(stored.tokenHash).not.toBe(token);
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(res.body.session.dataMode).toBe('demo');
  });

  it('resumes an existing session instead of creating a new one', async () => {
    const visitor = await newVisitor(app);
    const res = await visitor.post('/api/session').expect(200);
    expect(res.body.resumed).toBe(true);
    expect(await DemoSession.countDocuments()).toBe(1);
  });

  it('rejects owned endpoints without a session', async () => {
    await request(app).get('/api/cycles').expect(401);
    await request(app).get('/api/cycles').set('Cookie', 'fa_sid=forged-token-value-that-is-long-enough-xx').expect(401);
  });

  it('rejects state-changing requests without the client header (CSRF guard)', async () => {
    const visitor = await newVisitor(app);
    await visitor.agent.post('/api/cycles').send({ startDate: isoDay(-3) }).expect(403);
  });
});

describe('cycle entries CRUD', () => {
  it('creates, reads, updates and deletes a period entry', async () => {
    const v = await newVisitor(app);
    const created = await v.post('/api/cycles').send({ startDate: isoDay(-5), endDate: isoDay(-1), flow: 'medium' }).expect(201);
    const { id } = created.body.item;
    expect(created.body.item).not.toHaveProperty('owner');
    expect(created.body.item.dataMode).toBe('demo');

    const list = await v.get('/api/cycles').expect(200);
    expect(list.body.items).toHaveLength(1);

    const updated = await v.patch(`/api/cycles/${id}`).send({ flow: 'heavy' }).expect(200);
    expect(updated.body.item.flow).toBe('heavy');

    await v.delete(`/api/cycles/${id}`).expect(204);
    await v.get(`/api/cycles/${id}`).expect(404);
  });

  it('filters by date range', async () => {
    const v = await newVisitor(app);
    await v.post('/api/cycles').send({ startDate: isoDay(-60) }).expect(201);
    await v.post('/api/cycles').send({ startDate: isoDay(-10) }).expect(201);
    const res = await v.get(`/api/cycles?from=${isoDay(-20)}`).expect(200);
    expect(res.body.items).toHaveLength(1);
    await v.get('/api/cycles?from=not-a-date').expect(400);
  });

  it.each([
    [{}, 'startDate'],
    [{ startDate: isoDay(-2), endDate: isoDay(-5) }, 'endDate'],
    [{ startDate: isoDay(-20), endDate: isoDay(-1) }, 'endDate'],
    [{ startDate: isoDay(10) }, 'startDate'],
    [{ startDate: isoDay(-2), flow: 'torrential' }, 'flow'],
  ])('rejects invalid entry %j', async (body, field) => {
    const v = await newVisitor(app);
    const res = await v.post('/api/cycles').send(body).expect(400);
    expect(res.body.details).toHaveProperty(field);
  });

  it('validates updates too', async () => {
    const v = await newVisitor(app);
    const { body } = await v.post('/api/cycles').send({ startDate: isoDay(-3) }).expect(201);
    await v.patch(`/api/cycles/${body.item.id}`).send({ endDate: isoDay(-6) }).expect(400);
    await v.patch('/api/cycles/not-an-id').send({ flow: 'light' }).expect(400);
  });
});

describe('symptom logs CRUD', () => {
  it('creates, lists, updates and deletes a log', async () => {
    const v = await newVisitor(app);
    const { body } = await v
      .post('/api/symptoms')
      .send({ date: isoDay(-1), symptoms: ['cramps', 'fatigue'], severity: 3, notes: 'Heat pad helped' })
      .expect(201);
    expect(body.item).toMatchObject({ symptoms: ['cramps', 'fatigue'], severity: 3, notes: 'Heat pad helped' });

    const patched = await v.patch(`/api/symptoms/${body.item.id}`).send({ severity: 4 }).expect(200);
    expect(patched.body.item.severity).toBe(4);

    expect((await v.get('/api/symptoms').expect(200)).body.items).toHaveLength(1);
    await v.delete(`/api/symptoms/${body.item.id}`).expect(204);
    expect((await v.get('/api/symptoms').expect(200)).body.items).toHaveLength(0);
  });

  it.each([
    [{ date: isoDay(-1), symptoms: [], severity: 3 }, 'symptoms'],
    [{ date: isoDay(-1), symptoms: ['cramps', 'cramps'], severity: 3 }, 'symptoms'],
    [{ date: isoDay(-1), symptoms: ['telepathy'], severity: 3 }, 'symptoms.0'],
    [{ date: isoDay(-1), symptoms: ['cramps'], severity: 6 }, 'severity'],
    [{ date: isoDay(-1), symptoms: ['cramps'], severity: 2.5 }, 'severity'],
    [{ date: isoDay(-1), symptoms: ['cramps'], severity: 2, notes: 'x'.repeat(501) }, 'notes'],
    [{ symptoms: ['cramps'], severity: 2 }, 'date'],
  ])('rejects invalid log %#', async (body, field) => {
    const v = await newVisitor(app);
    const res = await v.post('/api/symptoms').send(body).expect(400);
    expect(res.body.details).toHaveProperty(field);
  });
});

describe('data ownership', () => {
  it("prevents one session from reading, editing or deleting another session's data", async () => {
    const alice = await newVisitor(app);
    const bob = await newVisitor(app);
    const { body } = await alice.post('/api/cycles').send({ startDate: isoDay(-4) }).expect(201);
    const id = body.item.id;

    expect((await bob.get('/api/cycles').expect(200)).body.items).toHaveLength(0);
    await bob.get(`/api/cycles/${id}`).expect(404);
    await bob.patch(`/api/cycles/${id}`).send({ flow: 'heavy' }).expect(404);
    await bob.delete(`/api/cycles/${id}`).expect(404);

    const still = await alice.get(`/api/cycles/${id}`).expect(200);
    expect(still.body.item.flow).toBeUndefined();
  });

  it('ignores client-supplied owner, userId, dataMode and expiresAt', async () => {
    const alice = await newVisitor(app);
    const bob = await newVisitor(app);
    const aliceSession = (await DemoSession.find().sort({ createdAt: 1 }))[0];
    const far = new Date(Date.now() + 1000 * 86_400_000);

    const { body } = await bob
      .post('/api/cycles')
      .send({ startDate: isoDay(-2), owner: aliceSession._id, userId: aliceSession._id, dataMode: 'production', expiresAt: far })
      .expect(201);

    const doc = await CycleEntry.findById(body.item.id).lean();
    expect(doc.owner.equals(aliceSession._id)).toBe(false);
    expect(doc.dataMode).toBe('demo');
    expect(doc.expiresAt.getTime()).toBeLessThan(far.getTime());
    expect((await alice.get('/api/cycles').expect(200)).body.items).toHaveLength(0);
  });

  it('cannot reassign an entry to another owner via PATCH', async () => {
    const v = await newVisitor(app);
    const { body } = await v.post('/api/cycles').send({ startDate: isoDay(-2) }).expect(201);
    const other = new mongoose.Types.ObjectId();
    await v.patch(`/api/cycles/${body.item.id}`).send({ owner: other }).expect(200);
    const doc = await CycleEntry.findById(body.item.id).lean();
    expect(doc.owner.equals(other)).toBe(false);
  });
});

describe('learning modules and quizzes', () => {
  it('lists modules publicly without exposing quiz answers', async () => {
    const list = await request(app).get('/api/learning/modules').expect(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(6);
    const detail = await request(app).get(`/api/learning/modules/${list.body.items[0].slug}`).expect(200);
    const serialized = JSON.stringify(detail.body);
    expect(serialized).not.toContain('correctIndex');
    expect(serialized).not.toContain('explanation');
    expect(detail.body.item.reviewStatus).toBe('pending_clinical_review');
  });

  it('scores quizzes server-side and saves progress for a session', async () => {
    const v = await newVisitor(app);
    const { body: lesson } = await v.get('/api/learning/modules/menstrual-cycle-basics').expect(200);
    expect(lesson.item.quiz).toHaveLength(4);

    const res = await v.post('/api/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [1, 1, 0, 1] }).expect(200);
    expect(res.body).toMatchObject({ score: 100, passed: true, saved: true, xpGained: 50 });
    expect(res.body.newAchievements.map((a) => a.code)).toEqual(['first_steps', 'perfect_score']);

    const wrong = await v.post('/api/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [0, 0, 1, 0] }).expect(200);
    expect(wrong.body).toMatchObject({ score: 0, passed: false, xpGained: 0 });

    const progress = await v.get('/api/learning/progress').expect(200);
    expect(progress.body.progress).toMatchObject({ xp: 50, totalModules: 6 });
    expect(progress.body.progress.completedModules[0]).toMatchObject({ bestScore: 100, lastScore: 0, attempts: 2 });
  });

  it('scores without saving when there is no session', async () => {
    const res = await request(app)
      .post('/api/learning/modules/menstrual-cycle-basics/quiz')
      .set('X-FemAware-Client', '1')
      .send({ answers: [1, 1, 0, 0] })
      .expect(200);
    expect(res.body).toMatchObject({ score: 75, saved: false });
  });

  it('rejects malformed quiz submissions', async () => {
    const v = await newVisitor(app);
    await v.post('/api/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [1, 1] }).expect(400);
    await v.post('/api/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [9, 1, 0, 1] }).expect(400);
    await v.post('/api/learning/modules/nope/quiz').send({ answers: [] }).expect(404);
  });
});

describe('guided assessments', () => {
  const urgentCramps = {
    painLevel: 8,
    interferesWithDaily: 'yes',
    reliefWithMedication: 'no',
    painOutsidePeriod: 'no',
    gettingWorse: 'no',
    heavyBleeding: 'no',
    redFlags: ['fainting', 'possible_pregnancy'],
  };

  it('serves question definitions publicly', async () => {
    const res = await request(app).get('/api/assessments/questions/cramps').expect(200);
    expect(res.body.questions.map((q) => q.id)).toContain('redFlags');
    await request(app).get('/api/assessments/questions/unknown').expect(400);
  });

  it('returns urgent guidance and stores only minimal, non-sensitive results', async () => {
    const v = await newVisitor(app);
    const res = await v.post('/api/assessments').send({ type: 'cramps', answers: urgentCramps }).expect(201);
    expect(res.body.level).toBe('urgent');
    expect(res.body.guidance.title).toMatch(/medical help now/i);
    expect(res.body.guidance.body).toMatch(/emergency/i);
    expect(res.body.guidance.reasons.map((r) => r.code)).toEqual(['fainting', 'pregnancy_with_severe_pain']);

    const stored = await AssessmentSession.findById(res.body.item.id).lean();
    expect(stored.result).toEqual({ level: 'urgent', reasonCodes: ['fainting'] });
    expect(stored).not.toHaveProperty('answers');
    expect(JSON.stringify(stored)).not.toMatch(/pregnan|painLevel/);
  });

  it('gives guidance without a session but saves nothing', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .set('X-FemAware-Client', '1')
      .send({ type: 'cramps', answers: urgentCramps })
      .expect(200);
    expect(res.body).toMatchObject({ level: 'urgent', saved: false, item: null });
    expect(await AssessmentSession.countDocuments()).toBe(0);
  });

  it('rejects invalid answers', async () => {
    const v = await newVisitor(app);
    const res = await v.post('/api/assessments').send({ type: 'cramps', answers: { painLevel: 50 } }).expect(400);
    expect(res.body.details).toHaveProperty('painLevel');
    await v.post('/api/assessments').send({ type: 'other', answers: {} }).expect(400);
  });

  it('keeps assessment history private to the session', async () => {
    const alice = await newVisitor(app);
    const bob = await newVisitor(app);
    const { body } = await alice.post('/api/assessments').send({ type: 'cramps', answers: { ...urgentCramps, redFlags: [] } }).expect(201);
    expect((await bob.get('/api/assessments').expect(200)).body.items).toHaveLength(0);
    await bob.delete(`/api/assessments/${body.item.id}`).expect(404);
    await alice.delete(`/api/assessments/${body.item.id}`).expect(204);
  });
});

describe('insights, demo data and deletion', () => {
  it('loads synthetic demo data and computes insights', async () => {
    const v = await newVisitor(app);
    const loaded = await v.post('/api/session/demo-data').expect(201);
    expect(loaded.body.loaded.cycles).toBe(6);

    const res = await v.get('/api/insights').expect(200);
    expect(res.body.insights.cycle.periodsLogged).toBe(6);
    expect(res.body.insights.cycle.averageCycleLength).toBeCloseTo(31.6, 1);
    expect(res.body.insights.symptoms.totalLogs).toBeGreaterThan(0);
  });

  it('downloads a plain-text summary', async () => {
    const v = await newVisitor(app);
    await v.post('/api/session/demo-data').expect(201);
    const res = await v.get('/api/insights/summary').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="femaware-summary-/);
    expect(res.text).toContain('FemAware Health Summary');
    expect(res.text).toContain('not a diagnosis');
  });

  it('deletes all of a session’s data and ends the session', async () => {
    const v = await newVisitor(app);
    const other = await newVisitor(app);
    await other.post('/api/cycles').send({ startDate: isoDay(-3) }).expect(201);
    await v.post('/api/session/demo-data').expect(201);
    await v.post('/api/learning/modules/body-safety/quiz').send({ answers: [1, 1, 0] }).expect(200);

    const res = await v.delete('/api/session').expect(200);
    expect(res.body.deleted.cycles).toBe(6);
    expect(res.body.deleted.progress).toBe(1);
    await v.get('/api/cycles').expect(401);

    // Other visitors are unaffected.
    expect((await other.get('/api/cycles').expect(200)).body.items).toHaveLength(1);
  });
});

describe('production content gate', () => {
  const calm = {
    painLevel: 2,
    interferesWithDaily: 'no',
    reliefWithMedication: 'yes',
    painOutsidePeriod: 'no',
    gettingWorse: 'no',
    heavyBleeding: 'no',
    redFlags: [],
  };

  afterEach(() => {
    config.allowUnreviewedGuidance = true;
  });

  it('is reported by the health endpoint', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', dataMode: 'demo', unreviewedGuidanceAllowed: true });
  });

  it('serves only clinician-reviewed content when unreviewed content is disallowed', async () => {
    config.allowUnreviewedGuidance = false;
    const v = await newVisitor(app);

    expect((await request(app).get('/api/learning/modules').expect(200)).body.items).toHaveLength(0);
    await v.post('/api/assessments').send({ type: 'cramps', answers: calm }).expect(503);

    await LearningModule.updateOne(
      { slug: 'body-safety' },
      { reviewStatus: 'clinician_reviewed', reviewedBy: 'Test Reviewer, MD', reviewedAt: new Date() },
    );
    await GuidanceContent.updateMany({}, { reviewStatus: 'clinician_reviewed', reviewedBy: 'Test Reviewer, MD', reviewedAt: new Date() });

    const modules = await request(app).get('/api/learning/modules').expect(200);
    expect(modules.body.items.map((m) => m.slug)).toEqual(['body-safety']);
    const res = await v.post('/api/assessments').send({ type: 'cramps', answers: calm }).expect(201);
    expect(res.body.guidance.reviewStatus).toBe('clinician_reviewed');
  });

  it('requires a reviewer name and date to mark content as reviewed', async () => {
    const module = await LearningModule.findOne({ slug: 'body-safety' });
    module.reviewStatus = 'clinician_reviewed';
    await expect(module.save()).rejects.toThrow(/reviewedBy/);
  });

  it('resets review status when re-seeded content changes', async () => {
    await LearningModule.updateOne(
      { slug: 'body-safety' },
      { reviewStatus: 'clinician_reviewed', reviewedBy: 'Dr Test', reviewedAt: new Date(), summary: 'edited by hand' },
    );
    const result = await seedContent();
    expect(result.updated).toBe(1);
    const module = await LearningModule.findOne({ slug: 'body-safety' }).lean();
    expect(module).toMatchObject({ reviewStatus: 'pending_clinical_review', version: 2 });
    expect(module.reviewedBy).toBeUndefined();
  });

  it('keeps sign-off for unchanged content on re-seed', async () => {
    await LearningModule.updateOne(
      { slug: 'body-safety' },
      { reviewStatus: 'clinician_reviewed', reviewedBy: 'Dr Test', reviewedAt: new Date() },
    );
    const result = await seedContent();
    expect(result.updated).toBe(0);
    expect((await LearningModule.findOne({ slug: 'body-safety' })).reviewStatus).toBe('clinician_reviewed');
  });
});
