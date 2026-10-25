import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, useTestDatabase } from './helpers.js';
import {
  ensureDemoAccounts,
  DEMO_EMAIL,
  SENIOR_EMAIL,
  TEEN_EMAIL,
} from '../seed/seedData.js';
import { User } from '../models/User.js';

useTestDatabase();

const demoEmails = [DEMO_EMAIL, SENIOR_EMAIL, TEEN_EMAIL];

const countDemoUsers = () => User.countDocuments({ email: { $in: demoEmails } });

describe('demo accounts', () => {
  it('creates all three demo accounts on a fresh database', async () => {
    expect(await ensureDemoAccounts({ silent: true })).toEqual({ seeded: true });
    expect(await countDemoUsers()).toBe(3);
  });

  it('does nothing when the accounts already exist', async () => {
    await ensureDemoAccounts({ silent: true });
    const firstId = (await User.findOne({ email: DEMO_EMAIL }))._id.toString();

    expect(await ensureDemoAccounts({ silent: true })).toEqual({
      seeded: false,
      reason: 'exists',
    });

    // The existing account is reused instead of being recreated.
    const afterId = (await User.findOne({ email: DEMO_EMAIL }))._id.toString();
    expect(afterId).toBe(firstId);
    expect(await countDemoUsers()).toBe(3);
  });

  it('rebuilds the demo data when one account was deleted', async () => {
    await ensureDemoAccounts({ silent: true });
    await User.deleteOne({ email: SENIOR_EMAIL });

    expect(await ensureDemoAccounts({ silent: true })).toEqual({ seeded: true });
    expect(await countDemoUsers()).toBe(3);
  });

  it('lets every demo account sign in with the shared password', async () => {
    await ensureDemoAccounts({ silent: true });

    for (const email of demoEmails) {
      const { body } = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'FemAware123!' })
        .expect(200);

      expect(body.token).toBeTruthy();
      expect(body.user.email).toBe(email);
    }
  });
});
