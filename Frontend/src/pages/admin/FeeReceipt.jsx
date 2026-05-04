import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services';
import html2pdf from 'html2pdf.js';
import { 
  Printer, Download, ArrowLeft, Search, 
  FileText, User, CreditCard, History,
  CheckCircle, Loader2, Sparkles, GraduationCap, Info, AlertCircle
} from 'lucide-react';

const FeeReceipt = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await studentsAPI.getAll();
        setStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setReceiptData({
      ...student,
      receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
    setShowReceipt(false);
  };

  const generateReceipt = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowReceipt(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const printReceipt = () => {
    const element = document.getElementById('receipt-content');
    const opt = {
      margin: 10,
      filename: `Receipt_${receiptData.studentId || 'N_A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000,
        width: element.offsetWidth + 20
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };

    html2pdf().set(opt).from(element).outputPdf('bloburl').then((pdfUrl) => {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        alert("Please allow pop-ups to print the receipt.");
      }
    });
  };

  const downloadReceipt = () => {
    const element = document.getElementById('receipt-content');
    const opt = {
      margin: 10,
      filename: `Receipt_${receiptData.studentId || 'N_A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000,
        width: element.offsetWidth + 20
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loadingStudents) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
      <div className="flex flex-col items-center">
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Student Database...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2 print:hidden">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform -rotate-3 z-10">
            <FileText size={32} />
          </div>
          <div className="z-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fee Receipt Generator</h1>
            <p className="text-gray-500 mt-1">Issue professional receipts and manage payment records securely.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Selection */}
          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 print:hidden">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Search size={20} className="text-indigo-600"/> Find Student</h2>
              
              <div className="relative mb-4 z-20">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name or PRN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedStudent) setSelectedStudent(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
                
                {searchTerm && !selectedStudent && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {filteredStudents.length > 0 ? (
                      <div className="py-2">
                        {filteredStudents.map(s => (
                          <button key={s.id} onClick={() => handleStudentSelect(s)} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors">
                            <div>
                              <span className="block font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{s.name}</span>
                              <span className="block text-xs text-gray-500">{s.studentId} • {s.department}</span>
                            </div>
                            <CheckCircle size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No students found matching "{searchTerm}"</div>
                    )}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className="mt-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-lg text-indigo-600 shadow-sm border border-indigo-100">
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedStudent.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium">{selectedStudent.studentId} • {selectedStudent.department}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-indigo-50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Total Fees</span>
                        <span className="font-bold text-gray-900">₹{selectedStudent.fees?.total?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Paid</span>
                        <span className="font-bold text-emerald-600">₹{selectedStudent.fees?.paid?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">Pending</span>
                        <span className="font-bold text-rose-600">₹{selectedStudent.fees?.pending?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={generateReceipt}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? <><Loader2 size={18} className="animate-spin"/> Processing...</> : <>Generate Preview <Sparkles size={18} /></>}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 text-blue-800 text-sm">
              <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p>Receipts are generated dynamically based on the current financial records and payment history in the database.</p>
            </div>
          </aside>

          {/* Right Panel: Preview */}
          <main className="lg:col-span-7 xl:col-span-8">
            {showReceipt && receiptData ? (
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500 print:p-0 print:border-none print:shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
                  <h2 className="text-xl font-bold text-gray-900">Receipt Preview</h2>
                  <div className="flex gap-3">
                    <button onClick={printReceipt} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2 text-sm">
                      <Printer size={16} /> Print
                    </button>
                    <button onClick={downloadReceipt} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 text-sm">
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-8 rounded-2xl border border-gray-200 overflow-x-auto print:p-0 print:border-none print:bg-white print:overflow-visible">
                  
                  {/* Actual Receipt HTML to be converted to PDF */}
                  <div id="receipt-content" className="bg-white w-[800px] max-w-full mx-auto p-6 sm:p-8 shadow-sm border border-gray-200 text-gray-800 font-sans relative print:w-full print:shadow-none print:border print:border-gray-300 print:p-6 break-inside-avoid">
                    
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                      <GraduationCap size={400} />
                    </div>

                    <div className="relative z-10">
                      {/* Receipt Header */}
                      <div className="flex items-start gap-6 border-b-2 border-indigo-900 pb-6 mb-6">
                        <div className="w-20 h-20 bg-indigo-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={48} />
                        </div>
                        <div>
                          <h1 className="text-3xl font-black text-indigo-900 tracking-tight mb-1">ACADEMIC FEE RECEIPT</h1>
                          <p className="text-lg font-bold text-gray-800">Bharat Ratna Indira Gandhi College of Engineering, Solapur</p>
                          <p className="text-sm text-gray-500">Kegaon, Solapur - 413255, Maharashtra, India</p>
                        </div>
                      </div>

                      {/* Receipt Meta */}
                      <div className="flex justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 print:bg-white print:border-gray-300">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Receipt Number</p>
                          <p className="font-bold text-gray-900">{receiptData.receiptNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                          <p className="font-bold text-gray-900">{receiptData.date} • {receiptData.time}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Status</p>
                          <p className={`font-bold ${receiptData.fees?.pending === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {receiptData.fees?.pending === 0 ? 'Fully Paid' : 'Partial Payment'}
                          </p>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-indigo-900 mb-3 border-b border-gray-200 pb-2">Student Information</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Full Name</p>
                            <p className="font-semibold text-gray-900 text-lg">{receiptData.name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">PRN (Student ID)</p>
                            <p className="font-semibold text-gray-900 text-lg">{receiptData.studentId}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Department</p>
                            <p className="font-semibold text-gray-900 text-lg">{receiptData.department}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Academic Year</p>
                            <p className="font-semibold text-gray-900 text-lg">Year {receiptData.year}</p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-indigo-900 mb-3 border-b border-gray-200 pb-2">Financial Summary</h3>
                        <table className="w-full text-left mb-6">
                          <thead className="bg-gray-50 border-y border-gray-200">
                            <tr>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="py-4 px-4 font-medium text-gray-900">Annual Tuition Fees</td>
                              <td className="py-4 px-4 font-medium text-gray-900 text-right">{(receiptData.fees?.total || 0).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="py-4 px-4 font-medium text-gray-600">Scholarship / Adjustments</td>
                              <td className="py-4 px-4 font-medium text-gray-600 text-right">- 0</td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                              <td className="py-4 px-4 font-bold text-emerald-800">Amount Previously Paid</td>
                              <td className="py-4 px-4 font-bold text-emerald-600 text-right">{(receiptData.fees?.paid || 0).toLocaleString()}</td>
                            </tr>
                          </tbody>
                          <tfoot className="border-t-2 border-gray-900">
                            <tr>
                              <td className="py-4 px-4 font-black text-gray-900 text-lg">Total Settled Amount</td>
                              <td className="py-4 px-4 font-black text-indigo-700 text-xl text-right">₹{(receiptData.fees?.paid || 0).toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>

                        <div className="flex justify-end p-3 bg-rose-50 border border-rose-100 rounded-xl">
                          <span className="font-bold text-rose-900 mr-4">Remaining Balance:</span>
                          <span className="font-black text-rose-700 text-lg">₹{(receiptData.fees?.pending || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 items-end">
                        <div className="text-xs text-gray-500 space-y-1 pr-4">
                          <p className="font-semibold text-gray-700">Notice:</p>
                          <p>This is a computer-generated electronic receipt.</p>
                          <p>No physical signature is required for validity.</p>
                          <p className="mt-2 text-indigo-900 font-semibold">Issued by: College Management System • {new Date().getFullYear()}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="w-48 border-b border-gray-400 mb-2"></div>
                          <p className="font-bold text-gray-900 text-sm w-48 text-center">Authorized Signatory</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <FileText size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Preview Available</h3>
                <p className="text-gray-500 max-w-sm">Select a student from the panel and click "Generate Preview" to view and download their fee receipt.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;