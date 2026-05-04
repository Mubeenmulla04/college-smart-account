import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services';
import { 
  History, Loader2, SearchX, CheckCircle2, 
  Calendar, CreditCard, ArrowLeft, Download, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchStudentData();
    }
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 transform -rotate-3 z-10 flex-shrink-0">
            <History size={32} />
          </div>
          <div className="z-10 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Logs</h1>
              <p className="text-gray-500 mt-1">Detailed history of all your internal transactions.</p>
            </div>
            <button onClick={() => navigate('/student/receipt')} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2 border border-gray-200 shadow-sm self-start sm:self-auto">
              <Download size={16} /> Get Receipts
            </button>
          </div>
        </div>

        {(!studentData || !studentData.fees.paymentHistory || studentData.fees.paymentHistory.length === 0) ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <SearchX size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm">We couldn't find any payment history for your account.</p>
            <button 
              onClick={() => navigate('/student/fee-payment')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-200"
            >
              Make a Payment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-gray-700 font-bold border-b border-gray-100 pb-4">
              <ShieldCheck size={20} className="text-emerald-500" />
              <span>Verified Ledger</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...studentData.fees.paymentHistory]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((payment, index) => (
                    <tr key={payment.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(payment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 capitalize">
                          <CreditCard size={14} className="text-gray-400" />
                          {payment.method}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          #{payment.receiptNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-emerald-600 text-lg">
                          +₹{payment.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
