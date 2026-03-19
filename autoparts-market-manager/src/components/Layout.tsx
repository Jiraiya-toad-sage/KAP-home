import React from 'react';
import { LayoutDashboard, PlusCircle, History, Settings, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Active Jobs' },
    { id: 'new-job', icon: PlusCircle, label: 'New Job' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <PlusCircle size={20} />
            </span>
            AutoParts <span className="text-emerald-600">Pro</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Digital Shop Diary</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-neutral-200 p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-neutral-900 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-neutral-900">Shop Owner</p>
              <p className="text-xs text-neutral-500">Auto Parts Market</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              SO
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
