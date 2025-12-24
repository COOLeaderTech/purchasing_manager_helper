import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { createRFQEditPrompt, validateRFQEdit, RFQEditSchema } from '@/lib/ai/prompts/rfq-editor';
import { z } from 'zod';

const EditRFQSchema = z.object({
  rfq_id: z.number(),
  edit_instruction: z.string().min(1),
});

/**
 * POST /api/rfq/edit
 * Edit existing RFQ using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfq_id, edit_instruction } = EditRFQSchema.parse(body);

    // Fetch existing RFQ
    const rfq = dbHelpers.getRFQ(rfq_id);
    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // Create edit prompt
    const prompt = createRFQEditPrompt({
      current_subject: rfq.subject,
      current_body: rfq.body,
      edit_instruction,
    });

    // Call AI to edit RFQ
    const editedRFQ = await callOpenRouter(
      prompt,
      RFQEditSchema,
      'rfq_edit'
    );

    // Validate edited RFQ
    const validated = validateRFQEdit(editedRFQ);

    // Create updated rfq_draft (structured format)
    const rfq_draft = `${validated.subject}\n\n${validated.body}`;

    // Update RFQ in database
    dbHelpers.updateRFQ(rfq_id, {
      rfq_draft,
      subject: validated.subject,
      body: validated.body,
    });

    return NextResponse.json({
      success: true,
      rfq: {
        id: rfq_id,
        subject: validated.subject,
        body: validated.body,
      },
    });
  } catch (error) {
    console.error('RFQ edit error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to edit RFQ';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
