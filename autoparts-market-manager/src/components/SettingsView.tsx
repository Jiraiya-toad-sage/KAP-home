import React from 'react';
import { Settings, User, Store, Bell, Shield, LogOut, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { logout } from '../firebase';
import { Shop, Job } from '../types';

interface SettingsViewProps {
  shop: Shop | null;
  jobs: Job[];
}

export default function SettingsView({ shop, jobs }: SettingsViewProps) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleExport = () => {
    if (jobs.length === 0) {
      return;
    }

    const headers = ['Date', 'Customer', 'Phone', 'Vehicle', 'Model', 'Status', 'Total Amount'];
    const csvContent = [
      headers.join(','),
      ...jobs.map(job => [
        new Date(job.createdAt).toLocaleDateString(),
        `"${job.customerName}"`,
        `"${job.customerPhone}"`,
        `"${job.vehicleNumber}"`,
        `"${job.vehicleModel}"`,
        job.status,
        job.totalAmount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shop_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sections = [
    { id: 'export', icon: TrendingUp, label: 'Export All Data', description: 'Download all your job records as an Excel-ready CSV file', action: handleExport },
    { id: 'shop', icon: Store, label: 'Shop Details', description: 'Manage your shop name, address and contact info' },
    { id: 'profile', icon: User, label: 'Owner Profile', description: 'Update your personal information and password' },
    { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Configure alerts for low stock and job completion' },
    { id: 'security', icon: Shield, label: 'Security', description: 'Manage your account security and data privacy' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-10">
      <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-neutral-100 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 flex items-center justify-center text-emerald-700 text-2xl sm:text-3xl font-black shrink-0">
            {shop?.name?.substring(0, 2).toUpperCase() || 'SO'}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 truncate">{shop?.name || 'Shop Owner'}</h3>
            <p className="text-sm sm:text-base text-neutral-500 truncate">{shop?.address || 'Auto Parts Market'}</p>
            <span className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
              Cloud SaaS Mode
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:gap-4">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={section.action}
              className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:bg-neutral-50 transition-all text-left group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                <section.icon size={20} className="sm:hidden" />
                <section.icon size={24} className="hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 truncate">{section.label}</h4>
                <p className="text-xs sm:text-sm text-neutral-400 sm:text-neutral-500 truncate">{section.description}</p>
              </div>
              <div className="text-neutral-300 group-hover:text-emerald-600 transition-colors shrink-0">
                {section.id === 'export' ? <TrendingUp size={18} /> : <Settings size={18} />}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="pt-8 border-t border-neutral-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            Sign Out of All Devices
          </button>
        </div>
      </div>

      <div className="text-center text-neutral-400 text-xs">
        <p>AutoParts Pro v1.0.0 (MVP)</p>
        <p className="mt-1">© 2026 AutoParts Market Manager. All rights reserved.</p>
      </div>
    </div>
  );
}
