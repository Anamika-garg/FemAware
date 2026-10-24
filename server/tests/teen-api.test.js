import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { teenConfig } from '../teen/config.js';
import { seedContent } from '../teen/seedContent.js';
import { GuidanceContent, LearningModule, TeenAssessment, TeenCycleEntry } from '../teen/models/index.js';
import { app, isoDay, newUser, useTestDatabase } from './helpers.js';

useTestDatabase();

describe('authentication', () => {
  it('rejects teen endpoints without a signed-in account', async () => {
    const res = await request(app).get('/api/teen/cycles').expect(401);
    expect(res.body.error).toMatch(/sign in/i);
    await request(app).get('/api/teen/learning/modules').set('Authorization', 'Bearer not-a-real-token').expect(401);
  });
});

describe('cycle entries CRUD', () => {
  it('creates, reads, updates and deletes a period entry', async () => {
    const v = await newUser();
    const created = await v.post('/api/teen/cycles').send({ startDate: isoDay(-5), endDate: isoDay(-1), flow: 'medium' }).expect(201);
    const { id } = created.body.item;
    expect(created.body.item).not.toHaveProperty('owner');

    const list = await v.get('/api/teen/cycles').expect(200);
    expect(list.body.items).toHaveLength(1);

    const updated = await v.patch(`/api/teen/cycles/${id}`).send({ flow: 'heavy' }).expect(200);
    expect(updated.body.item.flow).toBe('heavy');

    await v.delete(`/api/teen/cycles/${id}`).expect(204);
    await v.get(`/api/teen/cycles/${id}`).expect(404);
  });

  it('filters by date range', async () => {
    const v = await newUser();
    await v.post('/api/teen/cycles').send({ startDate: isoDay(-60) }).expect(201);
    await v.post('/api/teen/cycles').send({ startDate: isoDay(-10) }).expect(201);
    const res = await v.get(`/api/teen/cycles?from=${isoDay(-20)}`).expect(200);
    expect(res.body.items).toHaveLength(1);
    await v.get('/api/teen/cycles?from=not-a-date').expect(400);
  });

  it.each([
    [{}, 'startDate'],
    [{ startDate: isoDay(-2), endDate: isoDay(-5) }, 'endDate'],
    [{ startDate: isoDay(-20), endDate: isoDay(-1) }, 'endDate'],
    [{ startDate: isoDay(10) }, 'startDate'],
    [{ startDate: isoDay(-2), flow: 'torrential' }, 'flow'],
  ])('rejects invalid entry %j', async (body, field) => {
    const v = await newUser();
    const res = await v.post('/api/teen/cycles').send(body).expect(400);
    expect(res.body.details).toHaveProperty(field);
  });
});

describe('symptom logs CRUD', () => {
  it('creates, lists, updates and deletes a log', async () => {
    const v = await newUser();
    const { body } = await v
      .post('/api/teen/symptoms')
      .send({ date: isoDay(-1), symptoms: ['cramps', 'fatigue'], severity: 3, notes: 'Heat pad helped' })
      .expect(201);
    expect(body.item).toMatchObject({ symptoms: ['cramps', 'fatigue'], severity: 3, notes: 'Heat pad helped' });

    const patched = await v.patch(`/api/teen/symptoms/${body.item.id}`).send({ severity: 4 }).expect(200);
    expect(patched.body.item.severity).toBe(4);

    expect((await v.get('/api/teen/symptoms').expect(200)).body.items).toHaveLength(1);
    await v.delete(`/api/teen/symptoms/${body.item.id}`).expect(204);
    expect((await v.get('/api/teen/symptoms').expect(200)).body.items).toHaveLength(0);
  });

  it.each([
    [{ date: isoDay(-1), symptoms: [], severity: 3 }, 'symptoms'],
    [{ date: isoDay(-1), symptoms: ['telepathy'], severity: 3 }, 'symptoms.0'],
    [{ date: isoDay(-1), symptoms: ['cramps'], severity: 6 }, 'severity'],
    [{ symptoms: ['cramps'], severity: 2 }, 'date'],
  ])('rejects invalid log %#', async (body, field) => {
    const v = await newUser();
    const res = await v.post('/api/teen/symptoms').send(body).expect(400);
    expect(res.body.details).toHaveProperty(field);
  });
});

