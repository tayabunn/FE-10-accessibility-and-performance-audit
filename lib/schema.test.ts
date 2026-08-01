import { describe, it, expect } from 'vitest';
import { creatorSettingsSchema } from './schema';

describe('Creator Settings Schema Validation', () => {
  it('should validate a correct payload successfully', () => {
    const validPayload = {
      username: 'creator123',
      email: 'creator@example.com',
      payoutEmail: 'payout@example.com',
      bio: 'Hello world!',
      theme: 'light' as const,
      newsletter: true,
    };
    const result = creatorSettingsSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should fail validation on invalid username', () => {
    const invalidPayload = {
      username: 'CR', // too short and has uppercase
      email: 'creator@example.com',
      payoutEmail: 'payout@example.com',
      theme: 'light' as const,
      newsletter: true,
    };
    const result = creatorSettingsSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Username must be at least 3 characters');
    }
  });

  it('should fail validation on invalid email formats', () => {
    const invalidPayload = {
      username: 'creator123',
      email: 'not-an-email',
      payoutEmail: 'payout@example.com',
      theme: 'light' as const,
      newsletter: true,
    };
    const result = creatorSettingsSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should validate payout email with subaddress alias (e.g., +alias)', () => {
    const payloadWithAlias = {
      username: 'creator123',
      email: 'creator@example.com',
      payoutEmail: 'creator+payout@example.com', // standard subaddressing (alias)
      bio: 'Supporting aliases',
      theme: 'dark' as const,
      newsletter: false,
    };
    const result = creatorSettingsSchema.safeParse(payloadWithAlias);
    expect(result.success).toBe(true);
  });

  it('should fail validation when bio exceeds 150 characters', () => {
    const payloadWithLongBio = {
      username: 'creator123',
      email: 'creator@example.com',
      payoutEmail: 'payout@example.com',
      bio: 'a'.repeat(151),
      theme: 'dark' as const,
      newsletter: false,
    };
    const result = creatorSettingsSchema.safeParse(payloadWithLongBio);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('150 characters');
    }
  });
});

