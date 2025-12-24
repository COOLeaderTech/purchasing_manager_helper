import { z } from 'zod';

export const RFQEditSchema = z.object({
  subject: z.string().min(10).max(200),
  body: z.string().min(50).max(5000),
});

export type RFQEditResponse = z.infer<typeof RFQEditSchema>;

export function createRFQEditPrompt(params: {
  current_subject: string;
  current_body: string;
  edit_instruction: string;
}): string {
  const {current_subject, current_body, edit_instruction} = params;

  return `You are a professional maritime purchasing assistant. Edit the existing RFQ based on the user's instruction while maintaining professional tone and structure.

## CURRENT RFQ

**Subject:** ${current_subject}

**Body:**
${current_body}

## USER EDIT INSTRUCTION
${edit_instruction}

## INSTRUCTIONS
1. Apply the user's edit instruction to the RFQ
2. Maintain the professional maritime business tone
3. Preserve the RFQ structure unless the edit specifically requests structural changes
4. Keep the formatting clean and professional
5. DO NOT add pricing, discounts, or totals unless explicitly requested
6. DO NOT remove important details unless explicitly requested

Return response as valid JSON with exactly these keys:
{
  "subject": "Updated email subject line",
  "body": "Updated email body with edits applied"
}

Apply the edit now:`;
}

export function validateRFQEdit(rfq: any): RFQEditResponse {
  return RFQEditSchema.parse(rfq);
}
