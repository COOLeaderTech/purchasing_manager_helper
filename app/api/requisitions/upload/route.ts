import { NextRequest, NextResponse } from 'next/server';
import { ExcelParser } from '@/lib/excel/parser';
import { dbHelpers } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Parse Excel file
    const { requisition, items } = ExcelParser.parseRequisitionFile(fileBuffer);

    // Create requisition in database
    const result = dbHelpers.createRequisition({
      ...requisition,
      uploaded_by: request.headers.get('user') || 'system',
    });

    const requisitionId = result.lastID;

    // Create requisition items
    for (const item of items) {
      dbHelpers.addRequisitionItem({
        ...item,
        requisition_id: requisitionId,
      });
    }

    // Fetch created requisition with items
    const createdRequisition = dbHelpers.getRequisition(requisitionId);
    const createdItems = dbHelpers.getRequisitionItems(requisitionId);

    return NextResponse.json({
      success: true,
      requisition: {
        ...createdRequisition,
        items: createdItems,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Failed to parse file: ${message}` },
      { status: 400 }
    );
  }
}
