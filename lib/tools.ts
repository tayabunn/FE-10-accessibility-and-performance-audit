import { tool } from 'ai';
import { z } from 'zod';

// ============================================================================
// 1. LEAD SCORING TOOL CONTRACT & IMPLEMENTATION
// ============================================================================

export const scoreLeadSchema = z.object({
  companyName: z.string().describe('Target company name to evaluate (e.g. Stripe, Acme Corp, Vercel)'),
  industry: z.string().optional().describe('Industry sector e.g. Fintech, SaaS, E-commerce, Healthcare'),
  employeeCount: z.number().optional().describe('Estimated number of employees'),
  intentSignals: z.array(z.string()).optional().describe('Observed intent signals e.g. pricing page visits, API docs read'),
  forceError: z.boolean().optional().describe('Set to true to test the designed output-error state'),
});

export type ScoreLeadInput = z.infer<typeof scoreLeadSchema>;

export interface LeadScoreResult {
  companyName: string;
  industry: string;
  leadScore: number; // 0-100
  tier: 'Hot' | 'Warm' | 'Cold';
  conversionProbability: number; // 0-100%
  dealEstimate: string;
  metrics: {
    budgetFit: number;
    techStackFit: number;
    engagementRate: number;
    decisionMakerAccess: number;
  };
  keySignals: string[];
  riskFactors: string[];
  monthlyForecast: Array<{ month: string; probability: number }>;
  recommendedNextAction: string;
  evaluatedAt: string;
}

export const scoreLeadTool = tool({
  description: 'Scores a B2B sales lead or target company to evaluate purchasing intent, fit score, and deal probability.',
  inputSchema: scoreLeadSchema,
  execute: async (args: ScoreLeadInput): Promise<LeadScoreResult> => {
    await new Promise((res) => setTimeout(res, 800));

    if (args.forceError) {
      throw new Error(`[LeadScoringAPI_Error]: Failed to retrieve credit & intent metrics for "${args.companyName}". External provider returned HTTP 503 (Service Unavailable).`);
    }

    const nameLower = args.companyName.toLowerCase();
    const isEnterprise = nameLower.includes('stripe') || nameLower.includes('vercel') || (args.employeeCount && args.employeeCount > 200);

    const baseScore = isEnterprise ? 92 : 78;
    const tier = baseScore >= 85 ? 'Hot' : baseScore >= 65 ? 'Warm' : 'Cold';

    return {
      companyName: args.companyName,
      industry: args.industry || (isEnterprise ? 'Developer Tools & Infrastructure' : 'SaaS Technology'),
      leadScore: baseScore,
      tier,
      conversionProbability: isEnterprise ? 88 : 72,
      dealEstimate: isEnterprise ? '$45,000 / yr' : '$18,000 / yr',
      metrics: {
        budgetFit: isEnterprise ? 95 : 80,
        techStackFit: 90,
        engagementRate: isEnterprise ? 85 : 75,
        decisionMakerAccess: isEnterprise ? 78 : 65,
      },
      keySignals: args.intentSignals && args.intentSignals.length > 0 ? args.intentSignals : [
        'Visited Enterprise Pricing Page (4x in 48h)',
        'Downloaded Security & SOC2 Compliance Packet',
        'API Sandbox project created by VP Engineering',
      ],
      riskFactors: [
        'Procurement cycle averages 30-45 days',
        'Requires custom SLA agreement',
      ],
      monthlyForecast: [
        { month: 'Month 1', probability: 35 },
        { month: 'Month 2', probability: 65 },
        { month: 'Month 3', probability: 88 },
        { month: 'Month 4', probability: 94 },
      ],
      recommendedNextAction: 'Schedule Executive Briefing & Technical Demo with Lead Architect',
      evaluatedAt: new Date().toISOString(),
    };
  },
});

// ============================================================================
// 2. WEBSITE META TAGS INSPECTOR TOOL
// ============================================================================

export const fetchMetaTagsSchema = z.object({
  url: z.string().describe('The web URL to scrape, inspect meta tags, and analyze SEO headers'),
  checkSecurityHeaders: z.boolean().optional().describe('Whether to analyze HTTP security headers'),
  forceError: z.boolean().optional().describe('Set to true to test simulated site offline error'),
});

export type FetchMetaTagsInput = z.infer<typeof fetchMetaTagsSchema>;

export interface MetaTagsResult {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  siteName: string;
  seoScore: number;
  performanceScore: number;
  metaTags: Record<string, string>;
  securityHeaders: Array<{ name: string; status: 'pass' | 'fail' | 'warning'; details: string }>;
  inspectedAt: string;
}

