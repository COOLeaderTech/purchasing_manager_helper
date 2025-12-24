'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

export default function RequisitionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [currentRequisition, setCurrentRequisition] = useState<any>(null);
  const [generatedRFQ, setGeneratedRFQ] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load vendors on mount
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        const data = await response.json();
        if (data.success) {
          setVendors(data.vendors);
        }
      } catch (error) {
        console.error('Failed to load vendors:', error);
      }
    };
    loadVendors();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setGeneratedRFQ(null);
    setCurrentRequisition(null);
    setSelectedVendors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/requisitions/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Upload failed' });
      } else {
        const data = await response.json();
        setRequisitions([data.requisition, ...requisitions]);
        setCurrentRequisition(data.requisition);
        setMessage({ type: 'success', text: 'Requisition uploaded successfully! Now select vendors and generate RFQ.' });
        setFile(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const toggleVendor = (vendorId: number) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const handleGenerateRFQ = async () => {
    if (!currentRequisition) {
      setMessage({ type: 'error', text: 'No requisition selected' });
      return;
    }

    if (selectedVendors.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one vendor' });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/requisitions/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: currentRequisition.id.toString(),
          vendor_ids: selectedVendors,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'RFQ generation failed' });
      } else {
        const data = await response.json();
        setGeneratedRFQ(data.rfq);
        setMessage({ type: 'success', text: 'RFQ generated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate RFQ. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditRFQ = async () => {
    if (!generatedRFQ || !editInstruction.trim()) {
      setMessage({ type: 'error', text: 'Please enter edit instruction' });
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch('/api/rfq/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: generatedRFQ.id,
          edit_instruction: editInstruction,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Edit failed' });
      } else {
        const data = await response.json();
        setGeneratedRFQ({ ...generatedRFQ, ...data.rfq });
        setMessage({ type: 'success', text: 'RFQ updated successfully!' });
        setEditInstruction('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to edit RFQ. Please try again.' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleSendRFQ = async () => {
    if (!generatedRFQ) return;

    const vendorEmails = selectedVendors
      .map(id => vendors.find(v => v.id === id)?.email)
      .filter(email => email);

    if (!confirm(`Send RFQ to ${vendorEmails.length} vendor(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/requisitions/rfq', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: generatedRFQ.id.toString(),
          recipients: vendorEmails,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Send failed' });
      } else {
        setMessage({ type: 'success', text: 'RFQ sent successfully!' });
        // Reset state
        setGeneratedRFQ(null);
        setCurrentRequisition(null);
        setSelectedVendors([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send RFQ. Please try again.' });
    }
  };

  const handleReset = () => {
    setGeneratedRFQ(null);
    setCurrentRequisition(null);
    setSelectedVendors([]);
    setEditInstruction('');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      draft: 'default',
      rfq_sent: 'info',
      quotations_received: 'warning',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Requisitions</h1>
        <p className="text-gray-600 mb-8">Upload Excel files to create new requisitions and generate RFQs</p>

        {message && (
          <Alert
            variant={message.type === 'success' ? 'success' : 'danger'}
            title={message.type === 'success' ? 'Success' : 'Error'}
            onClose={() => setMessage(null)}
            className="mb-8"
          >
            {message.text}
          </Alert>
        )}

        {/* Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Upload Requisition</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <p className="text-gray-600">
                    {file ? file.name : 'Drag and drop or click to select Excel file'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Only .xlsx and .xls files are supported</p>
                </label>
              </div>

              <Button
                onClick={handleUpload}
                isLoading={uploading}
                disabled={!file || uploading}
                className="w-full"
              >
                Upload Requisition
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Vendor Selection Section */}
        {currentRequisition && !generatedRFQ && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Vendors</h2>
              <p className="text-sm text-gray-600 mt-1">Choose vendors to receive the RFQ</p>
            </CardHeader>
            <CardBody>
              {vendors.length === 0 ? (
                <p className="text-gray-500">No vendors available. Please add vendors first.</p>
              ) : (
                <div className="space-y-3">
                  {vendors.map(vendor => (
                    <label
                      key={vendor.id}
                      className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                        {vendor.ports_served && (
                          <p className="text-xs text-gray-500 mt-1">Ports: {vendor.ports_served}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleGenerateRFQ}
                  isLoading={isGenerating}
                  disabled={selectedVendors.length === 0 || isGenerating}
                  className="w-full"
                  variant="primary"
                >
                  Generate RFQ {selectedVendors.length > 0 && `(${selectedVendors.length} vendor${selectedVendors.length > 1 ? 's' : ''})`}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* RFQ Preview Section */}
        {generatedRFQ && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">RFQ Preview</h2>
              <p className="text-sm text-gray-600 mt-1">Review and optionally edit with AI</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-gray-900">{generatedRFQ.subject}</p>
                  </div>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                    {generatedRFQ.body}
                  </div>
                </div>

                {/* AI Edit Bar */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Edit (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      placeholder="Ask AI to edit... (e.g., 'Make it more formal', 'Add insurance terms')"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isEditing && editInstruction.trim()) {
                          handleEditRFQ();
                        }
                      }}
                    />
                    <Button
                      onClick={handleEditRFQ}
                      isLoading={isEditing}
                      disabled={!editInstruction.trim() || isEditing}
                      variant="outline"
                    >
                      Apply Edit
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">You can edit multiple times to refine the RFQ</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSendRFQ}
                    variant="success"
                    className="flex-1"
                  >
                    Send RFQ to Vendors
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Requisitions Table */}
        {requisitions.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Requisitions</h2>
            </CardHeader>
            <CardBody>
              <Table>
                <TableHead>
                  <TableRow isHeader>
                    <TableCell isHeader>Vessel</TableCell>
                    <TableCell isHeader>Port</TableCell>
                    <TableCell isHeader>Delivery Date</TableCell>
                    <TableCell isHeader>Items</TableCell>
                    <TableCell isHeader>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requisitions.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.vessel_name}</TableCell>
                      <TableCell>{req.port_name}</TableCell>
                      <TableCell>{req.delivery_date}</TableCell>
                      <TableCell>{req.items?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(req.status)}>
                          {req.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {requisitions.length === 0 && !file && (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500 text-lg">No requisitions yet. Upload one to get started.</p>
            </CardBody>
          </Card>
        )}
      </div>
    </main>
  );
}
