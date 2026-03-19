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
  const totalRevenue = jobs.reduce((acc, j) => acc + j.totalAmount, 0);
  const totalCustomers = new Set(jobs.map((j) => j.customerPhone)).size;

  const stats = [
    { label: 'Active Jobs', value: activeJobs.length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-neutral-900">{stat.value}</p>
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
