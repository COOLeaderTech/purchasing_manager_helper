import { z } from 'zod';

export const RFQSchema = z.object({
  subject: z.string().min(10).max(200),
  body: z.string().min(50).max(5000),
});

export type RFQResponse = z.infer<typeof RFQSchema>;

export function createRFQPrompt(params: {
  vessel_name: string;
  vessel_imo?: string;
  port_name: string;
  delivery_date: string;
  currency: string;
  items: Array<{
    line_number: number;
    item_name: string;
    item_description?: string;
    quantity: number;
    unit?: string;
    specifications?: string;
  }>;
  company_name: string;
  company_email: string;
  company_phone: string;
  custom_terms?: string;
}): string {
  const {
    vessel_name,
    vessel_imo,
    port_name,
    delivery_date,
    currency,
    items,
    company_name,
    company_email,
    company_phone,
    custom_terms,
  } = params;

  return `You are a professional maritime purchasing assistant. Generate a formal Request for Quotation (RFQ) email.

## VESSEL DETAILS
- Vessel Name: ${vessel_name}
${vessel_imo ? `- IMO: ${vessel_imo}` : ''}
- Port: ${port_name}
- Delivery Date: ${delivery_date}
- Currency: ${currency}

## ITEMS REQUIRED
${items.map(item => `
${item.line_number}. ${item.item_name}
   Quantity: ${item.quantity} ${item.unit || ''}
${item.item_description ? `   Description: ${item.item_description}` : ''}
${item.specifications ? `   Specifications: ${item.specifications}` : ''}
`).join('\n')}

## COMPANY DETAILS
- Company: ${company_name}
- Email: ${company_email}
- Phone: ${company_phone}

## INSTRUCTIONS
Generate a professional, formal RFQ email in maritime business style.

**Subject line:** Should be clear, specific, and include vessel name and port.

**Email body:** Should include:
1. Professional greeting
2. Reference to vessel and port
3. Clear list of required items with quantities and specifications
4. Requested delivery date and location
5. Currency and payment terms (use industry standard)
6. Request for delivery timeline
7. Request for any relevant certifications or documentation
8. Professional closing with contact information

${custom_terms ? `\n## ADDITIONAL TERMS\n${custom_terms}\n` : ''}

Return response as valid JSON with exactly these keys:
{
  "subject": "Email subject line",
  "body": "Full email body with professional formatting"
}

Generate the RFQ now:`;
}

export function validateRFQ(rfq: any): RFQResponse {
  return RFQSchema.parse(rfq);
}
