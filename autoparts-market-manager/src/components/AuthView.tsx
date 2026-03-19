import React from 'react';
import { motion } from 'motion/react';
import { Store, Shield, Zap, TrendingUp, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

export default function AuthView() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row font-sans">
      {/* Left Side: Marketing */}
      <div className="lg:w-1/2 bg-emerald-600 p-8 sm:p-12 lg:p-24 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full -mr-32 -mt-32 sm:-mr-48 sm:-mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-400/20 rounded-full -ml-32 -mb-32 sm:-ml-48 sm:-mb-48 blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 shadow-2xl mb-6 sm:mb-8">
            <Store size={24} className="sm:hidden" />
            <Store size={32} className="hidden sm:block" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 sm:mb-6">
            Workshop<br />Diary
          </h1>
          <p className="text-lg sm:text-xl text-emerald-50 font-medium max-w-md mb-8 sm:mb-12">
            The modern operating system for your auto parts shop. Manage jobs, track inventory, and grow your business.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <Feature icon={Shield} title="Secure Data" desc="Your shop's data is isolated and encrypted." />
            <Feature icon={Zap} title="Real-time" desc="Sync jobs across all your devices instantly." />
            <Feature icon={TrendingUp} title="Analytics" desc="Track revenue and popular spare parts." />
            <Feature icon={Store} title="Multi-tenant" desc="Built for independent shop owners." />
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-24 flex flex-col justify-center items-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-2">Welcome Back</h2>
          <p className="text-sm sm:text-base text-neutral-500 font-medium mb-8 sm:mb-12">Sign in to manage your workshop diary</p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 sm:gap-4 bg-white border-2 border-neutral-100 hover:border-emerald-600 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-xl group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6" />
            Continue with Google
            <LogIn size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity sm:hidden" />
            <LogIn size={20} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
          </button>

          <p className="mt-12 text-sm text-neutral-400 font-medium">
            By signing in, you agree to our <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-emerald-100/80">{desc}</p>
      </div>
    </div>
  );
}