export const fetchMetaTagsTool = tool({
  description: 'Scrapes and analyzes website metadata, Open Graph tags, SEO readiness, and security headers for any target URL.',
  inputSchema: fetchMetaTagsSchema,
  execute: async (args: FetchMetaTagsInput): Promise<MetaTagsResult> => {
    await new Promise((res) => setTimeout(res, 900));

    if (args.forceError || args.url.includes('offline-error-test')) {
      throw new Error(`[MetaFetch_Error]: Unable to connect to host "${args.url}". Connection timed out after 5000ms (ERR_NAME_NOT_RESOLVED).`);
    }

    const cleanUrl = args.url.startsWith('http') ? args.url : `https://${args.url}`;
    const domain = new URL(cleanUrl).hostname;

    return {
      url: cleanUrl,
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Build Faster & Scale Instantly`,
      description: `Official website for ${domain}. Discover high-performance cloud tools, modern developer workflow, and enterprise infrastructure solutions.`,
      ogImage: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
      siteName: domain.toUpperCase(),
      seoScore: 94,
      performanceScore: 98,
      metaTags: {
        'viewport': 'width=width, initial-scale=1.0',
        'og:type': 'website',
        'og:title': `${domain} Next-Gen Platform`,
        'og:description': `Next generation intelligent web applications built for high concurrency and zero latencies.`,
        'twitter:card': 'summary_large_image',
        'twitter:site': `@${domain.split('.')[0]}`,
        'robots': 'index, follow',
      },
      securityHeaders: [
        { name: 'Strict-Transport-Security (HSTS)', status: 'pass', details: 'max-age=31536000; includeSubDomains; preload' },
        { name: 'Content-Security-Policy (CSP)', status: 'pass', details: 'default-src \'self\'; script-src \'self\' https://cdn...' },
        { name: 'X-Content-Type-Options', status: 'pass', details: 'nosniff' },
        { name: 'X-Frame-Options', status: 'warning', details: 'SAMEORIGIN (Consider updating to CSP frame-ancestors)' },
      ],
      inspectedAt: new Date().toISOString(),
    };
  },
});

// ============================================================================
// 3. INTERACTIVE CONFIRMATION ACTION TOOL (Server-side proposal)
// ============================================================================

export const confirmActionSchema = z.object({
  actionType: z.enum(['export_lead_report', 'schedule_crm_followup', 'trigger_outreach_sequence'])
    .describe('The action that requires user confirmation before execution'),
  targetName: z.string().describe('Target company or contact name'),
  parameters: z.object({
    priority: z.enum(['high', 'medium', 'low']).default('high'),
    notes: z.string().optional().describe('Execution notes or summary'),
  }),
});

export type ConfirmActionInput = z.infer<typeof confirmActionSchema>;

export interface ConfirmActionResult {
  actionType: string;
  targetName: string;
  status: 'executed' | 'cancelled';
  transactionId: string;
  executedAt: string;
  summary: string;
}

export const confirmActionTool = tool({
  description: 'Requests user confirmation before performing actions like exporting lead reports, CRM syncs, or outreach sequences.',
  inputSchema: confirmActionSchema,
  execute: async (args: ConfirmActionInput): Promise<ConfirmActionResult> => {
    await new Promise((res) => setTimeout(res, 600));

    return {
      actionType: args.actionType,
      targetName: args.targetName,
      status: 'executed',
      transactionId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      executedAt: new Date().toISOString(),
      summary: `Successfully executed "${args.actionType}" for target ${args.targetName} with priority [${args.parameters.priority}].`,
    };
  },
});

// ============================================================================
// 4. DIAGNOSTIC SYSTEM ERROR SIMULATOR TOOL
// ============================================================================

export const simulateSystemDiagnosticSchema = z.object({
  serviceName: z.string().describe('Service microservice to run diagnostic check on'),
  simulateFailure: z.boolean().default(true).describe('Set true to demonstrate output-error handling'),
});

export type SimulateSystemDiagnosticInput = z.infer<typeof simulateSystemDiagnosticSchema>;

export const simulateSystemDiagnosticTool = tool({
  description: 'Runs a system health check diagnostic. Used to verify error handling and designed output-error UI states.',
  inputSchema: simulateSystemDiagnosticSchema,
  execute: async (args: SimulateSystemDiagnosticInput) => {
    await new Promise((res) => setTimeout(res, 700));

    if (args.simulateFailure) {
      throw new Error(`[DiagnosticFailure]: Health check failed for microservice "${args.serviceName}". Database connection pool exhausted (ErrCode: ERR_DB_POOL_OVERFLOW_503).`);
    }

    return {
      serviceName: args.serviceName,
      status: 'HEALTHY',
      latencyMs: 14,
      uptime: '99.99%',
    };
  },
});

// ============================================================================
// 5. SERVER-SIDE TOOL: getWeatherInformation
// ============================================================================

export const getWeatherInformationSchema = z.object({
  city: z.string().describe('The city to get weather information for'),
});

export const getWeatherInformationTool = tool({
  description: 'Show the weather in a given city to the user.',
  inputSchema: getWeatherInformationSchema,
  execute: async ({ city }: { city: string }) => {
    await new Promise((res) => setTimeout(res, 500));
    const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const chosen = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    return {
      city,
      weather: chosen,
      temperature: chosen === 'snowy' ? '32°F' : chosen === 'sunny' ? '78°F' : '65°F',
      humidity: '55%',
      windSpeed: '12 mph',
    };
  },
});

// ============================================================================
// 6. CLIENT-SIDE TOOL: askForConfirmation
// ============================================================================

export const askForConfirmationSchema = z.object({
  message: z.string().describe('The message to ask the user for confirmation.'),
});

export const askForConfirmationTool = tool({
  description: 'Ask the user for confirmation on the client side.',
  inputSchema: askForConfirmationSchema,
});

// ============================================================================
// 7. CLIENT-SIDE TOOL: getLocation (Auto Executed Client Tool)
// ============================================================================

export const getLocationSchema = z.object({});

export const getLocationTool = tool({
  description: 'Get the user location. Always ask for confirmation before using this tool.',
  inputSchema: getLocationSchema,
});

// Map of all tools exported for model binding
export const ALL_TOOLS = {
  scoreLead: scoreLeadTool,
  fetchMetaTags: fetchMetaTagsTool,
  confirmAction: confirmActionTool,
  simulateSystemDiagnostic: simulateSystemDiagnosticTool,
  getWeatherInformation: getWeatherInformationTool,
  askForConfirmation: askForConfirmationTool,
  getLocation: getLocationTool,
};
