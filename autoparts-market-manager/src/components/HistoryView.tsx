import React, { useState } from 'react';
import { Search, History, User, Users, Car, Calendar, ChevronRight, Trash2, AlertTriangle, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, JobStatus } from '../firebase';

interface HistoryViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onAddCustomerPayment: (customerName: string, vehicleNumber: string, amount: number) => void;
  onWaiveCustomerBalance: (customerName: string, vehicleNumber: string) => void;
}

export default function HistoryView({ jobs, onSelectJob, onDeleteJob, onAddCustomerPayment, onWaiveCustomerBalance }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'completed' | 'cancelled' | 'khata'>('completed');
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ customerName: string; vehicleNumber: string; totalBalance: number } | null>(null);
  const [waiverConfirm, setWaiverConfirm] = useState<{ customerName: string; vehicleNumber: string; totalBalance: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Group jobs for Khata view
  const khataData = React.useMemo(() => {
    const groups: { [key: string]: { customerName: string; vehicleNumber: string; totalBalance: number; lastJobDate: string; jobCount: number } } = {};
    
    jobs.forEach(job => {
      if (job.status === JobStatus.CANCELLED) return;
      
      const key = `${job.customerName.toLowerCase()}_${job.vehicleNumber.toLowerCase()}`;
      const balance = job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0);
      
      if (!groups[key]) {
        groups[key] = {
          customerName: job.customerName,
          vehicleNumber: job.vehicleNumber,
          totalBalance: 0,
          lastJobDate: job.createdAt,
          jobCount: 0
        };
      }
      
      groups[key].totalBalance += balance;
      groups[key].jobCount += 1;
      if (new Date(job.createdAt) > new Date(groups[key].lastJobDate)) {
        groups[key].lastJobDate = job.createdAt;
      }
    });

    return Object.values(groups)
      .filter(item => 
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }, [jobs, searchTerm]);

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'khata') return false;
    
    const matchesSearch = 
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = job.status === filter.toUpperCase();
    
    return matchesSearch && matchesFilter;
  });

  const confirmDelete = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    setJobToDelete(jobId);
  };

  const handleDelete = () => {
    if (jobToDelete) {
      onDeleteJob(jobToDelete);
      setJobToDelete(null);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModal && paymentAmount) {
      const amount = parseFloat(paymentAmount);
      if (amount > 0) {
        onAddCustomerPayment(paymentModal.customerName, paymentModal.vehicleNumber, amount);
        setPaymentModal(null);
        setPaymentAmount('');
      }
    }
  };

  const handleWaiverSubmit = () => {
    if (waiverConfirm) {
      onWaiveCustomerBalance(waiverConfirm.customerName, waiverConfirm.vehicleNumber);
      setWaiverConfirm(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Delete Job Record?</h3>
              <p className="text-neutral-500 mb-8">This action cannot be undone. All data for this job will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setJobToDelete(null)}
                  className="flex-1 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Additional Payment Modal */}
      <AnimatePresence>
        {paymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Add Payment</h3>
                <button onClick={() => setPaymentModal(null)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1">Customer</p>
                <p className="text-lg font-bold text-neutral-900">{paymentModal.customerName}</p>
                <p className="text-sm text-neutral-600 font-medium">{paymentModal.vehicleNumber}</p>
                <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Current Balance</span>
                  <span className="text-lg font-black text-red-600">₹{paymentModal.totalBalance.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Payment Amount (₹)</label>
                  <input
                    autoFocus
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount received"
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg font-bold"
                    required
                    max={paymentModal.totalBalance}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  Record Payment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Waiver Confirmation Modal */}
      <AnimatePresence>
        {waiverConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Clear Balance?</h3>
              <p className="text-neutral-500 mb-8">
                Are you sure you want to clear the remaining balance of <span className="font-bold text-neutral-900">₹{waiverConfirm.totalBalance.toLocaleString()}</span> for <span className="font-bold text-neutral-900">{waiverConfirm.customerName}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setWaiverConfirm(null)}
                  className="flex-1 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWaiverSubmit}
                  className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-100 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vehicle or customer..."
            className="w-full pl-11 pr-4 py-3 sm:py-4 bg-white border border-neutral-200 rounded-xl sm:rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm sm:text-base"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto no-scrollbar">
          {(['completed', 'cancelled', 'khata'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {f === 'khata' ? 'Customer Accounts (Khata)' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filter === 'khata' ? (
            khataData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-neutral-400 space-y-4"
              >
                <Users size={64} strokeWidth={1} />
                <p className="text-lg font-medium">No customer accounts found</p>
              </motion.div>
            ) : (
              khataData.map((item) => (
                <motion.div
                  key={`${item.customerName}_${item.vehicleNumber}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-neutral-200 p-4 sm:p-6 rounded-2xl hover:shadow-md transition-all group relative"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <User size={28} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                          {item.customerName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-500">
                          <div className="flex items-center gap-1.5 uppercase font-bold tracking-tight text-neutral-700">
                            <Car size={12} />
                            <span>{item.vehicleNumber}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <History size={12} />
                            <span>{item.jobCount} Jobs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`text-right px-4 sm:px-6 py-3 rounded-2xl border min-w-[120px] sm:min-w-[160px] ${
                          item.totalBalance > 50 
                            ? 'bg-red-50 border-red-100' 
                            : item.totalBalance > 0.5 
                              ? 'bg-amber-50 border-amber-100' 
                              : 'bg-emerald-50 border-emerald-100'
                        }`}>
                          <p className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1 ${
                            item.totalBalance > 50 
                              ? 'text-red-500' 
                              : item.totalBalance > 0.5 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>Total Outstanding</p>
                          <p className={`text-lg sm:text-2xl font-black ${
                            item.totalBalance > 50 
                              ? 'text-red-600' 
                              : item.totalBalance > 0.5 
                                ? 'text-amber-700' 
                                : 'text-emerald-700'
                          }`}>₹{item.totalBalance.toLocaleString()}</p>
                        </div>
                        {item.totalBalance > 0 && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setPaymentModal({ customerName: item.customerName, vehicleNumber: item.vehicleNumber, totalBalance: item.totalBalance })}
                              className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus size={14} />
                              <span>Add Payment</span>
                            </button>
                            <button
                              onClick={() => setWaiverConfirm({ customerName: item.customerName, vehicleNumber: item.vehicleNumber, totalBalance: item.totalBalance })}
                              className="px-4 sm:px-6 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2"
                            >
                              <AlertTriangle size={14} />
                              <span>Clear Balance</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-neutral-400 space-y-4"
              >
                <History size={64} strokeWidth={1} />
                <p className="text-lg font-medium">No history found matching your search</p>
              </motion.div>
            ) : (
              filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelectJob(job)}
                className="bg-white border border-neutral-200 p-4 sm:p-6 rounded-2xl hover:shadow-md transition-all cursor-pointer group relative"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                      <Car size={24} className="sm:hidden" />
                      <Car size={28} className="hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 uppercase tracking-tight truncate">
                          {job.vehicleNumber}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          job.status === JobStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <User size={12} />
                          <span className="truncate">{job.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-neutral-50 border border-neutral-100 min-w-[90px] sm:min-w-[120px]">
                        <p className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-bold tracking-widest mb-0.5">Total</p>
                        <p className="text-sm sm:text-xl font-black text-neutral-900">₹{job.totalAmount.toLocaleString()}</p>
                      </div>
                      {job.status === JobStatus.COMPLETED && (
                        <div className={`text-right px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border min-w-[90px] sm:min-w-[120px] ${
                          (job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)) > 0 
                            ? 'bg-red-50 border-red-100' 
                            : 'bg-emerald-50 border-emerald-100'
                        }`}>
                          <p className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-widest mb-0.5 ${
                            (job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)) > 0 ? 'text-red-500' : 'text-emerald-600'
                          }`}>Balance</p>
                          <p className={`text-sm sm:text-xl font-bold ${
                            (job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)) > 0 ? 'text-red-600' : 'text-emerald-700'
                          }`}>₹{(job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => confirmDelete(e, job.id)}
                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={18} className="sm:hidden" />
                        <Trash2 size={20} className="hidden sm:block" />
                      </button>
                      <div className="p-1 sm:p-2 rounded-full bg-neutral-50 text-neutral-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <ChevronRight size={20} className="sm:hidden" />
                        <ChevronRight size={24} className="hidden sm:block" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
