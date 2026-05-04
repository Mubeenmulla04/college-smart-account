import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, feeReceiptsAPI, studentsAPI } from '../../services';
import {
  CreditCard, ArrowLeft, ArrowRight, Loader2, CheckCircle2,
  ShieldCheck, History, AlertCircle,
  Smartphone, Building2, Wallet, Lock, BadgeCheck, Receipt
} from 'lucide-react';

const FeePayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'online',
    description: 'Fee Payment'
  });
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoadingStudent(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
        if (data?.id) {
          const studentId = data.studentId || data.id;
          const data2 = await dashboardAPI.getFeesReceiptByStudentId(studentId);
          setReceiptData(data2);
          if (data?.fees?.pending > 0) {
            const remainingPending = data2 ? (data.fees.pending - data2.amount) : data.fees.pending;
            setPaymentData(prev => ({ ...prev, amount: Math.max(0, remainingPending) }));
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoadingStudent(false);
      }
    };
    if (user?.email) fetchStudentData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (parseFloat(paymentData.amount) > studentData?.fees?.pending) newErrors.amount = 'Amount cannot exceed pending fees';
    if (!paymentData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!studentData?.id) { setErrors({ general: 'Student data is invalid. Please refresh.' }); return; }
    setIsLoading(true);
    try {
      const amount = parseFloat(paymentData.amount);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const receiptNumber = `RCP-${rand(4)}-${rand(3)}`;
      const paymentDate = new Date().toISOString().split('T')[0];
      const receiptData2 = {
        studentId: studentData.studentId || studentData.id,
        studentName: studentData.name,
        amount, date: paymentDate,
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        receiptNumber, status: 'Completed'
      };
      try { await feeReceiptsAPI.create(receiptData2); } catch (e) { console.error('Receipt error:', e); }
      const updatedFees = {
        ...studentData.fees,
        paid: studentData.fees.paid + amount,
        pending: studentData.fees.pending - amount,
        lastPayment: paymentDate,
        paymentHistory: [...(studentData.fees.paymentHistory || []), { id: receiptNumber, date: paymentDate, amount, method: paymentData.paymentMethod, receiptNumber, status: 'Completed' }]
      };
      const updateResult = await studentsAPI.updateFees(studentData.id, updatedFees);
      if (updateResult?.success === false) throw new Error(updateResult.error || 'Failed to update');
      setPaymentSuccess(true);
      window.scrollTo(0, 0);
      setStudentData(prev => ({ ...prev, fees: updatedFees }));
      setReceiptData({ amount: updatedFees.paid, count: receiptData?.count ? receiptData.count + 1 : 1 });
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ general: 'Failed to process payment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'online', label: 'Online Payment', icon: Wallet, desc: 'Pay via portal' },
    { id: 'upi', label: 'UPI Transfer', icon: Smartphone, desc: 'GPay, PhonePe' },
    { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'NEFT / RTGS' },
    { id: 'card', label: 'Debit / Credit', icon: CreditCard, desc: 'Visa, Mastercard' },
  ];

  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Initializing payment gateway…</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center max-w-sm w-full">
          <AlertCircle size={48} className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-gray-500 mb-6 text-sm">We couldn't load your fee details. Please contact support.</p>
          <Link to="/student/dashboard" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 p-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-emerald-100 flex flex-col items-center text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <BadgeCheck size={52} className="text-emerald-600" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">Your payment of <span className="font-bold text-gray-800">₹{Number(paymentData.amount).toLocaleString()}</span> has been processed securely.</p>
          <div className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8 space-y-3 text-left">
            {[
              { label: 'Transaction ID', value: Math.random().toString(36).substring(2, 10).toUpperCase() },
              { label: 'Date & Time', value: new Date().toLocaleString('en-IN') },
              { label: 'Payment Method', value: paymentMethods.find(m => m.id === paymentData.paymentMethod)?.label || paymentData.paymentMethod },
              { label: 'Status', value: '✅ Completed' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-semibold text-gray-900">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button onClick={() => navigate('/student/receipt')} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
              <Receipt size={18} /> Download Receipt
            </button>
            <button onClick={() => navigate('/student/dashboard', { replace: true })} className="flex-1 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalFees = studentData.fees.total || 1;
  const paidPct = Math.round((studentData.fees.paid / totalFees) * 100);

  return (
    <div className="w-full bg-gray-50 min-h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

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
                <CreditCard size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Fee Payment</h1>
                <p className="text-blue-100 text-sm mt-0.5">Secure · Instant · Bank-grade encryption</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Pending</p>
              <p className="text-2xl font-heading font-bold tracking-tight">₹{studentData.fees.pending.toLocaleString()}</p>
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <div className="flex justify-between text-xs text-blue-100 mb-2">
              <span>₹{studentData.fees.paid.toLocaleString()} paid</span>
              <span>{paidPct}% of ₹{studentData.fees.total.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
            </div>
          </div>
        </div>

        {/* Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <History size={16} /> Payment Overview
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Academic Fees', value: studentData.fees.total, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-100' },
                  { label: 'Amount Settled', value: studentData.fees.paid, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                  { label: 'Pending Amount', value: studentData.fees.pending, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
                ].map(row => (
                  <div key={row.label} className={`flex items-center justify-between p-4 rounded-2xl border ${row.bg}`}>
                    <span className="text-sm font-medium text-gray-600">{row.label}</span>
                    <span className={`font-heading font-bold tracking-tight text-base sm:text-lg ${row.color}`}>₹{row.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {studentData.fees.pending === 0 && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                  <p className="font-semibold text-sm">No pending dues — you're all clear!</p>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900">Secure Transaction</h3>
              </div>
              <p className="text-blue-800/70 text-sm leading-relaxed">
                Payments are processed via bank-grade 256-bit SSL encryption. We never store your card details.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-400" />
                <span className="text-xs text-blue-500 font-medium">PCI-DSS Compliant Gateway</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Make a Payment</h3>

            {studentData.fees.pending === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">All Dues Cleared!</h4>
                <p className="text-gray-500 text-sm mb-8 max-w-xs">You have successfully cleared all your academic fees for this term.</p>
                <button onClick={() => navigate('/student/receipt')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center gap-2">
                  <Receipt size={18} /> View Receipts
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-bold text-xl">₹</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-4 text-2xl font-black rounded-2xl border-2 outline-none transition-all ${
                        errors.amount
                          ? 'border-rose-300 bg-rose-50 text-rose-700'
                          : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900'
                      }`}
                      placeholder="0"
                      min="1"
                      max={studentData?.fees?.pending || 0}
                    />
                  </div>
                  {errors.amount ? (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.amount}
                    </p>
                  ) : (
                    <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                      <span>Min: ₹1</span>
                      <span>Max: ₹{studentData?.fees?.pending?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {[1000, 5000, 10000, studentData.fees.pending]
                    .filter((v, i, a) => a.indexOf(v) === i && v > 0)
                    .map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPaymentData(p => ({ ...p, amount: amt }))}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          Number(paymentData.amount) === amt
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {amt === studentData.fees.pending ? 'Pay Full' : `₹${amt.toLocaleString()}`}
                      </button>
                    ))}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {paymentMethods.map(method => {
                      const Icon = method.icon;
                      const active = paymentData.paymentMethod === method.id;
                      return (
                        <label key={method.id} className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col items-center text-center gap-2 ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                          <input type="radio" name="paymentMethod" value={method.id} checked={active} onChange={handleChange} className="hidden" />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-tight ${active ? 'text-blue-700' : 'text-gray-700'}`}>{method.label}</p>
                            <p className={`text-[10px] ${active ? 'text-blue-400' : 'text-gray-400'}`}>{method.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.paymentMethod && <p className="text-rose-500 text-sm mt-2">{errors.paymentMethod}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={paymentData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                    placeholder="e.g. First semester partial payment"
                  />
                </div>

                {/* Error */}
                {errors.general && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 text-rose-700">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{errors.general}</p>
                  </div>
                )}

                {/* Summary + Submit */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium">Total to Pay</span>
                    <span className="text-3xl font-black text-gray-900">
                      ₹{paymentData.amount ? Number(paymentData.amount).toLocaleString() : '0'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:shadow-none flex justify-center items-center gap-2"
                  >
                    {isLoading
                      ? <><Loader2 size={20} className="animate-spin" /> Processing…</>
                      : <><ShieldCheck size={20} /> Pay ₹{paymentData.amount ? Number(paymentData.amount).toLocaleString() : '0'} Securely <ArrowRight size={18} /></>
                    }
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Lock size={11} /> Encrypted &amp; Secure · 256-bit SSL
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePayment;