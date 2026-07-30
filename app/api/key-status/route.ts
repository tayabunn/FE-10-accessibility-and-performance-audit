import { NextResponse } from 'next/server';
import { getAPIKeyStatus } from '@/lib/ai-config';

export const runtime = 'nodejs';

export async function GET() {
  const status = getAPIKeyStatus();
  return NextResponse.json(status);
}
