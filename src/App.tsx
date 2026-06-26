import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Clock,
  Zap,
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  User,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Activity,
  AlertTriangle,
  Check,
  X,
  UploadCloud,
  FileSpreadsheet,
  Award,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Job, Application, Candidate, TimelineEvent } from "./types";
import AiInterviewRoom from "./components/AiInterviewRoom";
import PiScorecards from "./components/PiScorecards";
import AdminScoreMatrix from "./components/AdminScoreMatrix";
import AuthPage from "./components/AuthPage";
import SubscriptionModal from "./components/SubscriptionModal";


interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ConfettiPiece {
  id: number;
  left: string;
  size: string;
  color: string;
  delay: string;
  duration: string;
}

export default function App() {
  // ── APP STATE ─────────────────────────────────────────
  const [appActive, setAppActive] = useState<boolean>(false);
  const [role, setRole] = useState<"student" | "recruiter" | "admin">("student");
  const [activePage, setActivePage] = useState<string>("opportunities");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // ── AUTHENTICATION STATE ──────────────────────────────
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [authModalRole, setAuthModalRole] = useState<"student" | "recruiter" | "admin">("student");
  const [currentUserName, setCurrentUserName] = useState<string>("Vedant Sharma");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("student@inst.edu");

  // ── SUBSCRIPTION/ALERTS STATE ──────────────────────────
  const [subscriptions, setSubscriptions] = useState<{ id: string; type: "role" | "company"; value: string; createdAt: string; }[]>([]);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);

  // ── DATA STATE ────────────────────────────────────────
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // ── SEARCH & FILTERS ──────────────────────────────────
  const [jobSearch, setJobSearch] = useState<string>("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [candidateSearch, setCandidateSearch] = useState<string>("");
  const [candidateStageFilter, setCandidateStageFilter] = useState<string>("");

  // ── INTERACTIVE UX STATE ──────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [createJobModalOpen, setCreateJobModalOpen] = useState<boolean>(false);

  // ── RESUME OPTIMIZER AI STATE ─────────────────────────
  const [resumeText, setResumeText] = useState<string>("");
  const [optimizerRunning, setOptimizerRunning] = useState<boolean>(false);
  const [optimizerProgress, setOptimizerProgress] = useState<number>(0);
  const [optimizerStep, setOptimizerStep] = useState<string>("");
  const [optimizedReport, setOptimizedReport] = useState<{
    atsScore: number;
    matchBoost: string;
    suggestions: string[];
  } | null>(null);

  // ── DRAG & DROP PIPELINE STATE ────────────────────────
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | number | null>(null);

  // ── FORM STATE ────────────────────────────────────────
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "",
    type: "Internship",
    location: "",
    stipend: "",
    skills: "",
    description: ""
  });

  // ── TOAST HELPER ──────────────────────────────────────
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ── CONFETTI HELPER ───────────────────────────────────
  const triggerConfetti = () => {
    const colors = ["#6366F1", "#14B8A6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"];
    const pieces: ConfettiPiece[] = Array.from({ length: 60 }).map((_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}vw`,
      size: `${Math.random() * 8 + 4}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 0.8}s`,
      duration: `${1.8 + Math.random() * 1}s`
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4000);
  };

  // ── SYNC CONTROLLERS ──────────────────────────────────
  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      showToast("Failed to fetch job opportunities.", "error");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data);
    } catch (e) {
      showToast("Failed to fetch applications feed.", "error");
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidatesList(data);
    } catch (e) {
      showToast("Failed to fetch candidate pipeline.", "error");
    }
  };

  const fetchAiInsights = async () => {
    try {
      const res = await fetch("/api/ai-insights");
      const data = await res.json();
      setAiInsights(data);
    } catch (e) {
      // Keep static fallbacks in server, if any fail
    }
  };

  // Initial Sync
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchCandidates();
    fetchAiInsights();
  }, []);

  // Sync AI Insights on entering Recruiter Dashboard
  useEffect(() => {
    if ((role === "recruiter" || role === "admin") && activePage === "dashboard") {
      fetchAiInsights();
    }
  }, [role, activePage]);

  // ── LOAD USER SUBSCRIPTIONS ───────────────────────────
  useEffect(() => {
    if (currentUserEmail) {
      const stored = localStorage.getItem(`campusflow_subs_${currentUserEmail}`);
      if (stored) {
        try {
          setSubscriptions(JSON.parse(stored));
        } catch (e) {
          setSubscriptions([]);
        }
      } else {
        setSubscriptions([]);
      }
    }
  }, [currentUserEmail]);

  // ── BACKGROUND POLLING FOR NEW JOBS ───────────────────
  useEffect(() => {
    if (role !== "student") return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 8000); // Poll every 8 seconds for real-time alerts

    return () => clearInterval(interval);
  }, [role]);

  // ── PROCESS NEW JOBS AND TRIGGER SUBSCRIBED ALERTS ────
  useEffect(() => {
    if (!jobs || jobs.length === 0 || !currentUserEmail || role !== "student") return;

    const storageKey = `campusflow_seen_jobs_${currentUserEmail}`;
    const storedSeen = localStorage.getItem(storageKey);
    
    let seenSet: Set<string>;
    if (storedSeen) {
      try {
        seenSet = new Set(JSON.parse(storedSeen));
      } catch (e) {
        seenSet = new Set();
      }
    } else {
      // Initialize with currently existing jobs so we don't spam notifications on first load
      seenSet = new Set(jobs.map(j => String(j.id)));
      localStorage.setItem(storageKey, JSON.stringify(Array.from(seenSet)));
      return;
    }

    // Find new jobs that are not in seenSet
    const newJobs = jobs.filter(j => !seenSet.has(String(j.id)));
    if (newJobs.length === 0) return;

    let updated = false;
    newJobs.forEach(job => {
      seenSet.add(String(job.id));
      updated = true;

      const titleLower = job.title.toLowerCase();
      const companyLower = job.company.toLowerCase();
      const typeLower = job.type.toLowerCase();

      // Find any match in subscriptions
      const matchingSub = subscriptions.find(sub => {
        const val = sub.value.trim().toLowerCase();
        if (!val) return false;
        if (sub.type === "role") {
          return titleLower.includes(val) || typeLower.includes(val);
        } else if (sub.type === "company") {
          return companyLower.includes(val);
        }
        return false;
      });

      if (matchingSub) {
        showToast(
          `🔔 ALERT: A new matching role "${job.title}" has been posted by ${job.company}!`,
          "success"
        );
        triggerConfetti();
      }
    });

    if (updated) {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(seenSet)));
    }
  }, [jobs, subscriptions, currentUserEmail, role]);

  // ── STUDENT ACTIONS ───────────────────────────────────
  const handleApply = async (roleId: string | number) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Applied successfully! Custom AI compatibility score: ${data.application.aiScore}%`, "success");
        triggerConfetti();
        fetchApplications();
        fetchCandidates();
      } else {
        showToast(data.error || "Failed to submit application.", "warning");
      }
    } catch (e) {
      showToast("Server connection error during application.", "error");
    }
  };

  // ── RECRUITER ACTIONS ─────────────────────────────────
  const handleCreateJob = async () => {
    if (!newJobForm.title || !newJobForm.company) {
      showToast("Role title and company name are required.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJobForm)
      });

      if (res.ok) {
        showToast(`"${newJobForm.title}" has been published successfully!`, "success");
        setCreateJobModalOpen(false);
        setNewJobForm({
          title: "",
          company: "",
          type: "Internship",
          location: "",
          stipend: "",
          skills: "",
          description: ""
        });
        fetchJobs();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to post job.", "error");
      }
    } catch (e) {
      showToast("Failed to create posting.", "error");
    }
  };

  const handleAdvanceCandidate = async (id: string | number, nextStage: string) => {
    try {
      const res = await fetch("/api/candidates/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nextStage })
      });

      if (res.ok) {
        const updated = await res.json();
        showToast(`${updated.name} has been advanced to "${updated.stage}" stage!`, "success");
        fetchCandidates();
        fetchApplications();
        // Update selected detail modal in real-time
        if (selectedCandidate && String(selectedCandidate.id) === String(id)) {
          setSelectedCandidate(updated);
        }
      } else {
        showToast("Failed to advance candidate stage.", "error");
      }
    } catch (e) {
      showToast("Error updating candidate pipeline.", "error");
    }
  };

  // ── RESUME OPTIMIZER MACHINE ──────────────────────────
  const runAIOptimizer = async () => {
    if (optimizerRunning) return;
    setOptimizerRunning(true);
    setOptimizedReport(null);
    setOptimizerProgress(0);

    const steps = [
      { msg: 'Parsing resume structural parameters…', pct: 20 },
      { msg: 'Analysing keyword density & ATS compliance…', pct: 45 },
      { msg: 'Matching against 2,400+ targeted corporate job descriptions…', pct: 68 },
      { msg: 'Invoking Gemini models for recommendations…', pct: 88 },
      { msg: 'Finalising analysis metrics…', pct: 100 },
    ];

    for (const step of steps) {
      setOptimizerStep(step.msg);
      setOptimizerProgress(step.pct);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: ["C++", "DSA", "JavaScript", "React", "Python", "Tailwind CSS"],
          profileText: resumeText
        })
      });
      const data = await res.json();
      setOptimizedReport(data);
      showToast(`AI Resume analysis complete! ATS score: ${data.atsScore}/100`, "success");
    } catch (e) {
      showToast("Failed to run Gemini Resume Optimizer.", "error");
    } finally {
      setOptimizerRunning(false);
    }
  };

  // File drop handler
  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      showToast(`Successfully received "${files[0].name}". Launching Gemini analyzer…`, "info");
      runAIOptimizer();
    }
  };

  // ── DRAG & DROP PIPELINE CONTROLLER ───────────────────
  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string | number) => {
    setDraggedCandidateId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-brand-indigo/40', 'bg-brand-indigo/5');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-brand-indigo/40', 'bg-brand-indigo/5');
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-brand-indigo/40', 'bg-brand-indigo/5');

    if (draggedCandidateId !== null) {
      await handleAdvanceCandidate(draggedCandidateId, stageId);
      setDraggedCandidateId(null);
    }
  };

  // ── FILTER COMPUTES ───────────────────────────────────
  const filteredJobs = jobs.filter((job) => {
    const q = jobSearch.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));
    const matchesType = !jobTypeFilter || job.type === jobTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredCandidates = candidatesList.filter((cand) => {
    const q = candidateSearch.toLowerCase();
    const matchesSearch =
      !q ||
      cand.name.toLowerCase().includes(q) ||
      cand.college.toLowerCase().includes(q) ||
      cand.role.toLowerCase().includes(q);
    const matchesStage = !candidateStageFilter || cand.stage === candidateStageFilter;
    return matchesSearch && matchesStage;
  });

  // ── ROLE AND PAGE NAVIGATION HELPER ────────────────────
  const enterApp = (targetRole: "student" | "recruiter" | "admin") => {
    setAuthModalRole(targetRole);
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const handleRoleSwitch = (targetRole: "student" | "recruiter" | "admin") => {
    setRole(targetRole);
    if (targetRole === "student") {
      setActivePage("opportunities");
    } else {
      setActivePage("dashboard");
    }
    showToast(`Switched workspace to ${targetRole === "student" ? "Student Dashboard" : "Recruiter Console"}`, "info");
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans relative antialiased bg-navy-900 selection:bg-brand-indigo/30 selection:text-white">
      {/* ── TOAST DISPATCHER ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-950/95 border border-white/10 shadow-2xl min-w-[300px] max-w-[380px]"
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  toast.type === "success"
                    ? "bg-brand-teal"
                    : toast.type === "error"
                    ? "bg-red-500"
                    : toast.type === "warning"
                    ? "bg-yellow-500"
                    : "bg-brand-indigo"
                }`}
              />
              <div className="text-xs text-slate-200 flex-1 font-medium">{toast.message}</div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── CONFETTI FALL ── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute animate-bounce"
            style={{
              left: c.left,
              top: "-20px",
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              opacity: 0.8,
              animation: `confettiFall ${c.duration} ease-in forwards`,
              animationDelay: c.delay
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes confettiFall {
          from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          to { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
           LANDING HERO VIEW (Active when appActive is false)
      ════════════════════════════════════════════════════════════ */}
      {!appActive ? (
        <section className="mesh-gradient grid-lines min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

          {/* Landing Navbar */}
          <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">CampusFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setAuthModalMode("login"); setAuthModalRole("student"); setShowAuthModal(true); }} 
                className="text-sm text-slate-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 font-semibold"
                id="landing-signin-btn"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthModalMode("register"); setAuthModalRole("student"); setShowAuthModal(true); }} 
                className="btn-primary text-sm font-semibold text-white px-5 py-2.5 rounded-lg"
                id="landing-register-btn"
              >
                Get Started Free
              </button>
            </div>
          </nav>

          {/* Main Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full glass border border-indigo-500/20 text-xs font-semibold text-indigo-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              AI-Powered Campus Recruitment Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            >
              Your Dream Career<br />
              <span className="gradient-text">Starts on Campus.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
            >
              CampusFlow connects students with premium recruiters using smart screening models, profile match optimization, and a recruiter pipeline built for speed.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
            >
              <button
                onClick={() => enterApp("student")}
                className="btn-primary font-display font-bold text-white px-8 py-3.5 rounded-xl text-sm flex items-center gap-2.5 w-full sm:w-auto justify-center"
              >
                <User className="w-4 h-4" />
                Student Hub
              </button>
              <button
                onClick={() => enterApp("recruiter")}
                className="btn-teal font-display font-bold text-white px-8 py-3.5 rounded-xl text-sm flex items-center gap-2.5 w-full sm:w-auto justify-center"
              >
                <Briefcase className="w-4 h-4" />
                Recruiter Portal
              </button>
              <button
                onClick={() => enterApp("admin")}
                className="bg-rose-600 hover:bg-rose-700 transition font-display font-bold text-white px-8 py-3.5 rounded-xl text-sm flex items-center gap-2.5 w-full sm:w-auto justify-center shadow-lg"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Console
              </button>
            </motion.div>

            {/* Metric counters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs md:text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-display font-extrabold gradient-text">2,400+</span>
                <span>Students Placed</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-display font-extrabold gradient-text">340+</span>
                <span>Partner Companies</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-display font-extrabold gradient-text">94%</span>
                <span>Match Accuracy</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Preview Cards */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4 card-hover border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">G</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal border border-brand-teal/20">96% Match</span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">SWE Intern — Google</div>
                <div className="text-xs text-slate-500">₹2.4L/mo · Bangalore</div>
              </div>

              <div className="glass rounded-2xl p-4 card-hover border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">M</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/15 text-indigo-400 border border-brand-indigo/20">89% Match</span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">ML Researcher — Microsoft</div>
                <div className="text-xs text-slate-500">₹1.8L/mo · Hyderabad</div>
              </div>

              <div className="glass rounded-2xl p-4 card-hover border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-sm font-bold text-white">R</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">85% Match</span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">Frontend Eng — Razorpay</div>
                <div className="text-xs text-slate-500">₹18LPA · Remote</div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ════════════════════════════════════════════════════════
             MAIN APP SHELL (Student & Recruiter Dashboards)
        ════════════════════════════════════════════════════════════ */
        <div className="flex flex-col min-h-screen bg-navy-900">
          {/* Top Navigation Bar */}
          <header className="h-14 glass border-b border-white/[0.06] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
            {/* Sidebar toggle + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Activity className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-sm text-white tracking-tight">CampusFlow</span>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search opportunities, roles…"
                  value={role === "student" ? jobSearch : candidateSearch}
                  onChange={(e) => role === "student" ? setJobSearch(e.target.value) : setCandidateSearch(e.target.value)}
                  className="cf-input w-full text-xs pl-8 h-8"
                />
              </div>
            </div>

            {/* Role switch pill & notifications */}
            <div className="flex items-center gap-2.5">
              {/* Switcher */}
              <div className="flex bg-navy-950 border border-white/[0.07] rounded-lg p-0.5 text-xs font-semibold">
                <button
                  onClick={() => handleRoleSwitch("student")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    role === "student" ? "bg-brand-indigo text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-3 h-3" />
                  Student
                </button>
                <button
                  onClick={() => handleRoleSwitch("recruiter")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    role === "recruiter" ? "bg-brand-teal text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  Recruiter
                </button>
                <button
                  onClick={() => handleRoleSwitch("admin")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    role === "admin" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  Admin
                </button>
              </div>

              {/* Notification icon */}
              <button
                onClick={() => showToast("All system notification pipelines are operational.", "info")}
                className="relative w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-indigo animate-pulse" />
              </button>

              {/* Avatar indicator */}
              <div
                className="avatar-ring cursor-pointer"
                onClick={() => showToast(`Signed in as ${currentUserName}. Profile synced.`, "info")}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUserName ? currentUserName.charAt(0).toUpperCase() : (role === "student" ? "V" : "R")}
                </div>
              </div>

              {/* Back to landing */}
              <button
                onClick={() => setAppActive(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                title="Return to home"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Sidebar and Body contents */}
          <div className="flex pt-14 min-h-screen">
            {/* COLLAPSIBLE SIDEBAR */}
            <aside
              className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-navy-800 border-r border-white/[0.06] z-30 flex flex-col transition-all duration-300 overflow-hidden ${
                sidebarOpen ? "w-60" : "w-16"
              }`}
            >
              <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
                {role === "student" && (
                  <>
                    <button
                      onClick={() => setActivePage("opportunities")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "opportunities"
                          ? "bg-brand-indigo/15 text-indigo-300 border-l-2 border-brand-indigo"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Opportunities</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("ai-interview")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "ai-interview"
                          ? "bg-brand-indigo/15 text-indigo-300 border-l-2 border-brand-indigo"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 flex-shrink-0 text-brand-indigo animate-pulse" />
                      {sidebarOpen && <span className="text-sm font-bold text-indigo-300">AI Interview Room</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("applications")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "applications"
                          ? "bg-brand-indigo/15 text-indigo-300 border-l-2 border-brand-indigo"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">My Applications</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("profile")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "profile"
                          ? "bg-brand-indigo/15 text-indigo-300 border-l-2 border-brand-indigo"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <User className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">My Profile</span>}
                    </button>
                  </>
                )}

                {role === "recruiter" && (
                  <>
                    <button
                      onClick={() => setActivePage("dashboard")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "dashboard"
                          ? "bg-brand-teal/15 text-brand-teal border-l-2 border-brand-teal"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Dashboard</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("candidates")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "candidates"
                          ? "bg-brand-teal/15 text-brand-teal border-l-2 border-brand-teal"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Users className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Candidates</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("scorecards")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "scorecards"
                          ? "bg-brand-teal/15 text-brand-teal border-l-2 border-brand-teal"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-brand-teal" />
                      {sidebarOpen && <span className="text-sm">PI Scorecards</span>}
                    </button>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <button
                      onClick={() => setActivePage("dashboard")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "dashboard"
                          ? "bg-rose-600/15 text-rose-300 border-l-2 border-rose-600"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Dashboard</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("pipeline")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "pipeline"
                          ? "bg-rose-600/15 text-rose-300 border-l-2 border-rose-600"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Activity className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Hiring Pipeline</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("candidates")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "candidates"
                          ? "bg-rose-600/15 text-rose-300 border-l-2 border-rose-600"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Users className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">Candidates</span>}
                    </button>

                    <button
                      onClick={() => setActivePage("matrix")}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left font-medium ${
                        activePage === "matrix"
                          ? "bg-rose-600/15 text-rose-300 border-l-2 border-rose-600"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm font-bold text-rose-300">Admin Score Matrix</span>}
                    </button>
                  </>
                )}
              </nav>

              <div className="p-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/5"
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen && "rotate-180"}`} />
                  {sidebarOpen && <span className="text-xs font-semibold">Collapse</span>}
                </button>
              </div>
            </aside>

            {/* MAIN APP BODY CONTENT AREA */}
            <main
              className={`flex-1 transition-all duration-300 min-h-screen pb-12 ${
                sidebarOpen ? "ml-60" : "ml-16"
              }`}
            >
              {/* ══════════════════════════════════════════════════
                   PAGE: STUDENT OPPORTUNITIES
              ══════════════════════════════════════════════════ */}
              {role === "student" && activePage === "opportunities" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">Opportunities</h1>
                      <p className="text-sm text-slate-500 mt-0.5">
                        AI-ranked roles for your B.Tech CSE profile ·{" "}
                        <span className="text-indigo-400 font-semibold">{filteredJobs.length} roles available</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Search bar inside header */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Search roles, skills…"
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          className="cf-input pl-9 w-52 h-9 text-xs"
                        />
                      </div>

                      {/* Dropdown filter */}
                      <select
                        value={jobTypeFilter}
                        onChange={(e) => setJobTypeFilter(e.target.value)}
                        className="cf-input h-9 text-xs text-slate-300"
                      >
                        <option value="">All Types</option>
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Research">Research</option>
                      </select>

                      {/* Job Alerts / Subscriptions Trigger Button */}
                      <button
                        onClick={() => setShowAlertsModal(true)}
                        className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] hover:border-brand-indigo/50 bg-white/[0.02] hover:bg-brand-indigo/10 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md group/alert"
                        id="btn-job-alerts-trigger"
                      >
                        <Bell className="w-3.5 h-3.5 text-brand-indigo animate-pulse group-hover/alert:scale-110 transition-transform" />
                        <span>Job Alerts</span>
                        {subscriptions.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-brand-indigo text-[9px] text-white rounded-full font-extrabold">
                            {subscriptions.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Opportunities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="glass rounded-2xl p-5 cursor-pointer card-hover border border-white/[0.06] group flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${job.color1}, ${job.color2})`
                                }}
                              >
                                {job.company[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs text-slate-500 font-semibold truncate">{job.company}</div>
                                <div className="text-sm font-bold text-white leading-tight truncate">{job.title}</div>
                              </div>
                            </div>

                            {/* Circle score indicator */}
                            <div className="flex-shrink-0 relative w-12 h-12">
                              <svg className="rotate-[-90deg]" width="48" height="48">
                                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="18"
                                  fill="none"
                                  stroke={job.match >= 85 ? "#14B8A6" : job.match >= 70 ? "#6366F1" : "#8B5CF6"}
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeDasharray="113"
                                  strokeDashoffset={113 - (113 * job.match) / 100}
                                  className="transition-all duration-700"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-extrabold ${job.match >= 85 ? 'text-brand-teal' : 'text-brand-indigo'}`}>
                                  {job.match}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Details tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">{job.type}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/10 text-indigo-400 border border-brand-indigo/15">{job.location}</span>
                            {job.remote && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/15">Remote OK</span>
                            )}
                          </div>

                          {/* Technical skills list */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-[10px] font-semibold px-2 py-0.5 bg-surface-3 text-slate-400 rounded-md border border-white/[0.04]"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface-3 text-slate-500 rounded-md border border-white/[0.04]">
                                +{job.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                          <div>
                            <div className="text-xs font-bold text-white">{job.stipend}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{job.deadline}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(job.id);
                            }}
                            className="btn-primary text-[11px] font-bold text-white px-3.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Quick Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════════════════════════════════
                   PAGE: STUDENT APPLICATIONS (KANBAN)
              ══════════════════════════════════════════════════ */}
              {role === "student" && activePage === "applications" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">My Applications</h1>
                      <p className="text-sm text-slate-500 mt-0.5">Real-time status updates synced with corporate recruiters</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-surface-2 px-3 py-1.5 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                      <span>{applications.filter(a => a.status === "Offered").length} offers secured</span>
                    </div>
                  </div>

                  {/* Kanban Grid */}
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[
                      { id: "Applied", label: "Applied", color: "#3B82F6" },
                      { id: "Screened", label: "Shortlisted", color: "#F59E0B" },
                      { id: "Interview", label: "Interviews", color: "#8B5CF6" },
                      { id: "Offered", label: "Offers", color: "#14B8A6" }
                    ].map((col) => {
                      const colApps = applications.filter((a) => a.status === col.id);
                      return (
                        <div key={col.id} className="flex-shrink-0 w-64">
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                              <span className="text-xs font-bold text-slate-300">{col.label}</span>
                            </div>
                            <span className="text-[10px] font-extrabold bg-surface-3 text-slate-500 px-2 py-0.5 rounded-full">
                              {colApps.length}
                            </span>
                          </div>

                          {/* Column items */}
                          <div className="rounded-xl p-2 bg-surface-2/30 border border-white/[0.04] flex flex-col gap-2 min-h-[350px]">
                            {colApps.map((app) => (
                              <div
                                key={app.id}
                                className="bg-surface rounded-xl p-3 border border-white/[0.06] card-hover cursor-pointer"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{
                                      background: `linear-gradient(135deg, ${app.color1}, ${app.color2})`
                                    }}
                                  >
                                    {app.company[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white truncate leading-tight">{app.role}</div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{app.company}</div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                  <span className="text-[10px] text-slate-600 font-semibold">{app.date}</span>
                                  {app.status === "Offered" ? (
                                    <span className="text-[10px] font-bold text-brand-teal">🎉 Offer Issued!</span>
                                  ) : app.aiScore ? (
                                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-brand-indigo" />
                                      {app.aiScore} AI Match
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                            {colApps.length === 0 && (
                              <div className="py-8 text-center text-xs text-slate-600 font-semibold select-none">No records</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════════════════════════════════
                   PAGE: STUDENT PROFILE & OPTIMIZER
              ══════════════════════════════════════════════════ */}
              {role === "student" && activePage === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 max-w-3xl"
                >
                  <h1 className="font-display text-2xl font-bold text-white mb-6">My Profile</h1>

                  {/* Summary card */}
                  <div className="glass rounded-2xl p-6 border border-white/[0.06] mb-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-5">
                      <div className="avatar-ring flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                          {currentUserName ? currentUserName.charAt(0).toUpperCase() : "V"}
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-1.5">
                          <h2 className="font-display text-xl font-bold text-white">{currentUserName}</h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/15 text-indigo-400 border border-brand-indigo/20">
                            B.Tech CSE
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mb-3">{currentUserEmail === "student@inst.edu" ? "NIT Raipur · Batch 2025–29 · CGPA 8.91" : `${currentUserEmail} · Registered Student`}</div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                          {["C++", "DSA", "JavaScript", "React", "Python", "Tailwind CSS", "SQL"].map((s) => (
                            <span key={s} className="text-xs px-2.5 py-1 bg-surface-3 text-slate-300 rounded-lg border border-white/[0.05] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-center flex-shrink-0 md:text-right">
                        <div className="text-3xl font-display font-extrabold gradient-text">87</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">Profile Completeness</div>
                        <div className="h-1.5 w-24 bg-surface-3 rounded-full mt-2.5 overflow-hidden mx-auto md:mx-0">
                          <div className="h-full w-[87%] bg-brand-indigo rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CV Uploader and Gemini Advisor */}
                  <div className="glass rounded-2xl p-6 border border-white/[0.06]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-display font-bold text-white leading-tight">AI Resume Advisor</h3>
                        <p className="text-xs text-slate-500 mt-1">Optimize your profile matching ratios using Gemini API</p>
                      </div>

                      <button
                        onClick={runAIOptimizer}
                        disabled={optimizerRunning}
                        className="btn-primary text-xs font-bold text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {optimizerRunning ? "Optimizing…" : "Run Resume Advisor"}
                      </button>
                    </div>

                    {/* Drag and Drop Container */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-brand-indigo/50', 'bg-brand-indigo/5'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('border-brand-indigo/50', 'bg-brand-indigo/5'); }}
                      onDrop={(e) => { e.currentTarget.classList.remove('border-brand-indigo/50', 'bg-brand-indigo/5'); handleFileDrop(e); }}
                      onClick={() => showToast("File picker would open here. Drag & drop a PDF/DOCX to optimize.", "info")}
                      className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-brand-indigo/40 hover:bg-brand-indigo/[0.02] transition-colors"
                    >
                      <UploadCloud className="mx-auto mb-3 text-slate-600 w-8 h-8" />
                      <p className="text-sm text-slate-300 font-semibold">Drop your resume PDF here or click to browse</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-semibold">PDF, DOCX formats up to 10MB</p>
                    </div>

                    {/* Optimizer progress bar */}
                    {optimizerRunning && (
                      <div className="mt-4 glass-light rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-indigo/20 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-brand-indigo" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white mb-1">Gemini Analysis active…</div>
                            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-indigo rounded-full transition-all duration-300" style={{ width: `${optimizerProgress}%` }} />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-brand-indigo">{optimizerProgress}%</span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">{optimizerStep}</div>
                      </div>
                    )}

                    {/* Report Output */}
                    {optimizedReport && (
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-surface-3 rounded-xl p-3 text-center border border-white/[0.05]">
                            <div className="text-2xl font-display font-extrabold text-brand-teal">{optimizedReport.atsScore}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">ATS Matching Score</div>
                          </div>
                          <div className="bg-surface-3 rounded-xl p-3 text-center border border-white/[0.05]">
                            <div className="text-2xl font-display font-extrabold text-brand-indigo">{optimizedReport.matchBoost}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Potential Match Boost</div>
                          </div>
                          <div className="bg-surface-3 rounded-xl p-3 text-center border border-white/[0.05]">
                            <div className="text-2xl font-display font-extrabold text-brand-purple">3</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Gemini Suggestions</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tailored Recommendations</h4>
                          {optimizedReport.suggestions.map((sug, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-slate-300 bg-surface-3 rounded-lg px-3 py-2.5 border border-white/[0.04]"
                            >
                              <CheckCircle className="text-brand-teal flex-shrink-0 mt-0.5 w-3.5 h-3.5" />
                              <span className="leading-relaxed">{sug}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {role === "student" && activePage === "ai-interview" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AiInterviewRoom />
                </motion.div>
              )}






              {/* ══════════════════════════════════════════════════
                   PAGE: RECRUITER DASHBOARD
              ══════════════════════════════════════════════════ */}
              {(role === "recruiter" || role === "admin") && activePage === "dashboard" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">Recruiter Console</h1>
                      <p className="text-sm text-slate-500 mt-0.5">Welcome back, {currentUserName} · Campus Hiring Suite</p>
                    </div>

                    <button
                      onClick={() => setCreateJobModalOpen(true)}
                      className="btn-primary text-xs font-bold text-white px-4 py-2.5 rounded-xl flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Post New Role
                    </button>
                  </div>

                  {/* KPI Stat counters */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Active Postings", value: String(jobs.length), change: "+3 this week", color: "text-brand-indigo" },
                      { label: "Total Candidates", value: String(candidatesList.length), change: "+47 today", color: "text-brand-teal" },
                      { label: "Pending Interviews", value: "8", change: "+1 today", color: "text-brand-purple" },
                      { label: "Overall Match Rate", value: "82.4%", change: "+2.1%", color: "text-brand-pink" }
                    ].map((stat, idx) => (
                      <div key={idx} className="glass rounded-2xl p-5 border border-white/[0.06] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-teal/15 text-brand-teal">{stat.change}</span>
                        </div>
                        <div className={`text-2xl md:text-3xl font-display font-extrabold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Dashboard Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Recent candidates applications feed */}
                    <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h3 className="font-display font-bold text-white text-sm">Recent Applications</h3>
                        <button
                          onClick={() => setActivePage("candidates")}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          View all candidates →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {candidatesList.slice(0, 4).map((cand) => (
                          <div
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/5"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${cand.color1}, ${cand.color2})`
                              }}
                            >
                              {cand.name[0]}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white leading-tight truncate">{cand.name}</div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                {cand.role} · {cand.college}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-bold text-brand-teal">{cand.aiScore}</div>
                                <div className="text-[9px] text-slate-500 font-bold">AI Score</div>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                  cand.stage === "Applied"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : cand.stage === "Screened"
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : cand.stage === "Interview"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : "bg-brand-teal/10 text-brand-teal border-brand-teal/20"
                                }`}
                              >
                                {cand.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gemini insights sidebar */}
                    <div className="glass rounded-2xl p-5 border border-indigo-500/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                          <div className="w-6 h-6 rounded bg-brand-indigo/20 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-brand-indigo" />
                          </div>
                          <span className="text-xs font-display font-bold text-white">Gemini Recruiter Insights</span>
                        </div>

                        <div className="space-y-3">
                          {aiInsights.map((insight, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-3 border border-white/[0.04]"
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                                style={{
                                  backgroundColor: `${insight.color}15`,
                                  color: insight.color
                                }}
                                dangerouslySetInnerHTML={{ __html: insight.icon }}
                              />
                              <p className="text-xs text-slate-400 leading-relaxed">{insight.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={fetchAiInsights}
                        className="mt-4 text-center text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider py-1 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Refresh Insights
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════════════════════════════════
                   PAGE: RECRUITER PIPELINE (KANBAN BOARD)
              ══════════════════════════════════════════════════ */}
              {(role === "recruiter" || role === "admin") && activePage === "pipeline" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">Hiring Pipeline</h1>
                      <p className="text-sm text-slate-500 mt-0.5">Drag and drop candidates between processing stages to update status</p>
                    </div>

                    <button
                      onClick={() => setCreateJobModalOpen(true)}
                      className="btn-teal text-xs font-bold text-white px-4 py-2.5 rounded-xl flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Post New Job
                    </button>
                  </div>

                  {/* Kanban Pipeline Board */}
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[
                      { id: "Applied", label: "Applied", color: "#3B82F6" },
                      { id: "Screened", label: "Screened", color: "#F59E0B" },
                      { id: "Interview", label: "Interview", color: "#8B5CF6" },
                      { id: "Offered", label: "Offered", color: "#14B8A6" }
                    ].map((stage) => {
                      const stageCands = candidatesList.filter((c) => c.stage === stage.id);
                      return (
                        <div key={stage.id} className="flex-shrink-0 w-64">
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                              <span className="text-xs font-bold text-slate-300">{stage.label}</span>
                            </div>
                            <span className="text-[10px] font-extrabold bg-surface-3 text-slate-500 px-2 py-0.5 rounded-full">
                              {stageCands.length}
                            </span>
                          </div>

                          {/* Column Drop Area */}
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                            className="rounded-xl p-2 bg-surface-2/30 border border-white/[0.04] flex flex-col gap-2 min-h-[400px] transition-all"
                          >
                            {stageCands.map((cand) => (
                              <div
                                key={cand.id}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, cand.id)}
                                onClick={() => setSelectedCandidate(cand)}
                                className="bg-surface rounded-xl p-3.5 border border-white/[0.06] card-hover cursor-grab active:cursor-grabbing select-none"
                              >
                                <div className="flex items-start gap-2 justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                      style={{
                                        background: `linear-gradient(135deg, ${cand.color1}, ${cand.color2})`
                                      }}
                                    >
                                      {cand.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-white truncate leading-tight">{cand.name}</div>
                                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{cand.college}</div>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-extrabold ${cand.aiScore >= 85 ? 'text-brand-teal' : 'text-brand-indigo'}`}>
                                    {cand.aiScore}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold truncate">{cand.role}</div>
                                <div className="flex gap-1 mt-2.5 flex-wrap">
                                  {cand.skills.slice(0, 2).map((s) => (
                                    <span key={s} className="text-[9px] px-1.5 py-0.5 bg-surface-4 text-slate-500 rounded font-semibold border border-white/[0.04]">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {stageCands.length === 0 && (
                              <div className="py-12 text-center text-xs text-slate-700 font-semibold border border-dashed border-white/[0.04] rounded-lg">
                                Drag candidate here
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════════════════════════════════
                   PAGE: RECRUITER CANDIDATES LIST TABLE
              ══════════════════════════════════════════════════ */}
              {(role === "recruiter" || role === "admin") && activePage === "candidates" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {/* Candidates title */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">Candidates Database</h1>
                      <p className="text-sm text-slate-500 mt-0.5">
                        <span className="text-brand-teal font-bold">{filteredCandidates.length}</span> candidates registered in system catalog
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Search candidate name, college…"
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          className="cf-input pl-9 w-52 h-9 text-xs"
                        />
                      </div>

                      {/* Dropdown filter */}
                      <select
                        value={candidateStageFilter}
                        onChange={(e) => setCandidateStageFilter(e.target.value)}
                        className="cf-input h-9 text-xs text-slate-300"
                      >
                        <option value="">All Stages</option>
                        <option value="Applied">Applied</option>
                        <option value="Screened">Screened</option>
                        <option value="Interview">Interview</option>
                        <option value="Offered">Offered</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidates Table view */}
                  <div className="glass rounded-2xl border border-white/[0.06] overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-navy-950/20">
                          <th className="py-3.5 px-4">Candidate</th>
                          <th className="py-3.5 px-4">College</th>
                          <th className="py-3.5 px-4">Applied Role</th>
                          <th className="py-3.5 px-4">AI Score</th>
                          <th className="py-3.5 px-4">Stage</th>
                          <th className="py-3.5 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidates.map((cand) => (
                          <tr
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className="border-b border-white/[0.04] hover:bg-brand-indigo/[0.02] cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg, ${cand.color1}, ${cand.color2})`
                                  }}
                                >
                                  {cand.name[0]}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white leading-tight">{cand.name}</div>
                                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{cand.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-xs font-semibold">{cand.college}</td>
                            <td className="py-3 px-4 text-slate-300 text-xs font-semibold">{cand.role}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-surface-4 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-brand-teal"
                                    style={{ width: `${cand.aiScore}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold ${cand.aiScore >= 85 ? 'text-brand-teal' : 'text-brand-indigo'}`}>{cand.aiScore}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                  cand.stage === "Applied"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : cand.stage === "Screened"
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : cand.stage === "Interview"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : "bg-brand-teal/10 text-brand-teal border-brand-teal/20"
                                }`}
                              >
                                {cand.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const stages = ["Applied", "Screened", "Interview", "Offered"];
                                  const nextIdx = stages.indexOf(cand.stage) + 1;
                                  if (nextIdx < stages.length) {
                                    handleAdvanceCandidate(cand.id, stages[nextIdx]);
                                  } else {
                                    showToast(`${cand.name} has already finalized the process.`, "info");
                                  }
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                              >
                                Advance →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {(role === "recruiter" || role === "admin") && activePage === "scorecards" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PiScorecards />
                </motion.div>
              )}

              {(role === "recruiter" || role === "admin") && activePage === "matrix" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminScoreMatrix />
                </motion.div>
              )}


            </main>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
           MODAL: ROLE DETAIL & ANALYSIS (STUDENT VIEW)
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative glass rounded-3xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.07] flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${selectedJob.color1}, ${selectedJob.color2})`
                    }}
                  >
                    {selectedJob.company[0]}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-xs text-slate-400 font-semibold">{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body details */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* AI Score match parameters graph */}
                <div className="bg-surface-3 rounded-2xl p-4 border border-indigo-500/15">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-brand-indigo/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-brand-indigo" />
                    </div>
                    <span className="text-xs font-bold text-white">AI Compatibility Match Analysis</span>
                    <span className="ml-auto text-sm font-display font-extrabold gradient-text">{selectedJob.match}% Match</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedJob.matchBreakdown.map((m) => (
                      <div key={m.label} className="flex items-center gap-3">
                        <div className="w-20 text-[10px] text-slate-500 font-bold uppercase">{m.label}</div>
                        <div className="flex-1 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-indigo rounded-full"
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                        <div className="w-8 text-[10px] font-bold text-right text-brand-teal">{m.score}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info block */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="bg-surface-3 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Stipend / Package</div>
                    <div className="text-white">{selectedJob.stipend}</div>
                  </div>
                  <div className="bg-surface-3 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Duration</div>
                    <div className="text-white">{selectedJob.duration}</div>
                  </div>
                </div>

                {/* Job Description text */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Job Description</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedJob.description}</p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => {
                    handleApply(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  className="btn-primary flex-1 text-xs font-bold text-white py-3 rounded-xl"
                >
                  Apply to Job
                </button>
                <button
                  onClick={() => {
                    showToast("Role saved successfully to bookmarks.", "success");
                    setSelectedJob(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-300 py-3 rounded-xl bg-surface-3 border border-white/[0.07] hover:bg-surface-4 transition-colors"
                >
                  Save Posting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
           MODAL: CANDIDATE DETAIL (RECRUITER VIEW)
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative glass rounded-3xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.07] flex items-start justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="avatar-ring flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${selectedCandidate.color1}, ${selectedCandidate.color2})`
                      }}
                    >
                      {selectedCandidate.name[0]}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">{selectedCandidate.name}</h2>
                    <p className="text-xs text-slate-400 font-semibold">{selectedCandidate.college} · {selectedCandidate.cgpa} CGPA</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex items-start gap-4">
                  <div>
                    <div className={`text-2xl font-display font-extrabold ${selectedCandidate.aiScore >= 85 ? 'text-brand-teal' : 'text-brand-indigo'}`}>
                      {selectedCandidate.aiScore}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">AI Score</div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Skills tags */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-surface-3 text-slate-300 rounded-lg border border-white/[0.05] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gemini assessed screening logs */}
                <div className="bg-surface-3 rounded-2xl p-4 border border-indigo-500/10">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-brand-indigo uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Screening Assessment
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">{selectedCandidate.aiAssessment}</p>
                </div>

                {/* Candidate application timeline */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Application History</p>
                  <div className="relative pl-5 space-y-4">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
                    {selectedCandidate.timeline.map((event, idx) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div className="absolute -left-3.5 w-2.5 h-2.5 rounded-full border-2 border-brand-indigo bg-navy-900 mt-1" />
                        <div>
                          <div className="text-xs font-bold text-white">{event.event}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{event.date}</div>
                          {event.note && (
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{event.note}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    const stages = ["Applied", "Screened", "Interview", "Offered"];
                    const nextIdx = stages.indexOf(selectedCandidate.stage) + 1;
                    if (nextIdx < stages.length) {
                      handleAdvanceCandidate(selectedCandidate.id, stages[nextIdx]);
                    } else {
                      showToast("Already in final offer stage.", "info");
                    }
                  }}
                  className="btn-primary flex-1 text-xs font-bold text-white py-3 rounded-xl"
                >
                  Advance Stage
                </button>
                <button
                  onClick={() => {
                    showToast(`Interview setup emails dispatched to ${selectedCandidate.name}.`, "success");
                    setSelectedCandidate(null);
                  }}
                  className="btn-teal flex-1 text-xs font-bold text-white py-3 rounded-xl"
                >
                  Schedule Interview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
           MODAL: CREATE NEW JOB POST (RECRUITER VIEW)
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {createJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateJobModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative glass rounded-3xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 border-b border-white/[0.07] flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Post New Role</h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Gemini will automatically rate applicant match percentages</p>
                </div>
                <button
                  onClick={() => setCreateJobModalOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form inputs */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer Intern"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    className="cf-input w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TechCorp"
                      value={newJobForm.company}
                      onChange={(e) => setNewJobForm({ ...newJobForm, company: e.target.value })}
                      className="cf-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
                    <select
                      value={newJobForm.type}
                      onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value })}
                      className="cf-input w-full text-xs text-slate-300"
                    >
                      <option>Internship</option>
                      <option>Full-time</option>
                      <option>Research</option>
                      <option>Contract</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={newJobForm.location}
                      onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                      className="cf-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Stipend / Package</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1.5L/mo"
                      value={newJobForm.stipend}
                      onChange={(e) => setNewJobForm({ ...newJobForm, stipend: e.target.value })}
                      className="cf-input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Python, SQL"
                    value={newJobForm.skills}
                    onChange={(e) => setNewJobForm({ ...newJobForm, skills: e.target.value })}
                    className="cf-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role Description</label>
                  <textarea
                    placeholder="Describe role responsibilities and candidate mandates…"
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                    className="cf-input w-full h-20 resize-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/15">
                  <Sparkles className="text-brand-indigo flex-shrink-0 w-4 h-4 animate-pulse" />
                  <p className="text-[10px] text-indigo-300 font-semibold leading-relaxed">
                    AI matching engines will compute technical compatibility and assign custom rankings automatically.
                  </p>
                </div>
              </div>

              {/* Form Footer */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={handleCreateJob}
                  className="btn-primary flex-1 text-xs font-bold text-white py-3 rounded-xl"
                >
                  Publish Role
                </button>
                <button
                  onClick={() => setCreateJobModalOpen(false)}
                  className="flex-1 text-xs font-bold text-slate-400 py-3 rounded-xl bg-surface-3 border border-white/[0.07] hover:bg-surface-4 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DYNAMIC AUTHENTICATION FLOWS ── */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthPage
            onClose={() => setShowAuthModal(false)}
            initialMode={authModalMode}
            initialRole={authModalRole}
            showToast={showToast}
            onSuccess={(chosenRole, email, name) => {
              setRole(chosenRole);
              setCurrentUserEmail(email);
              setCurrentUserName(name);
              if (chosenRole === "student") {
                setActivePage("opportunities");
              } else {
                setActivePage("dashboard");
              }
              setShowAuthModal(false);
              setAppActive(true);
              showToast(`Logged in as ${name}`, "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* ── JOB ALERTS / SUBSCRIPTION SUBSYSTEM ── */}
      <AnimatePresence>
        {showAlertsModal && (
          <SubscriptionModal
            onClose={() => setShowAlertsModal(false)}
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            currentUserEmail={currentUserEmail}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
