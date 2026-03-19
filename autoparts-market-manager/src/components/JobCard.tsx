import React from 'react';
import { Car, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Job, JobStatus } from '../firebase';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  key?: string;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const isCompleted = job.status === JobStatus.COMPLETED;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-white border border-neutral-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 sm:gap-6 relative overflow-hidden ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
        isCompleted ? 'bg-neutral-100 text-neutral-500' : 'bg-emerald-100 text-emerald-700'
      }`}>
        <Car size={24} className="sm:hidden" />
        <Car size={32} className="hidden sm:block" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 uppercase tracking-tight truncate">
            {job.vehicleNumber}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${
            isCompleted ? 'bg-neutral-200 text-neutral-600' : 'bg-emerald-600 text-white'
          }`}>
            {job.status}
          </span>
        </div>
        <p className="text-neutral-600 font-medium text-sm sm:text-base truncate">{job.customerName}</p>
        <p className="text-xs sm:text-sm text-neutral-500 truncate">{job.vehicleModel}</p>
      </div>

      <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1 text-neutral-400 text-[10px] sm:text-sm">
          <Clock size={12} className="sm:hidden" />
          <Clock size={14} className="hidden sm:block" />
          <span>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-lg sm:text-2xl font-black text-neutral-900">
          ₹{job.totalAmount.toLocaleString()}
        </div>
        <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">
          {job.parts.length} parts
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-200 hidden lg:block">
        <ChevronRight size={20} />
      </div>
    </motion.div>
  );
}
