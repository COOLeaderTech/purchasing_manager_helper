import { z } from 'zod';

export const RFQSchema = z.object({
  subject: z.string().min(10).max(200),
  body: z.string().min(50).max(5000),
});

export type RFQResponse = z.infer<typeof RFQSchema>;

export function createRFQPrompt(params: {
  vessel_name: string;
  vessel_imo?: string;
  requisition_number?: string;
  port_name: string;
  delivery_date: string;
  currency: string;
  items: Array<{
    line_number: number;
    item_number?: string;
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
    requisition_number,
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

IMPORTANT: Generate a DETERMINISTIC, STRUCTURED RFQ. No creative wording. Use the exact format below.

## VESSEL DETAILS
- Vessel Name: ${vessel_name}
${vessel_imo ? `- IMO: ${vessel_imo}` : ''}
${requisition_number ? `- Requisition No: ${requisition_number}` : ''}
- Port of Delivery: ${port_name}
- Delivery Date: ${delivery_date}
- Currency: ${currency}

## ITEMS REQUIRED
${items.map((item, idx) => `
${idx + 1}. ${item.item_description || item.item_name}
   ${item.item_number ? `Item No: ${item.item_number}` : ''}
   Quantity: ${item.quantity} ${item.unit || 'unit(s)'}
   ${item.specifications ? `Specifications: ${item.specifications}` : ''}
`).join('\n')}

## COMPANY DETAILS
- Buyer: ${company_name}
- Email: ${company_email}
- Phone: ${company_phone}

## INSTRUCTIONS
Generate RFQ using EXACTLY this structure:

**Subject:** Request for Quotation - ${vessel_name} - ${port_name}

**Body Format:**
===================================
REQUEST FOR QUOTATION
===================================

BUYER: ${company_name}
VESSEL: ${vessel_name}
BUYER REFERENCE: ${requisition_number || 'N/A'}
PORT OF DELIVERY: ${port_name}
DELIVERY DATE: ${delivery_date}

SUPPLIER: ___________________

ITEMS REQUESTED:
─────────────────────────────────
No. | Description | Unit | Qty | Delivery Days | Notes
─────────────────────────────────
[List each item with: number, description, unit, quantity, blank delivery days, blank notes]

TERMS:
Payment: ___________________
Delivery: ___________________
Currency: ${currency}

SUPPLIER NOTES:
─────────────────────────────────
[Space for supplier to add notes]

${custom_terms ? `\nADDITIONAL TERMS:\n${custom_terms}\n` : ''}

Please submit your quotation at your earliest convenience.

Contact: ${company_name}
Email: ${company_email}
Phone: ${company_phone}

Return response as valid JSON with exactly these keys:
{
  "subject": "Email subject line",
  "body": "Full email body with the exact structure above"
}

Generate the RFQ now:`;
}

export function validateRFQ(rfq: any): RFQResponse {
  return RFQSchema.parse(rfq);
}
