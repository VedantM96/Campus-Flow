import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  GraduationCap, 
  Building, 
  X,
  Plus
} from "lucide-react";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: (role: "student" | "recruiter" | "admin", email: string, name: string) => void;
  initialMode: "login" | "register";
  initialRole: "student" | "recruiter" | "admin";
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const DEFAULT_USERS = [
  { email: "student@inst.edu", password: "password123", name: "Vedant Sharma", role: "student", college: "NIT Raipur", cgpa: "8.91" },
  { email: "recruiter@inst.edu", password: "password123", name: "Ravi Shankar", role: "recruiter", company: "Google" },
  { email: "admin@inst.edu", password: "password123", name: "System Admin", role: "admin" }
];

export default function AuthPage({ 
  onClose, 
  onSuccess, 
  initialMode, 
  initialRole,
  showToast 
}: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [selectedRole, setSelectedRole] = useState<"student" | "recruiter" | "admin">(initialRole);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Role-specific fields
  const [college, setCollege] = useState("NIT Raipur");
  const [cgpa, setCgpa] = useState("8.91");
  const [company, setCompany] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  // Loading & Success states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize users in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("campusflow_users");
    if (!stored) {
      localStorage.setItem("campusflow_users", JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Autofill handles for demo convenience
  const handleAutofill = (roleToFill: "student" | "recruiter" | "admin") => {
    setSelectedRole(roleToFill);
    if (roleToFill === "student") {
      setEmail("student@inst.edu");
      setPassword("password123");
    } else if (roleToFill === "recruiter") {
      setEmail("recruiter@inst.edu");
      setPassword("password123");
    } else {
      setEmail("admin@inst.edu");
      setPassword("password123");
    }
    showToast(`Autofilled demo credentials for ${roleToFill}`, "info");
  };

  const getStoredUsers = () => {
    const stored = localStorage.getItem("campusflow_users");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter an email address.", "warning");
      return;
    }
    if (!password) {
      showToast("Please enter a password.", "warning");
      return;
    }
    if (mode === "register" && !name) {
      showToast("Please enter your name.", "warning");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();

      if (mode === "login") {
        // Log In Flow
        const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!found) {
          showToast("Account not found. Please register first.", "error");
          setIsLoading(false);
          return;
        }

        if (found.password !== password) {
          showToast("Incorrect password. Try again.", "error");
          setIsLoading(false);
          return;
        }

        if (found.role !== selectedRole) {
          showToast(`This account is registered as a ${found.role}. Switch roles or log in with correct role.`, "warning");
          setIsLoading(false);
          return;
        }

        setIsSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(found.role, found.email, found.name);
        }, 1200);

      } else {
        // Registration Flow
        const alreadyExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (alreadyExists) {
          showToast("An account with this email already exists.", "error");
          setIsLoading(false);
          return;
        }

        // Validate admin code
        if (selectedRole === "admin" && adminCode !== "admin123") {
          showToast("Invalid Admin Security Code. (Hint: use admin123)", "error");
          setIsLoading(false);
          return;
        }

        const newUser: any = {
          email,
          password,
          name,
          role: selectedRole,
          ...(selectedRole === "student" && { college, cgpa }),
          ...(selectedRole === "recruiter" && { company: company || "Self" })
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem("campusflow_users", JSON.stringify(updatedUsers));

        showToast("Registration successful! Logging you in...", "success");
        setIsSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(selectedRole, email, name);
        }, 1200);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 py-8 bg-navy-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-xl bg-surface/90 border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden glass p-1"
        id="auth-container-card"
      >
        {/* Animated Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 animated-border" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Back to Home"
          id="btn-close-auth"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">CampusFlow</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              {mode === "login" 
                ? "Sign in to access your customized recruitment suite" 
                : "Join the next generation of smart campus hiring"
              }
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-navy-950 border border-white/[0.06] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setIsSuccess(false); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                mode === "login" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              id="btn-tab-signin"
            >
              {mode === "login" && (
                <motion.div 
                  layoutId="activeTabGlow" 
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setIsSuccess(false); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                mode === "register" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              id="btn-tab-signup"
            >
              {mode === "register" && (
                <motion.div 
                  layoutId="activeTabGlow" 
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              Create Account
            </button>
          </div>

          {/* Role selection tab pills */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2.5 text-center">
              Select Your Access Workspace
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("student")}
                className={`py-2 px-3 rounded-xl border transition-all text-left flex flex-col items-center sm:items-start ${
                  selectedRole === "student" 
                    ? "border-brand-indigo/50 bg-brand-indigo/10 text-white" 
                    : "border-white/[0.04] bg-white/[0.02] text-slate-400 hover:bg-white/5"
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1 text-brand-indigo" />
                <span className="text-xs font-bold">Student</span>
                <span className="text-[9px] text-slate-500 hidden sm:inline">Seek & Apply</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("recruiter")}
                className={`py-2 px-3 rounded-xl border transition-all text-left flex flex-col items-center sm:items-start ${
                  selectedRole === "recruiter" 
                    ? "border-brand-teal/50 bg-brand-teal/10 text-white" 
                    : "border-white/[0.04] bg-white/[0.02] text-slate-400 hover:bg-white/5"
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1 text-brand-teal" />
                <span className="text-xs font-bold">Recruiter</span>
                <span className="text-[9px] text-slate-500 hidden sm:inline">Hiring Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`py-2 px-3 rounded-xl border transition-all text-left flex flex-col items-center sm:items-start ${
                  selectedRole === "admin" 
                    ? "border-rose-600/50 bg-rose-600/10 text-white" 
                    : "border-white/[0.04] bg-white/[0.02] text-slate-400 hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="w-4 h-4 mb-1 text-rose-400" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[9px] text-slate-500 hidden sm:inline">System Scorecard</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="w-16 h-16 text-brand-teal mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-white">Authentication Secure</h3>
                <p className="text-xs text-slate-400 mt-1">Bootstrapping workspace environments...</p>
              </motion.div>
            ) : (
              <motion.form 
                key={`${mode}-${selectedRole}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAuthSubmit}
                className="space-y-4"
              >
                {/* Name field (Only during Registration) */}
                {mode === "register" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="cf-input w-full pl-10 text-xs py-3"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="you@inst.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="cf-input w-full pl-10 text-xs py-3"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      Password
                    </label>
                    {mode === "login" && (
                      <button 
                        type="button"
                        onClick={() => showToast("Demo passwords can always be retrieved via Autofill.", "info")}
                        className="text-[10px] text-brand-indigo hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cf-input w-full pl-10 pr-10 text-xs py-3"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ROLE SPECIFIC FIELD PACKAGES */}
                {mode === "register" && selectedRole === "student" && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        College / Institution
                      </label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="cf-input w-full text-xs py-2 bg-navy-950/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        Cumulative CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max="10"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="cf-input w-full text-xs py-2 bg-navy-950/50"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === "register" && selectedRole === "recruiter" && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <label className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                      Target Recruiting Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Google, Stripe, etc."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="cf-input w-full pl-9 text-xs py-2 bg-navy-950/50"
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedRole === "admin" && (
                  <div className="p-3 rounded-xl bg-rose-950/10 border border-rose-500/10">
                    <label className="block text-[9px] font-bold text-rose-300 tracking-wider uppercase mb-1">
                      Admin Secret Passphrase
                    </label>
                    <div className="relative">
                      <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 w-3.5 h-3.5" />
                      <input
                        type="password"
                        placeholder="Enter admin123"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="cf-input w-full pl-9 text-xs py-2 border-rose-500/20 bg-rose-950/20 text-rose-200 placeholder-rose-700 focus:border-rose-500/50 focus:shadow-rose-500/10"
                        required={mode === "register" || adminCode !== ""}
                      />
                    </div>
                    <span className="text-[9px] text-rose-400/70 mt-1 block font-mono">
                      * System administrator verification requires clearance passcode (use: admin123)
                    </span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all mt-4 ${
                    selectedRole === "student" 
                      ? "btn-primary" 
                      : selectedRole === "recruiter" 
                      ? "btn-teal" 
                      : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-950/25"
                  } ${isLoading ? "opacity-75 cursor-wait" : ""}`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === "login" ? "Verify Credentials & Sign In" : "Register Profile & Login"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Demo Convenience Hints */}
          {mode === "login" && !isSuccess && (
            <div className="mt-6 pt-5 border-t border-white/[0.04] text-center">
              <span className="text-[10px] text-slate-500 block mb-2 font-medium">
                ⚡ Demo Mode: Quick Autofill standard profiles to preview immediately:
              </span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill("student")}
                  className="px-2.5 py-1 rounded-md text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 hover:bg-indigo-500/15"
                >
                  student@inst.edu
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("recruiter")}
                  className="px-2.5 py-1 rounded-md text-[9px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/10 hover:bg-teal-500/15"
                >
                  recruiter@inst.edu
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("admin")}
                  className="px-2.5 py-1 rounded-md text-[9px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/10 hover:bg-rose-500/15"
                >
                  admin@inst.edu
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
