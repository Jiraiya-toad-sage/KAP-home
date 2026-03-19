import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, History, Settings, Plus, LogOut, Store } from 'lucide-react';
import Dashboard from './components/DashboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import NewJobModal from './components/NewJobModal';
import JobDetailView from './components/JobDetailView';
import AuthView from './components/AuthView';
import { auth, db, logout, Job, JobStatus, Shop } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Firestore Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
          setConnectionError("Firestore is offline. Please check your Firebase configuration or try re-provisioning.");
        }
      }
    }
    testConnection();
  }, []);

  // Error Handling
  const handleFirestoreError = (error: any, operation: string, path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType: operation,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if shop profile exists, if not create it
        const shopDocRef = doc(db, 'shops', currentUser.uid);
        try {
          const shopDoc = await getDoc(shopDocRef);
          if (!shopDoc.exists()) {
            const newShop: Shop = {
              id: currentUser.uid,
              name: currentUser.displayName || 'My Shop',
              ownerName: currentUser.displayName || 'Owner',
              ownerEmail: currentUser.email || '',
              ownerId: currentUser.uid,
              address: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(shopDocRef, newShop);
            setShop(newShop);
          } else {
            setShop(shopDoc.data() as Shop);
          }
        } catch (error) {
          handleFirestoreError(error, 'get/set', `shops/${currentUser.uid}`);
        }
      } else {
        setShop(null);
        setJobs([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Jobs Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'jobs'),
      where('shopId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
    }, (error) => {
      handleFirestoreError(error, 'list', 'jobs');
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        {connectionError && (
          <div className="max-w-md text-center p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <p className="font-bold mb-2">Connection Error</p>
            <p className="text-sm">{connectionError}</p>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  // Handle New Job
  const handleSaveNewJob = async (newJobData: Partial<Job>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJobData,
        shopId: user.uid,
        status: JobStatus.ACTIVE,
        totalAmount: 0,
        parts: [],
        createdAt: new Date().toISOString()
      });
      setIsNewJobModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, 'create', 'jobs');
    }
  };

  // Handle Update Job (Add/Remove Part)
  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), updates);
    } catch (error) {
      handleFirestoreError(error, 'update', `jobs/${jobId}`);
    }
  };

  const handleCompleteJob = async (jobId: string, amountPaid: number) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { 
        status: JobStatus.COMPLETED,
        amountPaid,
        completedAt: new Date().toISOString()
      });
      setSelectedJob(null);
    } catch (error) {
      handleFirestoreError(error, 'update', `jobs/${jobId}`);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { 
        status: JobStatus.CANCELLED,
        completedAt: new Date().toISOString()
      });
      setSelectedJob(null);
    } catch (error) {
      handleFirestoreError(error, 'update', `jobs/${jobId}`);
    }
  };

  const handleReopenJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { 
        status: JobStatus.ACTIVE,
        completedAt: null
      });
      // Keep the modal open to allow immediate edits
    } catch (error) {
      handleFirestoreError(error, 'update', `jobs/${jobId}`);
    }
  };

  const handleAddPayment = async (jobId: string, additionalAmount: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    try {
      const newAmountPaid = (job.amountPaid || 0) + additionalAmount;
      await updateDoc(doc(db, 'jobs', jobId), { 
        amountPaid: newAmountPaid
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `jobs/${jobId}`);
    }
  };

  const handleAddCustomerPayment = async (customerName: string, vehicleNumber: string, amount: number) => {
    const customerJobs = jobs
      .filter(j => 
        j.customerName.toLowerCase() === customerName.toLowerCase() && 
        j.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase() &&
        j.status === JobStatus.COMPLETED
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let remainingPayment = amount;

    for (const job of customerJobs) {
      if (remainingPayment <= 0) break;

      const balance = job.totalAmount - (job.amountPaid || 0);
      if (balance <= 0) continue;

      const paymentToApply = Math.min(remainingPayment, balance);
      
      try {
        await updateDoc(doc(db, 'jobs', job.id), {
          amountPaid: (job.amountPaid || 0) + paymentToApply
        });
        remainingPayment -= paymentToApply;
      } catch (error) {
        handleFirestoreError(error, 'update', `jobs/${job.id}`);
      }
    }
  };

  const handleWaiveCustomerBalance = async (customerName: string, vehicleNumber: string) => {
    const customerJobs = jobs
      .filter(j => 
        j.customerName.toLowerCase() === customerName.toLowerCase() && 
        j.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase() &&
        j.status === JobStatus.COMPLETED
      );

    for (const job of customerJobs) {
      const balance = job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0);
      if (balance <= 0) continue;

      try {
        await updateDoc(doc(db, 'jobs', job.id), {
          waivedAmount: (job.waivedAmount || 0) + balance
        });
      } catch (error) {
        handleFirestoreError(error, 'update', `jobs/${job.id}`);
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      handleFirestoreError(error, 'delete', `jobs/${jobId}`);
    }
  };

  const activeJobs = jobs.filter(j => j.status === JobStatus.ACTIVE);
  const historyJobs = jobs.filter(j => j.status === JobStatus.COMPLETED || j.status === JobStatus.CANCELLED);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Sidebar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-0 lg:w-24 bg-white border-t lg:border-t-0 lg:border-r border-neutral-200 z-50 flex lg:flex-col items-center justify-around lg:justify-center py-4 lg:py-10 gap-8 shadow-2xl lg:shadow-none">
        <div className="hidden lg:flex w-12 h-12 bg-emerald-600 rounded-2xl items-center justify-center text-white shadow-xl shadow-emerald-100 mb-auto">
          <Store size={24} />
        </div>
        
        <NavButton icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Shop" />
        <NavButton icon={History} active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
        <NavButton icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" />
        
        <button 
          onClick={() => logout()}
          className="lg:mt-auto p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-24 pb-24 lg:pb-0 min-h-screen">
        <header className="p-5 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              {activeTab === 'dashboard' ? 'Workshop Diary' : activeTab === 'history' ? 'Job History' : 'Shop Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5 sm:mt-1">
              {activeTab === 'dashboard' ? `Managing ${activeJobs.length} active vehicles` : activeTab === 'history' ? `Total ${historyJobs.length} jobs in history` : 'Manage your shop profile'}
            </p>
          </div>

          {activeTab === 'dashboard' && (
            <button 
              onClick={() => setIsNewJobModalOpen(true)}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-black text-white px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl shadow-neutral-200 transition-all flex items-center justify-center gap-3 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform sm:hidden" />
              <Plus size={20} className="group-hover:rotate-90 transition-transform hidden sm:block" />
              New Job Entry
            </button>
          )}
        </header>

        <div className="p-5 sm:p-10 pt-0">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <Dashboard 
                jobs={jobs} 
                onSelectJob={setSelectedJob} 
                onNewJob={() => setIsNewJobModalOpen(true)}
              />
            )}
            {activeTab === 'history' && (
              <HistoryView 
                jobs={historyJobs} 
                onSelectJob={setSelectedJob}
                onDeleteJob={handleDeleteJob}
                onAddCustomerPayment={handleAddCustomerPayment}
                onWaiveCustomerBalance={handleWaiveCustomerBalance}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView shop={shop} jobs={jobs} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isNewJobModalOpen && (
          <NewJobModal 
            isOpen={isNewJobModalOpen}
            onClose={() => setIsNewJobModalOpen(false)} 
            onSave={handleSaveNewJob} 
            jobs={jobs}
          />
        )}
        {selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm hidden sm:block"
            />
            <div className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-full overflow-y-auto no-scrollbar">
              <JobDetailView 
                job={jobs.find(j => j.id === selectedJob.id) || selectedJob} 
                jobs={jobs}
                onClose={() => setSelectedJob(null)}
                onUpdateJob={(updates) => handleUpdateJob(selectedJob.id, updates)}
                onComplete={(amountPaid) => handleCompleteJob(selectedJob.id, amountPaid)}
                onReopen={() => handleReopenJob(selectedJob.id)}
                onAddPayment={(amount) => handleAddPayment(selectedJob.id, amount)}
                onCancel={() => handleCancelJob(selectedJob.id)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative p-3 rounded-2xl transition-all group ${active ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}`}
    >
      <Icon size={24} />
      <span className="absolute left-full ml-4 px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block pointer-events-none">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -left-4 lg:left-auto lg:-right-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-600 rounded-full"
        />
      )}
    </button>
  );
}
