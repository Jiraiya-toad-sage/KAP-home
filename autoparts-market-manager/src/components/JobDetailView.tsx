import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CheckCircle, Printer, ArrowLeft, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, JobStatus, Part } from '../firebase';

interface JobDetailViewProps {
  job: Job;
  jobs: Job[];
  onClose: () => void;
  onUpdateJob: (updates: Partial<Job>) => void;
  onComplete: (amountPaid: number) => void;
  onReopen: () => void;
  onAddPayment: (amount: number) => void;
  onCancel: () => void;
}

export default function JobDetailView({ job, jobs, onClose, onUpdateJob, onComplete, onReopen, onAddPayment, onCancel }: JobDetailViewProps) {
  const [newPart, setNewPart] = useState({ name: '', brand: '', price: '', quantity: 1 });
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [additionalPayment, setAdditionalPayment] = useState('');
  const nameSuggestionsRef = React.useRef<HTMLDivElement>(null);
  const brandSuggestionsRef = React.useRef<HTMLDivElement>(null);
  const isCompleted = job.status === JobStatus.COMPLETED;
  const isCancelled = job.status === JobStatus.CANCELLED;
  const isActive = job.status === JobStatus.ACTIVE;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nameSuggestionsRef.current && !nameSuggestionsRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false);
      }
      if (brandSuggestionsRef.current && !brandSuggestionsRef.current.contains(event.target as Node)) {
        setShowBrandSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique parts from jobs with the same vehicle model for suggestions
  const modelSpecificParts = Array.from(new Set(
    jobs
      .filter(j => j.vehicleModel.toLowerCase() === job.vehicleModel.toLowerCase())
      .flatMap(j => j.parts.map(p => p.name))
  )).sort();

  const nameSuggestions = modelSpecificParts
    .filter(name => 
      newPart.name.length >= 2 && 
      name.toLowerCase().includes(newPart.name.toLowerCase()) &&
      name.toLowerCase() !== newPart.name.toLowerCase()
    )
    .slice(0, 4);

  // Get unique brands for the selected part name
  const brandSuggestions = Array.from(new Set(
    jobs
      .flatMap(j => j.parts)
      .filter(p => p.name.toLowerCase() === newPart.name.toLowerCase() && p.brand)
      .map(p => p.brand!)
  )).sort()
    .filter(brand => 
      newPart.brand.length >= 1 && 
      brand.toLowerCase().includes(newPart.brand.toLowerCase()) &&
      brand.toLowerCase() !== newPart.brand.toLowerCase()
    )
    .slice(0, 4);

  // Auto-fill price when both name and brand are present
  React.useEffect(() => {
    if (newPart.name && newPart.brand && !newPart.price) {
      // Find the most recent price for this part and brand specifically for THIS customer
      const lastJobWithPart = [...jobs]
        .filter(j => 
          j.customerName.toLowerCase() === job.customerName.toLowerCase() && 
          j.vehicleNumber.toLowerCase() === job.vehicleNumber.toLowerCase()
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .find(j => j.parts.some(p => 
          p.name.toLowerCase() === newPart.name.toLowerCase() && 
          p.brand?.toLowerCase() === newPart.brand.toLowerCase()
        ));

      if (lastJobWithPart) {
        const part = lastJobWithPart.parts.find(p => 
          p.name.toLowerCase() === newPart.name.toLowerCase() && 
          p.brand?.toLowerCase() === newPart.brand.toLowerCase()
        );
        if (part) {
          setNewPart(prev => ({ ...prev, price: part.price.toString() }));
        }
      }
    }
  }, [newPart.name, newPart.brand, jobs, job.customerName, job.vehicleNumber]);

  const handleSelectNameSuggestion = (name: string) => {
    setNewPart({
      ...newPart,
      name
    });
    setShowNameSuggestions(false);
  };

  const handleSelectBrandSuggestion = (brand: string) => {
    setNewPart({
      ...newPart,
      brand
    });
    setShowBrandSuggestions(false);
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.name || !newPart.price) return;
    
    const part: Part = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPart.name,
      brand: newPart.brand,
      price: parseFloat(newPart.price),
      quantity: newPart.quantity,
      addedAt: new Date().toISOString()
    };

    const updatedParts = [...job.parts, part];
    const updatedTotal = updatedParts.reduce((acc, p) => acc + p.price * p.quantity, 0);

    onUpdateJob({
      parts: updatedParts,
      totalAmount: updatedTotal
    });
    
    setNewPart({ name: '', brand: '', price: '', quantity: 1 });
    setShowNameSuggestions(false);
    setShowBrandSuggestions(false);
  };

  const handleRemovePart = (partId: string) => {
    const updatedParts = job.parts.filter(p => p.id !== partId);
    const updatedTotal = updatedParts.reduce((acc, p) => acc + p.price * p.quantity, 0);

    onUpdateJob({
      parts: updatedParts,
      totalAmount: updatedTotal
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="bg-white sm:rounded-3xl shadow-xl overflow-hidden border-b sm:border border-neutral-200 print:shadow-none print:border-none min-h-full sm:min-h-0"
    >
      <div className="p-4 sm:p-6 bg-emerald-600 text-white flex justify-between items-center print:bg-white print:text-black print:border-b print:border-neutral-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors print:hidden">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight truncate">{job.vehicleNumber}</h2>
            <p className="text-[10px] sm:text-xs opacity-80 print:opacity-100 truncate">{job.customerName} • {job.vehicleModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <button 
              onClick={onCancel}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 px-4 py-2 rounded-xl transition-colors text-sm font-bold print:hidden border border-red-400/30"
            >
              <X size={16} />
              Cancel Job
            </button>
          )}
          {(isCompleted || isCancelled) && (
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors text-sm font-medium print:hidden"
            >
              <Printer size={16} />
              Print Bill
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors print:hidden">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-neutral-100 print:block">
        {/* Left Column: Add Parts */}
        <div className="p-8 space-y-8 print:hidden">
          {isActive && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Plus size={16} />
                Add Spare Part
              </h3>
              <form onSubmit={handleAddPart} className="space-y-4">
                <div className="space-y-2 relative" ref={nameSuggestionsRef}>
                  <label className="text-xs font-medium text-neutral-400">Part Name</label>
                  <input
                    type="text"
                    value={newPart.name}
                    onChange={(e) => {
                      setNewPart({ ...newPart, name: e.target.value });
                      setShowNameSuggestions(true);
                    }}
                    onFocus={() => setShowNameSuggestions(true)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Brake Pads"
                  />
                  
                  <AnimatePresence>
                    {showNameSuggestions && nameSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden"
                      >
                        {nameSuggestions.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleSelectNameSuggestion(name)}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-50 text-sm font-medium text-neutral-700 transition-colors border-b border-neutral-50 last:border-0"
                          >
                            {name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative" ref={brandSuggestionsRef}>
                    <label className="text-xs font-medium text-neutral-400">Brand Name</label>
                    <input
                      type="text"
                      value={newPart.brand}
                      onChange={(e) => {
                        setNewPart({ ...newPart, brand: e.target.value });
                        setShowBrandSuggestions(true);
                      }}
                      onFocus={() => setShowBrandSuggestions(true)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Bosch"
                    />

                    <AnimatePresence>
                      {showBrandSuggestions && brandSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          {brandSuggestions.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => handleSelectBrandSuggestion(brand)}
                              className="w-full px-4 py-3 text-left hover:bg-emerald-50 text-sm font-medium text-neutral-700 transition-colors border-b border-neutral-50 last:border-0"
                            >
                              {brand}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400">Price (₹)</label>
                    <input
                      type="number"
                      value={newPart.price}
                      onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-2 shrink-0">
                    <label className="text-xs font-medium text-neutral-400 block">Quantity</label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setNewPart({ ...newPart, quantity: Math.max(1, newPart.quantity - 1) })}
                        className="p-3 hover:bg-neutral-100 text-neutral-500 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold text-neutral-700">{newPart.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setNewPart({ ...newPart, quantity: newPart.quantity + 1 })}
                        className="p-3 hover:bg-neutral-100 text-neutral-500 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 pt-6">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add to Bill
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-neutral-100 print:border-none print:pt-0">
            <div className="flex justify-between items-center text-neutral-500 print:text-black">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">₹{job.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-neutral-100 print:border-t-2 print:border-black">
              <span className="text-lg font-bold text-neutral-900 print:text-black">Total Amount</span>
              <span className="text-2xl font-black text-emerald-600 print:text-black">₹{job.totalAmount.toLocaleString()}</span>
            </div>

            {isCancelled && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center space-y-2">
                <p className="text-red-600 font-bold uppercase tracking-wider text-xs">Job Cancelled</p>
                <p className="text-red-500 text-[10px]">This job was cancelled and is not included in revenue calculations.</p>
                <button
                  onClick={onReopen}
                  className="w-full mt-2 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Restore Job
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="space-y-3 pt-4 border-t border-neutral-100 print:border-t-2 print:border-black">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 font-medium">Amount Paid</span>
                  <span className="font-bold text-neutral-900">₹{(job.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 font-medium">Balance</span>
                  <span className={`font-bold ${job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{(job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)).toLocaleString()}
                  </span>
                </div>
                {job.waivedAmount && job.waivedAmount > 0 && (
                  <div className="flex justify-between items-center text-amber-600">
                    <span className="text-sm font-medium italic">Waived Amount</span>
                    <span className="font-bold italic">₹{job.waivedAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0) <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0) <= 0 ? 'Paid Fully' : 'Paid Partially'}
                  </span>
                </div>
                <button
                  onClick={onReopen}
                  className="w-full mt-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Reopen Job for Edits
                </button>

                {job.totalAmount - (job.amountPaid || 0) > 0 && !isAddingPayment && (
                  <button
                    onClick={() => setIsAddingPayment(true)}
                    className="w-full mt-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Record Additional Payment
                  </button>
                )}

                {isAddingPayment && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">New Payment Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                        <input
                          type="number"
                          autoFocus
                          value={additionalPayment}
                          onChange={(e) => setAdditionalPayment(e.target.value)}
                          max={job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                          placeholder="0"
                        />
                      </div>
                      {parseFloat(additionalPayment) > (job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0)) && (
                        <p className="text-[10px] text-red-500 font-bold">Amount exceeds balance!</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsAddingPayment(false);
                          setAdditionalPayment('');
                        }}
                        className="flex-1 py-2 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const amount = parseFloat(additionalPayment);
                          const balance = job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0);
                          if (!isNaN(amount) && amount > 0 && amount <= balance) {
                            onAddPayment(amount);
                            setIsAddingPayment(false);
                            setAdditionalPayment('');
                          }
                        }}
                        disabled={parseFloat(additionalPayment) > (job.totalAmount - (job.amountPaid || 0) - (job.waivedAmount || 0))}
                        className="flex-[2] py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Payment
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {isActive && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount Received from Customer</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      max={job.totalAmount}
                      className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                      placeholder="Enter amount paid"
                    />
                  </div>
                  {parseFloat(amountPaid) > job.totalAmount && (
                    <p className="text-[10px] text-red-500 font-bold">Amount exceeds total!</p>
                  )}
                  <p className="text-[10px] text-neutral-400">
                    Balance: <span className="text-red-500 font-bold">₹{Math.max(0, job.totalAmount - parseFloat(amountPaid || '0')).toLocaleString()}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    const paid = parseFloat(amountPaid || '0');
                    if (amountPaid && paid <= job.totalAmount) {
                      onComplete(paid);
                    }
                  }}
                  disabled={!amountPaid || parseFloat(amountPaid) > job.totalAmount}
                  className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={20} />
                  Complete Job & Bill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parts List */}
        <div className="lg:col-span-2 p-0 flex flex-col min-h-[500px] print:min-h-0">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center print:bg-white print:border-black">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Package size={16} />
              Parts & Services List
            </h3>
            <span className="text-xs font-medium bg-neutral-200 text-neutral-600 px-2 py-1 rounded-lg print:hidden">
              {job.parts.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 print:overflow-visible">
            <AnimatePresence initial={false}>
              {job.parts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-2 py-20">
                  <Package size={48} strokeWidth={1} />
                  <p>No parts added yet</p>
                </div>
              ) : (
                job.parts.map((part) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:border-emerald-200 transition-colors group print:border-none print:p-2 print:border-b print:border-neutral-200 print:rounded-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 print:hidden">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">{part.name}</h4>
                        <p className="text-xs text-neutral-500 print:text-black">
                          {part.brand && <span className="text-emerald-600 font-semibold mr-2">{part.brand}</span>}
                          ₹{part.price.toLocaleString()} × {part.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">₹{(part.price * part.quantity).toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-400 print:hidden">
                          {new Date(part.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => handleRemovePart(part.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
