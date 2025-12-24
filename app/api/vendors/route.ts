import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

/**
 * GET /api/vendors
 * Fetch list of active vendors for selection
 */
export async function GET(request: NextRequest) {
  try {
    const vendors = dbHelpers.getVendors();

    return NextResponse.json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.error('Vendor fetch error:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch vendors';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
