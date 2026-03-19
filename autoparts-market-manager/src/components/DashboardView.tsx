import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JobCard from './JobCard';
import { Job, JobStatus } from '../types';

interface DashboardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onNewJob: () => void;
}

export default function Dashboard({ jobs, onSelectJob, onNewJob }: DashboardProps) {
  const activeJobs = jobs.filter((j) => j.status === JobStatus.ACTIVE);
  const totalRevenue = jobs
    .filter(j => j.status !== JobStatus.CANCELLED)
    .reduce((acc, j) => acc + (j.amountPaid || 0), 0);
  const totalBalance = jobs
    .filter(j => j.status !== JobStatus.CANCELLED)
    .reduce((acc, j) => acc + (j.totalAmount - (j.amountPaid || 0)), 0);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayJobs = jobs.filter((j) => {
    const jobDate = new Date(j.createdAt);
    return (
      jobDate.getDate() === startOfToday.getDate() &&
      jobDate.getMonth() === startOfToday.getMonth() &&
      jobDate.getFullYear() === startOfToday.getFullYear()
    );
  });
  
  // Count unique customers by phone number
  const todayCustomers = new Set(todayJobs.map((j) => j.customerPhone.trim())).size;

  const stats = [
    { label: 'Active Jobs', value: activeJobs.length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Customers", value: todayCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Balance', value: `₹${totalBalance.toLocaleString()}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={20} className="sm:hidden" />
              <stat.icon size={28} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 sm:text-neutral-500 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{stat.label}</p>
              <p className="text-lg sm:text-3xl font-black text-neutral-900 truncate">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <LayoutDashboard size={24} className="text-emerald-600" />
            Active Workshop Jobs
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {activeJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 py-20 flex flex-col items-center justify-center bg-white border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400 space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center">
                  <AlertCircle size={40} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neutral-900">No active jobs right now</p>
                  <p className="text-sm">Start a new job from the top button</p>
                </div>
              </motion.div>
            ) : (
              activeJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
