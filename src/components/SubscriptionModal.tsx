import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  Bell, 
  Trash2, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  Building, 
  Briefcase 
} from "lucide-react";

interface Subscription {
  id: string;
  type: "role" | "company";
  value: string;
  createdAt: string;
}

interface SubscriptionModalProps {
  onClose: () => void;
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  currentUserEmail: string;
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export default function SubscriptionModal({
  onClose,
  subscriptions,
  setSubscriptions,
  currentUserEmail,
  showToast
}: SubscriptionModalProps) {
  const [subType, setSubType] = useState<"role" | "company">("role");
  const [inputValue, setInputValue] = useState("");

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = inputValue.trim();
    if (!cleanVal) {
      showToast("Please enter a role or company name.", "warning");
      return;
    }

    // Check duplicate
    const isDuplicate = subscriptions.some(
      sub => sub.type === subType && sub.value.toLowerCase() === cleanVal.toLowerCase()
    );

    if (isDuplicate) {
      showToast(`You are already subscribed to "${cleanVal}".`, "warning");
      return;
    }

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      type: subType,
      value: cleanVal,
      createdAt: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    localStorage.setItem(`campusflow_subs_${currentUserEmail}`, JSON.stringify(updated));
    
    setInputValue("");
    showToast(`Successfully subscribed to job alerts for "${cleanVal}"!`, "success");
  };

  const handleRemoveSubscription = (id: string, name: string) => {
    const updated = subscriptions.filter(sub => sub.id !== id);
    setSubscriptions(updated);
    localStorage.setItem(`campusflow_subs_${currentUserEmail}`, JSON.stringify(updated));
    showToast(`Removed subscription for "${name}".`, "info");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 bg-navy-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-surface/95 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass p-1"
        id="subscription-alerts-modal"
      >
        {/* Animated border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 animated-border" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Close Modal"
          id="btn-close-sub"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo/15 border border-brand-indigo/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-indigo animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-white">Smart Job Subscriptions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure custom rules to receive instant, real-time alerts</p>
            </div>
          </div>

          {/* Setup Alert Panel */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Create New Alert Rule</span>
            </h3>

            <form onSubmit={handleAddSubscription} className="space-y-3">
              {/* Type selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubType("role")}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    subType === "role"
                      ? "border-brand-indigo/50 bg-brand-indigo/10 text-white"
                      : "border-white/[0.04] bg-white/[0.02] text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>By Role / Title</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubType("company")}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    subType === "company"
                      ? "border-brand-teal/50 bg-brand-teal/10 text-white"
                      : "border-white/[0.04] bg-white/[0.02] text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-brand-teal" />
                  <span>By Company Name</span>
                </button>
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    subType === "role" 
                      ? "e.g., Software Engineer, Frontend, Research, SDE..." 
                      : "e.g., Google, Microsoft, Flipkart, Zomato..."
                  }
                  className="cf-input flex-1 text-xs h-10 px-3"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs text-white shadow-lg"
                  id="btn-add-subscription"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Alert</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Rules List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Active Alerts ({subscriptions.length})
              </span>
              {subscriptions.length > 0 && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Polled every 8 seconds
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.01]">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No active subscriptions configured</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Add custom keywords above. You'll be instantly alerted the moment a recruiter publishes a match!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subscriptions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    className="flex items-center justify-between p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        sub.type === "role" 
                          ? "bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo" 
                          : "bg-brand-teal/10 border-brand-teal/20 text-brand-teal"
                      }`}>
                        {sub.type === "role" ? <Briefcase className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{sub.value}</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Subscribed on {sub.createdAt}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubscription(sub.id, sub.value)}
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick instructions / testing notice */}
          <div className="mt-5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-[10px] text-indigo-300">
            💡 <strong className="text-white">Quick Test Tutorial:</strong> Subscribe to a keyword like <code className="bg-indigo-950 px-1 py-0.5 rounded font-mono text-white">Google</code> or <code className="bg-indigo-950 px-1 py-0.5 rounded font-mono text-white">Full-time</code>, then use the top right bar to switch to <strong className="text-white">Recruiter</strong>, post a new job with that matching value, and switch back to witness the real-time toast alert!
          </div>
        </div>
      </motion.div>
    </div>
  );
}
