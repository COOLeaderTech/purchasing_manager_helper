import { z } from 'zod';
import { dbHelpers } from '@/lib/db';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  min_p?: number;
  top_a?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callOpenRouter<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  operation: string,
  systemMessage?: string,
  maxRetries: number = 3
): Promise<T> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const messages: OpenRouterMessage[] = [];

      if (systemMessage) {
        messages.push({
          role: 'system',
          content: systemMessage,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const request: OpenRouterRequest = {
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      };

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: OpenRouterResponse = await response.json();
      const responseText = data.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('No response content from OpenRouter');
      }

      // Parse response as JSON if it contains JSON
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        // If not JSON, treat as plain text
        parsedResponse = responseText;
      }

      // Validate with schema
      const validated = schema.parse(parsedResponse);

      // Log successful operation
      try {
        dbHelpers.logAIOperation({
          operation,
          prompt: prompt.substring(0, 500), // Truncate for storage
          response: responseText.substring(0, 500),
          model: OPENROUTER_MODEL,
          tokens_used: data.usage.total_tokens,
          duration_ms: Date.now() - startTime,
          status: 'success',
          error_message: null,
        });
      } catch (logError) {
        console.warn('Failed to log AI operation:', logError);
      }

      return validated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        // Log failed operation
        try {
          dbHelpers.logAIOperation({
            operation,
            prompt: prompt.substring(0, 500),
            response: null,
            model: OPENROUTER_MODEL,
            tokens_used: 0,
            duration_ms: Date.now() - startTime,
            status: 'error',
            error_message: lastError.message,
          });
        } catch (logError) {
          console.warn('Failed to log AI error:', logError);
        }

        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Helper function for RFQ generation
export async function generateRFQ(requisitionData: any): Promise<{ subject: string; body: string }> {
  const schema = z.object({
    subject: z.string(),
    body: z.string(),
  });

  const systemMessage = `You are a professional maritime purchasing assistant. Generate a professional and formal RFQ (Request for Quotation) email.`;

  const prompt = `
Generate an RFQ email for the following requisition:

Vessel: ${requisitionData.vessel_name}
Port: ${requisitionData.port_name}
Delivery Date: ${requisitionData.delivery_date}
Currency: ${requisitionData.currency}

Items:
${requisitionData.items
  .map(
    (item: any, index: number) =>
      `${index + 1}. ${item.item_name} - Qty: ${item.quantity} ${item.unit || ''}
   Description: ${item.item_description || 'N/A'}
   Specifications: ${item.specifications || 'Standard'}`,
  )
  .join('\n')}

Company Details:
Name: ${process.env.COMPANY_NAME}
Email: ${process.env.COMPANY_EMAIL}
Phone: ${process.env.COMPANY_PHONE}

Return response as JSON with "subject" and "body" keys.
`;

  return await callOpenRouter(prompt, schema, 'rfq_generation', systemMessage);
}

// Helper function for quotation extraction
export async function extractQuotationData(attachmentText: string): Promise<any> {
  const schema = z.object({
    vendor_name: z.string().optional(),
    items: z.array(
      z.object({
        item_name: z.string(),
        quantity: z.number().optional(),
        unit_price: z.number().optional(),
        total_price: z.number().optional(),
        unit: z.string().optional(),
        delivery_time: z.string().optional(),
      })
    ),
    total_amount: z.number().optional(),
    currency: z.string().optional(),
    delivery_time: z.string().optional(),
    payment_terms: z.string().optional(),
  });

  const systemMessage = `You are a data extraction expert for maritime quotations. Extract structured data from quotation documents.`;

  const prompt = `
Extract all relevant data from the following quotation text:

${attachmentText}

Return response as JSON with the structure: {
  vendor_name: string,
  items: [{item_name, quantity, unit_price, total_price, unit, delivery_time}],
  total_amount: number,
  currency: string,
  delivery_time: string,
  payment_terms: string
}
`;

  return await callOpenRouter(prompt, schema, 'quotation_extraction', systemMessage);
}

// Helper function for vendor recommendations
export async function recommendVendors(requisitionData: any, purchaseHistory: any[]): Promise<any[]> {
  const schema = z.array(
    z.object({
      vendor_name: z.string(),
      relevance_score: z.number(),
      reason: z.string(),
      recommended_for_items: z.array(z.string()),
    })
  );

  const systemMessage = `You are a maritime vendor recommendation expert. Recommend vendors based on historical purchase data and requirements.`;

  const prompt = `
Based on the following requisition and purchase history, recommend vendors:

Requisition:
Port: ${requisitionData.port_name}
Items: ${requisitionData.items.map((i: any) => i.item_name).join(', ')}

Historical Purchases:
${purchaseHistory
  .slice(0, 20)
  .map((ph: any) => `- ${ph.item_name} from ${ph.vendor_name} at port ${ph.port_name} (${ph.quality_rating}/5)`)
  .join('\n')}

Return response as JSON array with: {vendor_name, relevance_score (0-100), reason, recommended_for_items}
`;

  return await callOpenRouter(prompt, schema, 'vendor_recommendation', systemMessage);
}

// Helper function for compliance checking
export async function checkCompliance(entityData: any, entityType: string): Promise<any> {
  const schema = z.object({
    issues: z.array(
      z.object({
        type: z.string(),
        severity: z.enum(['info', 'warning', 'error']),
        description: z.string(),
      })
    ),
    summary: z.string(),
  });

  const systemMessage = `You are a maritime compliance expert. Identify compliance issues and anomalies.`;

  const prompt = `
Check for compliance issues in the following ${entityType}:

${JSON.stringify(entityData, null, 2)}

Return response as JSON with: {
  issues: [{type, severity (info/warning/error), description}],
  summary: string
}
`;

  return await callOpenRouter(prompt, schema, 'compliance_check', systemMessage);
}
