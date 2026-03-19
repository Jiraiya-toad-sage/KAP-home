import React, { useState } from 'react';
import { X, Save, User, Phone, Car, Tag, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, JobStatus } from '../firebase';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<Job>) => void;
  jobs: Job[];
}

export default function NewJobModal({ isOpen, onClose, onSave, jobs }: NewJobModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleNumber: '',
    vehicleModel: '',
  });

  const handleVehicleNumberChange = (val: string) => {
    const vNum = val.toUpperCase();
    setFormData(prev => ({ ...prev, vehicleNumber: vNum }));

    if (vNum.length >= 3) {
      // Find the most recent job with this vehicle number
      const existingJob = [...jobs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .find(j => j.vehicleNumber.toUpperCase() === vNum);

      if (existingJob) {
        setFormData(prev => ({
          ...prev,
          // Auto-fill if fields are empty
          customerName: prev.customerName === '' ? existingJob.customerName : prev.customerName,
          customerPhone: prev.customerPhone === '' ? existingJob.customerPhone : prev.customerPhone,
          vehicleModel: prev.vehicleModel === '' ? existingJob.vehicleModel : prev.vehicleModel,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: JobStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      parts: [],
      totalAmount: 0,
    });
    setFormData({
      customerName: '',
      customerPhone: '',
      vehicleNumber: '',
      vehicleModel: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="bg-white w-full max-w-lg h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-emerald-600 text-white shrink-0">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <PlusCircle size={20} className="sm:hidden" />
                <PlusCircle size={24} className="hidden sm:block" />
                Start New Job
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={14} />
                    Vehicle Number
                  </label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleVehicleNumberChange(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
                    placeholder="e.g. DL 01 AB 1234"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Car size={14} />
                    Vehicle Model
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. Honda City 2022"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} />
                    Customer Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Create Job Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

