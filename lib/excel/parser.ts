import * as XLSX from 'xlsx';
import { Requisition, RequisitionItem } from '@/types/requisition';

export interface ParsedRequisition {
  requisition: Omit<Requisition, 'id' | 'uploaded_at' | 'uploaded_by'>;
  items: Omit<RequisitionItem, 'id' | 'requisition_id'>[];
}

export class ExcelParser {
  /**
   * Parse Excel file containing requisitions
   * Expected columns: Vessel, Port, Delivery Date, Item Name, Description, Qty, Unit, Specifications
   */
  static parseRequisitionFile(fileBuffer: Buffer): ParsedRequisition {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Parse header row to get requisition details
    const headerRow = data[0] as any;

    const requisition: Omit<Requisition, 'id' | 'uploaded_at' | 'uploaded_by'> = {
      vessel_name: this.getString(headerRow, ['Vessel', 'Vessel Name', 'vessel_name']),
      vessel_imo: this.getString(headerRow, ['IMO', 'vessel_imo'], false),
      port_name: this.getString(headerRow, ['Port', 'Port Name', 'port_name']),
      delivery_date: this.getDate(headerRow, ['Delivery Date', 'delivery_date']),
      currency: this.getString(headerRow, ['Currency', 'currency'], false) || 'USD',
      status: 'draft',
      notes: this.getString(headerRow, ['Notes', 'notes'], false),
    };

    // Validate required fields
    if (!requisition.vessel_name) {
      throw new Error('Vessel name is required');
    }
    if (!requisition.port_name) {
      throw new Error('Port name is required');
    }
    if (!requisition.delivery_date) {
      throw new Error('Delivery date is required');
    }

    // Parse line items (starting from row 2)
    const items: Omit<RequisitionItem, 'id' | 'requisition_id'>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any;

      // Skip empty rows
      const itemName = this.getString(row, ['Item Name', 'Item', 'item_name'], false);
      if (!itemName) continue;

      const quantity = this.getNumber(row, ['Qty', 'Quantity', 'quantity']);
      if (!quantity || quantity <= 0) {
        throw new Error(`Row ${i + 1}: Quantity must be greater than 0`);
      }

      items.push({
        line_number: items.length + 1,
        item_name: itemName,
        item_description: this.getString(row, ['Description', 'Desc', 'description'], false),
        quantity,
        unit: this.getString(row, ['Unit', 'UoM', 'unit'], false),
        specifications: this.getString(row, ['Specifications', 'Specs', 'specifications'], false),
      });
    }

    if (items.length === 0) {
      throw new Error('No items found in Excel file');
    }

    return { requisition, items };
  }

  /**
   * Helper: Get string value from row by trying multiple column names
   */
  private static getString(
    row: any,
    columnNames: string[],
    required: boolean = true
  ): string {
    for (const name of columnNames) {
      const value = row[name];
      if (value !== undefined && value !== null && value !== '') {
        return String(value).trim();
      }
    }

    if (required) {
      throw new Error(`Required column not found: ${columnNames.join(' or ')}`);
    }
    return '';
  }

  /**
   * Helper: Get number value from row
   */
  private static getNumber(row: any, columnNames: string[]): number {
    const str = this.getString(row, columnNames, true);
    const num = parseFloat(str);

    if (isNaN(num)) {
      throw new Error(`Invalid number: ${str}`);
    }

    return num;
  }

  /**
   * Helper: Get date value from row (parses multiple date formats)
   */
  private static getDate(row: any, columnNames: string[]): string {
    const str = this.getString(row, columnNames, true);
    const date = new Date(str);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${str}`);
    }

    // Return ISO format
    return date.toISOString().split('T')[0];
  }
}
