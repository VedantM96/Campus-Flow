import React, { useState } from "react";
import { authService } from '../services/authService';
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
  X
} from "lucide-react";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: (role: "student" | "recruiter" | "admin", email: string, name: string) => void;
  initialMode: "login" | "register";
  initialRole: "student" | "recruiter" | "admin";
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

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
    showToast(`Autofilled demo credentials for ${roleToFill}.`, "info");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
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

    let backendRole = "STUDENT";
    if (selectedRole === "recruiter") backendRole = "ORG_ADMIN";
    if (selectedRole === "admin") backendRole = "SUPER_ADMIN";

    setIsLoading(true);

    try {
      if (mode === "login") {
        await authService.login(email, password);
        setIsSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(selectedRole, email, name || "User");
        }, 1200);
      } else {
        if (selectedRole === "admin" && adminCode !== "admin123") {
          showToast("Invalid Admin Security Code. (Hint: use admin123)", "error");
          setIsLoading(false);
          return;
        }
        await authService.register(name, email, password, backendRole);
        showToast("Registration successful! Logging you in...", "success");
        setIsSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(selectedRole, email, name);
        }, 1200);
      }
    } catch (error: any) {
      console.error("Backend Auth Error:", error);
      const errorMsg = error.response?.data?.message || "Authentication failed.";
      showToast(errorMsg, "error");
      setIsLoading(false);
    }
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
        <div className="absolute top-0 left-0 right-0 h-1.5 animated-border" />

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Back to Home"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-extrabold text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
          </div>

          <div className="flex bg-navy-950 border border-white/[0.06] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setIsSuccess(false); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold ${mode === "login" ? "text-white" : "text-slate-400"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setIsSuccess(false); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold ${mode === "register" ? "text-white" : "text-slate-400"}`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-brand-teal mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Authentication Secure</h3>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="cf-input w-full !pl-16 text-xs py-3" 
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="you@inst.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="cf-input w-full !pl-16 text-xs py-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cf-input w-full !pl-16 !pr-12 text-xs py-3"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white btn-primary"
                >
                  {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Register")}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}