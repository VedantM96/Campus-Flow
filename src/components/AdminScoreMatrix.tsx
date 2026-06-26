import { useState, useEffect } from "react";
import { FileSpreadsheet, Search, ChevronRight, Sliders, CheckCircle, Mail, Send, Sparkles, Filter, CheckSquare, Square, Trash, Star, Award, ShieldAlert } from "lucide-react";
import { Candidate } from "../types";

export default function AdminScoreMatrix() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Round Weights (must sum to 100)
  const [cvWeight, setCvWeight] = useState(25);
  const [aiWeight, setAiWeight] = useState(35);
  const [piWeight, setPiWeight] = useState(40);

  // Selections & Action modal
  const [selections, setSelections] = useState<Record<string | number, boolean>>({});
  const [bulkActionType, setBulkActionType] = useState<"Offered" | "Rejected" | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchCount, setDispatchCount] = useState<number | null>(null);

  // Email template variables editable by admin
  const [salaryPackage, setSalaryPackage] = useState("₹24,00,000 per annum (₹24 LPA)");
  const [startDate, setStartDate] = useState("August 3, 2026");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data);
    } catch (e) {
      console.error("Failed to fetch candidates for matrix:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allSelected = filteredCandidates.every(c => selections[c.id]);
    const newSel: Record<string | number, boolean> = { ...selections };
    filteredCandidates.forEach(c => {
      newSel[c.id] = !allSelected;
    });
    setSelections(newSel);
  };

  const handleSelectCandidate = (id: string | number) => {
    setSelections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerBulkAction = async (action: "Offered" | "Rejected") => {
    const selectedIds = Object.keys(selections).filter(id => selections[id]);
    if (selectedIds.length === 0) return;

    try {
      setDispatching(true);
      const res = await fetch("/api/candidates/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: selectedIds,
          actionType: action
        })
      });
      const data = await res.json();
      if (data.success) {
        setDispatchCount(data.count);
        // Refresh candidates list
        await fetchCandidates();
        setSelections({});
        setTimeout(() => setDispatchCount(null), 4000);
      }
    } catch (e) {
      console.error("Failed to dispatch bulk action:", e);
    } finally {
      setDispatching(false);
      setBulkActionType(null);
    }
  };

  const getCandidateScores = (c: Candidate) => {
    const cv = c.cvScore ? c.cvScore.total : 60;
    const ai = c.interviewSession && c.interviewSession.status === "completed" ? (c.interviewSession.totalScore || 70) : c.aiScore;
    
    let pi = 65; // default fallback if no PI scorecard submitted
    if (c.piScorecard && c.piScorecard.submitted) {
      pi = (c.piScorecard.technical * 0.35 + c.piScorecard.communication * 0.25 + c.piScorecard.problemSolving * 0.25 + c.piScorecard.cultureFit * 0.15) * 10;
    }

    const totalWeighted = (cv * cvWeight + ai * aiWeight + pi * piWeight) / 100;

    return { cv, ai, pi, totalWeighted };
  };

  const rolesList = ["all", ...Array.from(new Set(candidates.map(c => c.role)))];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = filterRole === "all" || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const selectedCandidatesList = candidates.filter(c => selections[c.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-teal">Calculating Weighted Candidate Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-300">
      
      {/* SECTION 1: MATRIC COEFFICIENT WEIGHT CONTROLLERS */}
      <div className="glass p-5 rounded-2xl border border-white/[0.05] space-y-4 bg-gradient-to-r from-brand-teal/[0.01] to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-3">
          <div>
            <h4 className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-brand-teal animate-pulse" /> Drive Round Weight Coefficients
            </h4>
            <p className="text-[10px] text-slate-500">Recalculate final placement eligibility weights in real-time (Must sum to 100%)</p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-navy-950 px-2.5 py-1 rounded-lg border border-white/[0.04] flex items-center gap-1">
            <span>Aggregated sum:</span>
            <span className={`font-bold ${cvWeight + aiWeight + piWeight === 100 ? "text-brand-teal" : "text-red-400 animate-pulse"}`}>
              {cvWeight + aiWeight + piWeight}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { val: cvWeight, set: setCvWeight, label: "01. Resume CV Screening Weight", desc: "ATS skills and academic profile compliance" },
            { val: aiWeight, set: setAiWeight, label: "02. AI Async Interview Weight", desc: "Simulated tech and behavioral question scores" },
            { val: piWeight, set: setPiWeight, label: "03. Personal Interview (PI) Weight", desc: "Human scorecard sliders average" },
          ].map((slider, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">{slider.label}</span>
                <span className="text-brand-teal font-mono font-bold">{slider.val}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={slider.val}
                onChange={(e) => slider.set(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <p className="text-[9px] text-slate-500 leading-snug">{slider.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DISPATCH SUCCESS ALERTS */}
      {dispatchCount !== null && (
        <div className="bg-brand-teal/15 border border-brand-teal/20 text-brand-teal p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Success! Dispatched {dispatchCount} personalized emails and locked status updates across the database.</span>
        </div>
      )}

      {/* FILTER SHELF */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-navy-950 border border-white/[0.06] text-xs text-slate-400 p-2 rounded-xl focus:outline-none focus:border-brand-teal w-full sm:w-max font-bold"
          >
            {rolesList.map((role) => (
              <option key={role} value={role}>{role === "all" ? "All Applied Roles" : role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 2: CANDIDATES SPREADSHEET MATRIX */}
      <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
        <div className="p-4 border-b border-white/[0.05] bg-navy-950/20 flex items-center justify-between">
          <h4 className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4 text-brand-teal" /> Multi-Round Consolidated Scorecard Table
          </h4>

          <button
            onClick={handleSelectAll}
            className="text-[10px] font-bold px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-slate-300 transition-colors"
          >
            {filteredCandidates.every(c => selections[c.id]) ? "Deselect All" : "Select All Filters"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-slate-400 min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.07] text-white bg-navy-950/40 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">Select</th>
                <th className="py-3 px-4">Candidate & College</th>
                <th className="py-3 px-4 text-center font-mono">CV Score ({cvWeight}%)</th>
                <th className="py-3 px-4 text-center font-mono">AI Interview ({aiWeight}%)</th>
                <th className="py-3 px-4 text-center font-mono">PI Rating ({piWeight}%)</th>
                <th className="py-3 px-4 text-center font-mono text-brand-teal font-extrabold">Weighted Score</th>
                <th className="py-3 px-4 text-right">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => {
                const isSelected = !!selections[c.id];
                const { cv, ai, pi, totalWeighted } = getCandidateScores(c);
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors ${
                      isSelected && "bg-brand-teal/[0.02]"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelectCandidate(c.id)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-teal" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[10px] text-slate-500 leading-none">{c.college}</div>
                      <div className="text-[9px] text-slate-500 leading-none truncate max-w-[200px]">{c.role}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-white/80">{cv}</td>
                    <td className="py-3 px-4 text-center font-mono text-white/80">{ai}%</td>
                    <td className="py-3 px-4 text-center font-mono text-white/80">{pi.toFixed(1)}%</td>

                    <td className="py-3 px-4 text-center font-mono text-brand-teal font-extrabold text-sm">
                      {totalWeighted.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        c.stage === "Offered" ? "bg-brand-teal/10 text-brand-teal border-brand-teal/10" :
                        c.stage === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/10" :
                        "bg-indigo-500/10 text-indigo-300 border-indigo-500/10"
                      }`}>
                        {c.stage}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: BULK ACTION DISPATCH INTERACTION */}
      {selectedCandidatesList.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-brand-teal/20 space-y-6 bg-brand-teal/[0.01] relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
            <div>
              <h4 className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-brand-teal" /> Action Panel: {selectedCandidatesList.length} Candidates Selected
              </h4>
              <p className="text-[10px] text-slate-500">Pick dispatch action and review personalized mail drafts before firing.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBulkActionType("Offered")}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  bulkActionType === "Offered" ? "bg-brand-teal text-navy-950 border-brand-teal" : "bg-white/5 border-white/[0.05] text-slate-300 hover:text-white"
                }`}
              >
                Extend Offers
              </button>
              <button
                onClick={() => setBulkActionType("Rejected")}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  bulkActionType === "Rejected" ? "bg-red-500/20 text-red-400 border-red-500/10" : "bg-white/5 border-white/[0.05] text-slate-300 hover:text-white"
                }`}
              >
                Send Closure
              </button>
            </div>
          </div>

          {bulkActionType && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              {/* EDITABLE FIELD CONTROLS (Offer Letter only) */}
              {bulkActionType === "Offered" ? (
                <div className="lg:col-span-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Start Date</label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-navy-950 border border-white/[0.06] rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CTC Salary Package</label>
                    <input
                      type="text"
                      value={salaryPackage}
                      onChange={(e) => setSalaryPackage(e.target.value)}
                      className="w-full bg-navy-950 border border-white/[0.06] rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-4 text-[10px] text-slate-500 leading-relaxed italic bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                  <ShieldAlert className="w-4 h-4 text-red-400 mb-1" />
                  Applications will be closed cleanly. Send a polite professional notification acknowledging their time and wishing them well.
                </div>
              )}

              {/* REAL-TIME mail DRAFT PREVIEW DISPLAY */}
              <div className="lg:col-span-8 bg-navy-950/80 border border-white/[0.05] p-5 rounded-xl space-y-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Dispatch Mail Draft Preview:</span>
                
                <div className="space-y-1 text-[11px] font-mono leading-relaxed text-indigo-300">
                  <div className="text-white font-bold text-xs pb-1.5 border-b border-white/[0.04] mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-teal" /> Subject: {bulkActionType === "Offered" ? "Placement Offer Letter" : "Application Update"}
                  </div>

                  <p>Dear {selectedCandidatesList[0]?.name || "[Name]"},</p>

                  {bulkActionType === "Offered" ? (
                    <div className="space-y-2">
                      <p>We are delighted to extend you an official placement offer at TechCorp Systems as a <strong>{selectedCandidatesList[0]?.role || "Software Intern"}</strong>.</p>
                      <p>Your stellar performance in the resume ATS round, AI interview, and human scorecard rounds demonstrated true engineering talent. We are offering you a package of <strong>{salaryPackage}</strong>, commencing <strong>{startDate}</strong>.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>Thank you for participating in the TechCorp Systems hiring drive. After deep analysis of your CV metrics and transcripts, we regret to inform you that we will not be moving forward with your application at this time.</p>
                      <p>We thoroughly enjoyed learning about your skills and wish you the best in your career.</p>
                    </div>
                  )}

                  <p className="pt-2">Warm regards,<br />Placement Administration Team</p>
                </div>

                {/* DISPATCH ACTION TRIGGERS */}
                <button
                  onClick={() => triggerBulkAction(bulkActionType)}
                  disabled={dispatching}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bulkActionType === "Offered"
                      ? "bg-brand-teal text-navy-950 hover:bg-brand-teal/90 shadow-lg shadow-brand-teal/15"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/10"
                  }`}
                >
                  {dispatching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Firing batch emails to selected recipients...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Dispatch Bulk Placement Emails
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
