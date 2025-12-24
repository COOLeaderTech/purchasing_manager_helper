import * as XLSX from 'xlsx';
import { Requisition, RequisitionItem } from '@/types/requisition';

export interface ParsedRequisition {
  requisition: Omit<Requisition, 'id' | 'uploaded_at' | 'uploaded_by'>;
  items: Omit<RequisitionItem, 'id' | 'requisition_id'>[];
}

export class ExcelParser {
  /**
   * Parse Excel file containing requisitions from ship-management ERP
   * Handles variable column positions and empty cell inheritance
   */
  static parseRequisitionFile(fileBuffer: Buffer): ParsedRequisition {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Find requisition metadata from first row or header area
    const firstRow = data[0] as any;
    let requisitionMetadata: any = {};

    // Try to extract metadata from first few rows
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i] as any;

      // Extract vessel name
      if (!requisitionMetadata.vessel_name) {
        requisitionMetadata.vessel_name = this.getString(row, [
          'Vessel', 'Vessel Name', 'vessel_name', 'Ship', 'Ship Name'
        ], false);
      }

      // Extract requisition number
      if (!requisitionMetadata.requisition_number) {
        requisitionMetadata.requisition_number = this.getString(row, [
          'Requisition No', 'Req No', 'Requisition Number', 'requisition_number', 'Req. No.'
        ], false);
      }

      // Extract requisition title
      if (!requisitionMetadata.requisition_title) {
        requisitionMetadata.requisition_title = this.getString(row, [
          'Requisition Title', 'Title', 'requisition_title', 'Subject'
        ], false);
      }

      // Extract requisition date
      if (!requisitionMetadata.requisition_date) {
        requisitionMetadata.requisition_date = this.getString(row, [
          'Requisition Date', 'Req Date', 'requisition_date', 'Date'
        ], false);
      }

      // Extract requisition group/category
      if (!requisitionMetadata.requisition_group) {
        requisitionMetadata.requisition_group = this.getString(row, [
          'Requisition Group', 'Group', 'Category', 'requisition_group', 'Type'
        ], false);
      }

      // Extract port
      if (!requisitionMetadata.port_name) {
        requisitionMetadata.port_name = this.getString(row, [
          'Port', 'Port Name', 'port_name', 'Port of Delivery', 'Delivery Port'
        ], false);
      }

      // Extract delivery date/ETA
      if (!requisitionMetadata.delivery_date) {
        requisitionMetadata.delivery_date = this.getString(row, [
          'ETA', 'Delivery Date', 'delivery_date', 'Expected Delivery', 'Delivery'
        ], false);
      }

      // Extract currency
      if (!requisitionMetadata.currency) {
        requisitionMetadata.currency = this.getString(row, [
          'Currency', 'currency', 'Curr'
        ], false);
      }
    }

    const requisition: Omit<Requisition, 'id' | 'uploaded_at' | 'uploaded_by'> = {
      vessel_name: requisitionMetadata.vessel_name || 'Unknown Vessel',
      vessel_imo: this.getString(firstRow, ['IMO', 'vessel_imo', 'IMO Number'], false),
      requisition_number: requisitionMetadata.requisition_number,
      requisition_title: requisitionMetadata.requisition_title,
      requisition_date: requisitionMetadata.requisition_date,
      requisition_group: requisitionMetadata.requisition_group,
      port_name: requisitionMetadata.port_name || 'Unknown Port',
      delivery_date: requisitionMetadata.delivery_date || new Date().toISOString().split('T')[0],
      currency: requisitionMetadata.currency || 'USD',
      status: 'draft',
      notes: this.getString(firstRow, ['Notes', 'Remarks', 'notes'], false),
    };

    // Parse line items - find the data rows
    const items: Omit<RequisitionItem, 'id' | 'requisition_id'>[] = [];
    let previousValues: any = {};

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;

      // Try to find item description (main identifier)
      const itemDescription = this.getString(row, [
        'Description', 'Item Description', 'Desc', 'Item', 'Item Name', 'description'
      ], false);

      if (!itemDescription) continue;

      // Skip rows that look like headers or contain pricing/quotation data
      if (this.isHeaderRow(row) || this.isQuotationRow(row)) {
        continue;
      }

      // Get quantity
      const quantity = this.getNumber(row, [
        'Qty', 'Quantity', 'quantity', 'QTY', 'Req. Qty'
      ], false);

      if (!quantity || quantity <= 0) continue;

      // Get other fields with inheritance
      const itemNumber = this.getString(row, [
        'Item No', 'Item Number', 'No', 'item_number', '#'
      ], false) || previousValues.itemNumber || '';

      const unit = this.getString(row, [
        'Unit', 'UoM', 'U/M', 'unit', 'Unit of Measure'
      ], false) || previousValues.unit || '';

      const department = this.getString(row, [
        'Department', 'Dept', 'Store', 'Store Type', 'department'
      ], false) || previousValues.department || '';

      const itemNotes = this.getString(row, [
        'Item Notes', 'Notes', 'Remarks', 'item_notes', 'Comments'
      ], false) || '';

      const specifications = this.getString(row, [
        'Specifications', 'Specs', 'specifications', 'Spec'
      ], false) || '';

      items.push({
        line_number: items.length + 1,
        item_number: itemNumber,
        item_name: itemDescription.substring(0, 200),
        item_description: itemDescription,
        quantity,
        unit,
        department,
        specifications,
        item_notes: itemNotes,
      });

      // Store values for potential inheritance
      previousValues = { itemNumber, unit, department };
    }

    if (items.length === 0) {
      throw new Error('No valid items found in Excel file');
    }

    return { requisition, items };
  }

  /**
   * Check if row looks like a header row
   */
  private static isHeaderRow(row: any): boolean {
    const rowStr = JSON.stringify(row).toLowerCase();
    return rowStr.includes('description') && rowStr.includes('quantity') ||
           rowStr.includes('item name') && rowStr.includes('qty');
  }

  /**
   * Check if row contains quotation/pricing data (should be ignored)
   */
  private static isQuotationRow(row: any): boolean {
    const rowStr = JSON.stringify(row).toLowerCase();
    return rowStr.includes('quoted') ||
           rowStr.includes('supplier') ||
           rowStr.includes('vendor') ||
           rowStr.includes('price') ||
           rowStr.includes('discount') ||
           rowStr.includes('total') ||
           rowStr.includes('approval');
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
  private static getNumber(row: any, columnNames: string[], required: boolean = true): number {
    const str = this.getString(row, columnNames, required);
    if (!str && !required) return 0;

    const num = parseFloat(str);

    if (isNaN(num)) {
      if (required) {
        throw new Error(`Invalid number: ${str}`);
      }
      return 0;
    }

    return num;
  }

  /**
   * Helper: Get date value from row (parses multiple date formats)
   */
  private static getDate(row: any, columnNames: string[], required: boolean = true): string {
    const str = this.getString(row, columnNames, required);
    if (!str && !required) return '';

    const date = new Date(str);

    if (isNaN(date.getTime())) {
      if (required) {
        throw new Error(`Invalid date: ${str}`);
      }
      return '';
    }

    // Return ISO format
    return date.toISOString().split('T')[0];
  }
}