describe('data ownership', () => {
  it("prevents one account from reading, editing or deleting another account's data", async () => {
    const alice = await newUser();
    const bob = await newUser();
    const { body } = await alice.post('/api/teen/cycles').send({ startDate: isoDay(-4) }).expect(201);
    const id = body.item.id;

    expect((await bob.get('/api/teen/cycles').expect(200)).body.items).toHaveLength(0);
    await bob.get(`/api/teen/cycles/${id}`).expect(404);
    await bob.patch(`/api/teen/cycles/${id}`).send({ flow: 'heavy' }).expect(404);
    await bob.delete(`/api/teen/cycles/${id}`).expect(404);
    await alice.get(`/api/teen/cycles/${id}`).expect(200);
  });

  it('ignores a client-supplied owner and cannot reassign one via PATCH', async () => {
    const alice = await newUser();
    const bob = await newUser();
    const { body } = await bob
      .post('/api/teen/cycles')
      .send({ startDate: isoDay(-2), owner: alice.user._id })
      .expect(201);
    await bob.patch(`/api/teen/cycles/${body.item.id}`).send({ owner: new mongoose.Types.ObjectId() }).expect(200);

    const doc = await TeenCycleEntry.findById(body.item.id).lean();
    expect(String(doc.owner)).toBe(String(bob.user._id));
    expect((await alice.get('/api/teen/cycles').expect(200)).body.items).toHaveLength(0);
  });
});

