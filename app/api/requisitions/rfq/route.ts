import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { createRFQPrompt, validateRFQ, RFQSchema } from '@/lib/ai/prompts/rfq-generator';
import { sendRFQEmail } from '@/lib/email/gmail-smtp';
import { z } from 'zod';

const GenerateRFQSchema = z.object({
  requisition_id: z.string(),
  vendors: z.array(z.number()).optional(),
  custom_terms: z.string().optional(),
});

const SendRFQSchema = z.object({
  rfq_id: z.string(),
  recipients: z.array(z.string().email()),
});

/**
 * POST /api/requisitions/rfq
 * Generate RFQ email from requisition
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requisition_id, custom_terms } = GenerateRFQSchema.parse(body);

    // Fetch requisition with items
    const requisition = dbHelpers.getRequisition(parseInt(requisition_id));
    if (!requisition) {
      return NextResponse.json(
        { error: 'Requisition not found' },
        { status: 404 }
      );
    }

    const items = dbHelpers.getRequisitionItems(parseInt(requisition_id));
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Requisition has no items' },
        { status: 400 }
      );
    }

    // Create AI prompt
    const prompt = createRFQPrompt({
      vessel_name: requisition.vessel_name,
      vessel_imo: requisition.vessel_imo,
      port_name: requisition.port_name,
      delivery_date: requisition.delivery_date,
      currency: requisition.currency,
      items: items as any,
      company_name: process.env.COMPANY_NAME || 'Your Company',
      company_email: process.env.COMPANY_EMAIL || 'purchasing@company.com',
      company_phone: process.env.COMPANY_PHONE || '+1234567890',
      custom_terms,
    });

    // Call AI to generate RFQ
    const rfq = await callOpenRouter(
      prompt,
      RFQSchema,
      'rfq_generation'
    );

    // Validate RFQ
    const validated = validateRFQ(rfq);

    // Save RFQ to database
    const result = dbHelpers.createRFQ({
      requisition_id: parseInt(requisition_id),
      subject: validated.subject,
      body: validated.body,
      recipients: JSON.stringify([]),
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      rfq: {
        id: result.lastID,
        ...validated,
        status: 'draft',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('RFQ generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to generate RFQ';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/requisitions/rfq
 * Send RFQ email to vendors
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfq_id, recipients } = SendRFQSchema.parse(body);

    // Fetch RFQ
    const rfq = dbHelpers.getRFQ(parseInt(rfq_id));
    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // Get requisition for context
    const requisition = dbHelpers.getRequisition(rfq.requisition_id);
    if (!requisition) {
      return NextResponse.json(
        { error: 'Requisition not found' },
        { status: 404 }
      );
    }

    // Send email
    const result = await sendRFQEmail({
      recipients,
      subject: rfq.subject,
      body: rfq.body,
      vessel_name: requisition.vessel_name,
      port_name: requisition.port_name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${result.error}` },
        { status: 500 }
      );
    }

    // Update RFQ status
    const stmt = require('@/lib/db').getDb().prepare(`
      UPDATE rfqs
      SET status = 'sent', sent_at = datetime('now'), recipients = ?, message_id = ?
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(recipients), result.messageId, parseInt(rfq_id));

    // Update requisition status
    const stmt2 = require('@/lib/db').getDb().prepare(`
      UPDATE requisitions
      SET status = 'rfq_sent'
      WHERE id = ?
    `);
    stmt2.run(rfq.requisition_id);

    return NextResponse.json({
      success: true,
      message: `RFQ sent to ${recipients.length} vendor(s)`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('RFQ send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to send RFQ';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
