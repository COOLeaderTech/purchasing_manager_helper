'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Purchasing Manager Helper
          </h1>
          <p className="text-xl text-gray-600">
            Maritime purchasing assistant powered by AI. All 4 milestones are ready!
          </p>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Milestone 1 */}
          <Link href="/requisitions">
            <div className="border-2 border-blue-200 rounded-lg p-6 hover:bg-blue-50 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-900">
                  🔷 Milestone 1: RFQ Drafting
                </h2>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">READY</span>
              </div>
              <p className="text-gray-600 mb-4">
                Upload Excel requisitions → Generate professional RFQ emails → Send to vendors
              </p>
              <p className="text-sm text-gray-500">
                ✓ Excel parser • ✓ AI RFQ generation • ✓ Gmail integration
              </p>
            </div>
          </Link>

          {/* Milestone 2 */}
          <Link href="/quotations">
            <div className="border-2 border-orange-200 rounded-lg p-6 hover:bg-orange-50 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-orange-900">
                  🔶 Milestone 2: Quotation Extractor
                </h2>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">READY</span>
              </div>
              <p className="text-gray-600 mb-4">
                Monitor Gmail for replies → Extract structured data → Compare quotations
              </p>
              <p className="text-sm text-gray-500">
                ✓ Gmail MCP sync • ✓ AI extraction • ✓ Excel export • ✓ Cron jobs
              </p>
            </div>
          </Link>

          {/* Milestone 3 */}
          <Link href="/vendors/recommendations">
            <div className="border-2 border-indigo-200 rounded-lg p-6 hover:bg-indigo-50 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-900">
                  🔵 Milestone 3: Vendor Recommender
                </h2>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">READY</span>
              </div>
              <p className="text-gray-600 mb-4">
                Analyze purchase history → Get AI recommendations → Compare prices
              </p>
              <p className="text-sm text-gray-500">
                ✓ Price analytics • ✓ AI rankings • ✓ Historical data • ✓ Caching
              </p>
            </div>
          </Link>

          {/* Milestone 4 */}
          <Link href="/compliance">
            <div className="border-2 border-green-200 rounded-lg p-6 hover:bg-green-50 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-green-900">
                  🟢 Milestone 4: Compliance Checker
                </h2>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">READY</span>
              </div>
              <p className="text-gray-600 mb-4">
                Pre-RFQ validation → Post-quotation anomaly detection → Compliance reports
              </p>
              <p className="text-sm text-gray-500">
                ✓ Rules engine • ✓ Validators • ✓ Anomaly detection • ✓ AI analysis
              </p>
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">🎯 Getting Started</h2>
          <ol className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
              <span>Go to <strong>Milestone 1</strong> and upload an Excel requisition</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
              <span>AI will generate a professional RFQ email ready to send</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
              <span>Receive quotations from vendors (Milestone 2 auto-extracts data)</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 font-bold">4</span>
              <span>Get AI-powered vendor recommendations (Milestone 3)</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 font-bold">5</span>
              <span>Monitor compliance and anomalies (Milestone 4)</span>
            </li>
          </ol>
          <Link href="/requisitions">
            <Button variant="success" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start with Milestone 1 →
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <p className="text-gray-600">Milestones</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
            <p className="text-gray-600">All Complete</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-indigo-600 mb-2">$0</div>
            <p className="text-gray-600">Monthly Cost</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
            <p className="text-gray-600">Scalability</p>
          </div>
        </div>
      </div>
    </main>
  );
}