describe('learning modules and quizzes', () => {
  it('lists modules without exposing quiz answers', async () => {
    const v = await newUser();
    const list = await v.get('/api/teen/learning/modules').expect(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(6);
    const detail = await v.get(`/api/teen/learning/modules/${list.body.items[0].slug}`).expect(200);
    const serialized = JSON.stringify(detail.body);
    expect(serialized).not.toContain('correctIndex');
    expect(serialized).not.toContain('explanation');
  });

  it('scores quizzes server-side and saves progress to the account', async () => {
    const v = await newUser();
    const res = await v.post('/api/teen/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [1, 1, 0, 1] }).expect(200);
    expect(res.body).toMatchObject({ score: 100, passed: true, saved: true, xpGained: 50 });
    expect(res.body.newAchievements.map((a) => a.code)).toEqual(['first_steps', 'perfect_score']);

    const wrong = await v.post('/api/teen/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [0, 0, 1, 0] }).expect(200);
    expect(wrong.body).toMatchObject({ score: 0, passed: false, xpGained: 0 });

    const progress = await v.get('/api/teen/learning/progress').expect(200);
    expect(progress.body.progress).toMatchObject({ xp: 50, totalModules: 6 });
    expect(progress.body.progress.completedModules[0]).toMatchObject({ bestScore: 100, lastScore: 0, attempts: 2 });
  });

  it('rejects malformed quiz submissions', async () => {
    const v = await newUser();
    await v.post('/api/teen/learning/modules/menstrual-cycle-basics/quiz').send({ answers: [1, 1] }).expect(400);
    await v.post('/api/teen/learning/modules/nope/quiz').send({ answers: [] }).expect(404);
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

  it('returns urgent guidance and stores only minimal, non-sensitive results', async () => {
    const v = await newUser();
    const res = await v.post('/api/teen/assessments').send({ type: 'cramps', answers: urgentCramps }).expect(201);
    expect(res.body.level).toBe('urgent');
    expect(res.body.guidance.reasons.map((r) => r.code)).toEqual(['fainting', 'pregnancy_with_severe_pain']);

    const stored = await TeenAssessment.findById(res.body.item.id).lean();
    expect(stored.result).toEqual({ level: 'urgent', reasonCodes: ['fainting'] });
    expect(JSON.stringify(stored)).not.toMatch(/pregnan|painLevel/);
  });

  it('rejects invalid answers', async () => {
    const v = await newUser();
    const res = await v.post('/api/teen/assessments').send({ type: 'cramps', answers: { painLevel: 50 } }).expect(400);
    expect(res.body.details).toHaveProperty('painLevel');
  });

  it('keeps assessment history private to the account', async () => {
    const alice = await newUser();
    const bob = await newUser();
    const { body } = await alice.post('/api/teen/assessments').send({ type: 'cramps', answers: { ...urgentCramps, redFlags: [] } }).expect(201);
    expect((await bob.get('/api/teen/assessments').expect(200)).body.items).toHaveLength(0);
    await bob.delete(`/api/teen/assessments/${body.item.id}`).expect(404);
    await alice.delete(`/api/teen/assessments/${body.item.id}`).expect(204);
  });
});

describe('insights, sample data, export and deletion', () => {
  it('loads sample data and computes insights', async () => {
    const v = await newUser();
    const loaded = await v.post('/api/teen/sample-data').expect(201);
    expect(loaded.body.loaded.cycles).toBe(6);

    const res = await v.get('/api/teen/insights').expect(200);
    expect(res.body.insights.cycle.periodsLogged).toBe(6);
    expect(res.body.insights.symptoms.totalLogs).toBeGreaterThan(0);
  });

  it('downloads a plain-text summary', async () => {
    const v = await newUser();
    await v.post('/api/teen/sample-data').expect(201);
    const res = await v.get('/api/teen/insights/summary').expect(200);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="femaware-summary-/);
    expect(res.text).toContain('FemAware Health Summary');
  });

  it('includes teen data in the account export', async () => {
    const v = await newUser();
    await v.post('/api/teen/sample-data').expect(201);
    const res = await v.get('/api/user/export').expect(200);
    const archive = JSON.parse(res.text);
    expect(archive.teen.cycles).toHaveLength(6);
    expect(JSON.stringify(archive.teen)).not.toContain('password');
  });

  it('deletes teen data with the account, leaving other accounts untouched', async () => {
    const v = await newUser();
    const other = await newUser();
    await other.post('/api/teen/cycles').send({ startDate: isoDay(-3) }).expect(201);
    await v.post('/api/teen/sample-data').expect(201);
    await v.post('/api/teen/learning/modules/body-safety/quiz').send({ answers: [1, 1, 0] }).expect(200);

    await v.delete('/api/user/data').send({ scope: 'account', password: v.password, confirmation: 'DELETE' }).expect(200);
    expect(await TeenCycleEntry.countDocuments({ owner: v.user._id })).toBe(0);
    await v.get('/api/teen/cycles').expect(401);
    expect((await other.get('/api/teen/cycles').expect(200)).body.items).toHaveLength(1);
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
    teenConfig.allowUnreviewedGuidance = true;
  });

  it('serves only clinician-reviewed content when unreviewed content is disallowed', async () => {
    teenConfig.allowUnreviewedGuidance = false;
    const v = await newUser();

    expect((await v.get('/api/teen/learning/modules').expect(200)).body.items).toHaveLength(0);
    await v.post('/api/teen/assessments').send({ type: 'cramps', answers: calm }).expect(503);

    await LearningModule.updateOne(
      { slug: 'body-safety' },
      { reviewStatus: 'clinician_reviewed', reviewedBy: 'Test Reviewer, MD', reviewedAt: new Date() },
    );
    await GuidanceContent.updateMany({}, { reviewStatus: 'clinician_reviewed', reviewedBy: 'Test Reviewer, MD', reviewedAt: new Date() });

    const modules = await v.get('/api/teen/learning/modules').expect(200);
    expect(modules.body.items.map((m) => m.slug)).toEqual(['body-safety']);
    const res = await v.post('/api/teen/assessments').send({ type: 'cramps', answers: calm }).expect(201);
    expect(res.body.guidance.reviewStatus).toBe('clinician_reviewed');
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
  });
});
