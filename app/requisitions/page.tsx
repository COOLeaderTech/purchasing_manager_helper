'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';

export default function RequisitionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);

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
        setMessage({ type: 'success', text: 'Requisition uploaded successfully!' });
        setFile(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
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
        <p className="text-gray-600 mb-8">Upload Excel files to create new requisitions</p>

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
