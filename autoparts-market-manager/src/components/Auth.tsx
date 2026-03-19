import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Shield, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Left Side: Branding & Value Prop */}
      <div className="lg:w-1/2 bg-emerald-600 p-8 lg:p-20 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <Store size={32} />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
            AUTOPARTS<br />PRO
          </h1>
          <p className="mt-6 text-xl text-emerald-100 max-w-md font-medium">
            The modern operating system for automotive workshops. Manage jobs, track inventory, and grow your business.
          </p>
        </div>

        <div className="mt-12 lg:mt-0 grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
          <Feature icon={Shield} title="Secure Cloud" desc="Your data is encrypted and backed up automatically." />
          <Feature icon={TrendingUp} title="Business Insights" desc="Track revenue and popular parts in real-time." />
          <Feature icon={Zap} title="Instant Billing" desc="Generate professional invoices in seconds." />
          <Feature icon={Store} title="Multi-Shop" desc="Manage multiple locations from one dashboard." />
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right Side: Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full space-y-10"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-neutral-900 tracking-tight">Get Started</h2>
            <p className="text-neutral-500 font-medium">Join 500+ shop owners managing their business digitally.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full group bg-white border-2 border-neutral-200 hover:border-emerald-600 p-5 rounded-2xl flex items-center justify-center gap-4 transition-all hover:shadow-xl hover:shadow-emerald-50/50 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  <span className="text-lg font-bold text-neutral-700 group-hover:text-emerald-700">Continue with Google</span>
                  <ChevronRight size={20} className="text-neutral-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-50 text-neutral-400 font-bold uppercase tracking-widest">Enterprise Ready</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                "AutoParts Pro has completely changed how I manage my workshop. No more paper diaries or lost bills."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                  RK
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Rajesh Kumar</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Owner, RK Auto Works</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-neutral-400 text-xs font-medium">
            By continuing, you agree to our <a href="#" className="underline hover:text-emerald-600">Terms of Service</a> and <a href="#" className="underline hover:text-emerald-600">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="space-y-2">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-lg leading-tight">{title}</h3>
      <p className="text-emerald-100/70 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
