import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, feeReceiptsAPI } from '../../services';
import { 
  FileText, Download, ArrowLeft, Loader2, 
  Eye, Calendar, CreditCard, SearchX, ShieldCheck, CheckCircle2 
} from 'lucide-react';

const Receipt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
        
        if (data?.id) {
          const studentId = data.studentId || data.id;

          let dbReceipts = [];
          try {
            const receiptData = await feeReceiptsAPI.getByStudentId(studentId);
            const receiptsArray = receiptData?.data || receiptData;
            if (Array.isArray(receiptsArray)) {
              dbReceipts = receiptsArray.map(r => ({
                ...r,
                receiptNumber: r.receiptNumber || r.id,
                paymentDate: r.paymentDate || r.date || r.payment_date,
                paymentMethod: r.paymentMethod || r.payment_method,
                description: r.description || 'Fee Payment',
                status: r.status || 'Completed',
                _source: 'db'
              }));
            }
          } catch (err) {
            console.error('Error fetching FeeReceipt records:', err);
          }

          const historyReceipts = (data?.fees?.paymentHistory || []).map(p => ({
            receiptNumber: p.receiptNumber || p.receiptId || p.id,
            paymentDate: p.date || p.paymentDate,
            paymentMethod: p.method || p.paymentMethod,
            amount: p.amount,
            description: 'Fee Payment',
            status: 'Completed',
            _source: 'history'
          }));

          const dbReceiptNums = new Set(dbReceipts.map(r => r.receiptNumber));
          const onlyHistory = historyReceipts.filter(
            r => r.receiptNumber && !dbReceiptNums.has(r.receiptNumber)
          );
          const merged = [...dbReceipts, ...onlyHistory];

          merged.sort((a, b) => {
            const da = new Date(a.paymentDate || a.createdAt || 0);
            const db2 = new Date(b.paymentDate || b.createdAt || 0);
            return db2 - da;
          });

          setReceipts(merged);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user]);


  const generateReceiptPDF = (receipt) => {
    const receiptWindow = window.open('', '_blank');
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receipt.receiptNumber || 'N/A'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .college-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
          }
          .college-address {
            color: #666;
            font-size: 14px;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #111827;
          }
          .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e2e8f0;
          }
          .info-title {
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-label {
            color: #475569;
          }
          .info-value {
            font-weight: bold;
            color: #0f172a;
          }
          .amount-section {
            background: #f0fdf4;
            border: 2px solid #22c55e;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .amount-label {
            font-size: 16px;
            color: #166534;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #15803d;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #334155;
            margin-top: 40px;
            padding-top: 5px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="college-name">Smart College Management System</div>
          <div class="college-address">
            Barat Ratna Indira Gandhi College of Engineering, Solapur, Maharashtra - 413255<br>
            Phone: +91 93707 34943 | Email: info@smartcollege.edu
          </div>
        </div>

        <div class="receipt-title">FEE PAYMENT RECEIPT</div>

        <div class="receipt-info">
          <div class="info-section">
            <div class="info-title">Student Information</div>
            <div class="info-row">
              <span class="info-label">Student ID:</span>
              <span class="info-value">${studentData?.id || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${studentData?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Department:</span>
              <span class="info-value">${studentData?.department || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Year:</span>
              <span class="info-value">${studentData?.year || 'N/A'}rd Year</span>
            </div>
          </div>

          <div class="info-section">
            <div class="info-title">Payment Details</div>
            <div class="info-row">
              <span class="info-label">Receipt No:</span>
              <span class="info-value">${receipt.receiptNumber || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Date:</span>
              <span class="info-value">${formatDate(receipt.paymentDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${receipt.paymentMethod || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Description:</span>
              <span class="info-value">${receipt.description || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-label">Amount Paid</div>
          <div class="amount-value">₹${(receipt.amount || 0).toLocaleString()}</div>
        </div>

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line">Student Signature</div>
          </div>
          <div class="signature">
            <div class="signature-line">Authorized Signature</div>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-weight: bold;">Print Receipt</button>
          <button onclick="window.close()" style="background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Close</button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Back */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg shadow-blue-200/50">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-sm">
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Fee Receipts</h1>
                <p className="text-blue-100 text-sm mt-0.5">View, download, and manage your payment history</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Total Payments</p>
              <p className="text-3xl font-black">{receipts.length}</p>
            </div>
          </div>
        </div>

        {!receipts || receipts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <SearchX size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Receipts Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm">You haven't made any fee payments yet. Make a payment to generate receipts.</p>
            <button 
              onClick={() => navigate('/student/fee-payment')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-200"
            >
              Make a Payment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div key={receipt.id || receipt.receiptNumber} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col sm:flex-row gap-6 justify-between sm:items-center">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                      <h3 className="font-bold text-gray-900">{receipt.description || 'Fee Payment'}</h3>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">#{receipt.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(receipt.paymentDate)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="capitalize">{receipt.paymentMethod}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                      <p className="text-lg font-heading font-bold tracking-tight text-gray-900">₹{(receipt.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-0 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={() => setSelectedReceipt(receipt)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => generateReceiptPDF(receipt)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Receipt Preview Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative border border-gray-100">
              
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              
              <div className="px-8 pt-8 pb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Receipt</h3>
                  <p className="text-emerald-600 text-sm mt-1 flex items-center gap-1.5 font-medium"><ShieldCheck size={16}/> Verified Payment</p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="px-8 py-2 overflow-y-auto">
                <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-6 relative overflow-hidden">
                  
                  {/* Perforated edge effect */}
                  <div className="absolute -left-2 -right-2 top-0 flex justify-between space-x-1 opacity-20">
                    {Array.from({length: 40}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>)}
                  </div>
                  
                  <div className="flex justify-between items-end mb-6 mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                      <p className="text-3xl font-heading font-bold tracking-tight text-gray-900">₹{(selectedReceipt.amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-sm pt-2">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200/60 border-dashed">
                      <span className="text-gray-500 font-medium">Receipt No</span>
                      <span className="font-bold text-gray-900">#{selectedReceipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200/60 border-dashed">
                      <span className="text-gray-500 font-medium">Date</span>
                      <span className="font-bold text-gray-900">{formatDate(selectedReceipt.paymentDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200/60 border-dashed">
                      <span className="text-gray-500 font-medium">Payment Method</span>
                      <span className="font-bold text-gray-900 capitalize">{selectedReceipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200/60 border-dashed">
                      <span className="text-gray-500 font-medium">Student Name</span>
                      <span className="font-bold text-gray-900">{studentData?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200/60 border-dashed">
                      <span className="text-gray-500 font-medium">Student ID</span>
                      <span className="font-bold text-gray-900">{studentData?.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-500 font-medium">Description</span>
                      <span className="font-bold text-gray-900 text-right max-w-[150px] truncate">{selectedReceipt.description || 'Fee Payment'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-6 bg-white flex gap-3">
                <button
                  onClick={() => generateReceiptPDF(selectedReceipt)}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;