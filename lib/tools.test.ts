import { describe, it, expect } from 'vitest';
import {
  scoreLeadSchema,
  fetchMetaTagsSchema,
  confirmActionSchema,
  simulateSystemDiagnosticSchema,
  getWeatherInformationSchema,
  scoreLeadTool,
  fetchMetaTagsTool,
  confirmActionTool,
  simulateSystemDiagnosticTool,
} from './tools';

describe('Server Tool Schemas & Executions (FE-07)', () => {
  describe('scoreLead', () => {
    it('validates correct input parameters', () => {
      const valid = scoreLeadSchema.safeParse({
        companyName: 'Stripe',
        industry: 'Fintech',
        employeeCount: 500,
        intentSignals: ['Pricing page view'],
      });
      expect(valid.success).toBe(true);
    });

    it('fails when companyName is missing', () => {
      const invalid = scoreLeadSchema.safeParse({});
      expect(invalid.success).toBe(false);
    });

    it('executes successfully and returns structured lead report', async () => {
      const result = await scoreLeadTool.execute(
        {
          companyName: 'Vercel',
          employeeCount: 250,
        },
        { toolCallId: 'test-call-1', messages: [] }
      );

      expect(result.companyName).toBe('Vercel');
      expect(result.tier).toBe('Hot');
      expect(result.leadScore).toBeGreaterThanOrEqual(80);
      expect(result.metrics).toHaveProperty('budgetFit');
    });

    it('throws handled error when forceError is true', async () => {
      await expect(
        scoreLeadTool.execute(
          { companyName: 'Acme', forceError: true },
          { toolCallId: 'test-call-2', messages: [] }
        )
      ).rejects.toThrow('[LeadScoringAPI_Error]');
    });
  });

  describe('fetchMetaTags', () => {
    it('validates URL parameters', () => {
      const valid = fetchMetaTagsSchema.safeParse({ url: 'https://example.com' });
      expect(valid.success).toBe(true);
    });

    it('executes scrape and returns metadata', async () => {
      const result = await fetchMetaTagsTool.execute(
        { url: 'https://vercel.com' },
        { toolCallId: 'test-call-3', messages: [] }
      );
      expect(result.url).toBe('https://vercel.com');
      expect(result.seoScore).toBe(94);
      expect(result.securityHeaders.length).toBeGreaterThan(0);
    });

    it('throws connection error when forced or for offline URL', async () => {
      await expect(
        fetchMetaTagsTool.execute(
          { url: 'offline-error-test.com' },
          { toolCallId: 'test-call-4', messages: [] }
        )
      ).rejects.toThrow('[MetaFetch_Error]');
    });
  });

  describe('confirmAction', () => {
    it('validates action enum types', () => {
      const valid = confirmActionSchema.safeParse({
        actionType: 'export_lead_report',
        targetName: 'Stripe',
        parameters: { priority: 'high' },
      });
      expect(valid.success).toBe(true);

      const invalid = confirmActionSchema.safeParse({
        actionType: 'invalid_action_type',
        targetName: 'Stripe',
        parameters: {},
      });
      expect(invalid.success).toBe(false);
    });

    it('executes and returns action transaction ID', async () => {
      const result = await confirmActionTool.execute(
        {
          actionType: 'schedule_crm_followup',
          targetName: 'Acme Corp',
          parameters: { priority: 'high' },
        },
        { toolCallId: 'test-call-5', messages: [] }
      );

      expect(result.status).toBe('executed');
      expect(result.transactionId).toMatch(/^TX-\d{6}$/);
    });
  });

  describe('simulateSystemDiagnostic', () => {
    it('throws error when simulateFailure is true', async () => {
      await expect(
        simulateSystemDiagnosticTool.execute(
          { serviceName: 'auth-service', simulateFailure: true },
          { toolCallId: 'test-call-6', messages: [] }
        )
      ).rejects.toThrow('[DiagnosticFailure]');
    });

    it('returns healthy status when simulateFailure is false', async () => {
      const result = await simulateSystemDiagnosticTool.execute(
        { serviceName: 'auth-service', simulateFailure: false },
        { toolCallId: 'test-call-7', messages: [] }
      );
      expect(result.status).toBe('HEALTHY');
    });
  });

  describe('getWeatherInformation', () => {
    it('validates city parameter', () => {
      const valid = getWeatherInformationSchema.safeParse({ city: 'San Francisco' });
      expect(valid.success).toBe(true);
    });
  });
});
