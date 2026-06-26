import { useState, useEffect } from "react";
import { Users, Search, ChevronRight, CheckCircle, ShieldAlert, Sliders, FileText, Sparkles, Star, Award, Lock } from "lucide-react";
import { Candidate } from "../types";

export default function PiScorecards() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  // Scorecard values
  const [technical, setTechnical] = useState(7);
  const [communication, setCommunication] = useState(7);
  const [problemSolving, setProblemSolving] = useState(7);
  const [cultureFit, setCultureFit] = useState(7);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data);
      if (data.length > 0) {
        // Find first candidate without scorecard or default to first
        const pending = data.find((c: Candidate) => !c.piScorecard?.submitted);
        setSelectedId(pending ? pending.id : data[0].id);
      }
    } catch (e) {
      console.error("Failed to load candidates:", e);
    } finally {
      setLoading(false);
    }
  };

  const activeCandidate = candidates.find(c => String(c.id) === String(selectedId));

  // Load candidate scorecard if pre-filled or reset to defaults
  useEffect(() => {
    if (activeCandidate) {
      if (activeCandidate.piScorecard?.submitted) {
        setTechnical(activeCandidate.piScorecard.technical);
        setCommunication(activeCandidate.piScorecard.communication);
        setProblemSolving(activeCandidate.piScorecard.problemSolving);
        setCultureFit(activeCandidate.piScorecard.cultureFit);
        setNotes(activeCandidate.piScorecard.notes || "");
      } else {
        setTechnical(7);
        setCommunication(7);
        setProblemSolving(7);
        setCultureFit(7);
        setNotes("");
      }
    }
  }, [selectedId, activeCandidate]);

  const handleSubmitScorecard = async () => {
    if (!selectedId) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/candidates/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          technical,
          communication,
          problemSolving,
          cultureFit,
          notes
        })
      });
      const updated = await res.json();
      
      // Update local state list
      setCandidates(prev => prev.map(c => String(c.id) === String(selectedId) ? updated : c));
    } catch (e) {
      console.error("Failed to submit scorecard:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.college.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-teal">Fetching Candidate Files...</p>
      </div>
    );
  }

  // Calculate standard weighted average
  const weightedScore = (technical * 0.35 + communication * 0.25 + problemSolving * 0.25 + cultureFit * 0.15) * 10;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-300">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CANDIDATE FILES LIST */}
        <div className="md:col-span-4 bg-navy-950/40 border border-white/[0.05] rounded-2xl p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-brand-teal" /> Assigned Cohort
            </h3>
            <p className="text-[10px] text-slate-500">Select an applicant to begin scorecard evaluation</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-950 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredCandidates.map((c) => {
              const isSelected = String(c.id) === String(selectedId);
              const isSubmitted = c.piScorecard?.submitted;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-brand-teal/10 border-brand-teal/30 text-brand-teal"
                      : "bg-white/[0.01] border-white/[0.03] hover:border-white/10 text-slate-400"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{c.role}</div>
                    <div className="text-[9px] text-slate-500 truncate">{c.college}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSubmitted ? (
                      <span className="text-[9px] bg-brand-teal/20 text-brand-teal font-extrabold px-1.5 py-0.5 rounded-full border border-brand-teal/15 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> EVAL
                      </span>
                    ) : (
                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 font-extrabold px-1.5 py-0.5 rounded-full border border-yellow-500/15">
                        PENDING
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SCORECARD WORKSPACE */}
        <div className="md:col-span-8 space-y-6">
          {activeCandidate ? (
            <div className="glass p-6 rounded-2xl border border-white/[0.05] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />

              {/* CARD HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.05] pb-5">
                <div className="space-y-1">
                  <span className="text-[9px] bg-brand-teal/15 border border-brand-teal/20 text-brand-teal font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Candidate Profile Assessment File
                  </span>
                  <h3 className="text-white font-extrabold text-xl tracking-tight leading-none mt-1">{activeCandidate.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{activeCandidate.college}</span>
                    <span>•</span>
                    <span>CGPA: {activeCandidate.cgpa}</span>
                    <span>•</span>
                    <span>{activeCandidate.email}</span>
                  </div>
                </div>

                <div className="bg-navy-900 border border-white/[0.05] p-3 rounded-xl text-center min-w-[100px]">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">ATS match</span>
                  <span className="text-lg font-black text-brand-teal">{activeCandidate.aiScore}%</span>
                </div>
              </div>

              {/* SUB TABS / DETAILS DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-white/[0.05] pb-6">
                
                {/* CV SCREENING SNAPSHOT */}
                <div className="space-y-3 bg-navy-950/20 p-4 rounded-xl border border-white/[0.04]">
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Resume parsing Rubric
                  </h4>
                  {activeCandidate.cvScore ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-navy-950 p-1.5 rounded text-center">
                          <span className="text-slate-500 block uppercase">Skills Match</span>
                          <span className="text-xs font-bold text-white">{activeCandidate.cvScore.skillsMatch}/10</span>
                        </div>
                        <div className="bg-navy-950 p-1.5 rounded text-center">
                          <span className="text-slate-500 block uppercase">Exp relevance</span>
                          <span className="text-xs font-bold text-white">{activeCandidate.cvScore.experienceRelevance}/10</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed italic">
                        <span className="font-bold text-white">Summary:</span> "{activeCandidate.cvScore.summary}"
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No automated ATS breakdown available for this file.</p>
                  )}
                </div>

                {/* AI INTERVIEW TRANSCRIPT STATS */}
                <div className="space-y-3 bg-navy-950/20 p-4 rounded-xl border border-white/[0.04]">
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-teal" /> Async AI Q&A transcripts
                  </h4>
                  {activeCandidate.interviewSession ? (
                    <div className="space-y-2 text-[10px] text-slate-400">
                      <div className="flex items-center justify-between font-bold">
                        <span>Interview Status:</span>
                        <span className="text-brand-teal uppercase">{activeCandidate.interviewSession.status}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span>Aggregate Grade:</span>
                        <span className="text-white font-mono">{activeCandidate.interviewSession.totalScore || 0}%</span>
                      </div>
                      <p className="leading-relaxed text-[10px] italic">
                        "{activeCandidate.interviewSession.overallFeedback?.slice(0, 110)}..."
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">This candidate has not started the async interview round.</p>
                  )}
                </div>

              </div>

              {/* INTERACTIVE sliders SCORECARD SECTION */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-brand-teal" /> Personal Interview (PI) Scorecard
                  </h4>
                  {activeCandidate.piScorecard?.submitted && (
                    <span className="text-[9px] bg-brand-teal/20 border border-brand-teal/30 text-brand-teal font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Lock className="w-3 h-3" /> SCORE LOCKED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* SLIDERS LIST */}
                  <div className="space-y-4">
                    {[
                      { val: technical, set: setTechnical, label: "Technical Competency", desc: "Core computer science fundamentals, coding problem-solving" },
                      { val: communication, set: setCommunication, label: "Communication Skills", desc: "Clarity of thoughts, english articulation, pitch confidence" },
                      { val: problemSolving, set: setProblemSolving, label: "Problem Solving Rigor", desc: "Logical decomposition of complex scaling problems" },
                      { val: cultureFit, set: setCultureFit, label: "Culture & Team Fit", desc: "Values alignment, feedback receptiveness, positive energy" },
                    ].map((slider, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{slider.label}</span>
                          <span className="font-mono text-brand-teal font-bold">{slider.val}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={slider.val}
                          onChange={(e) => !activeCandidate.piScorecard?.submitted && slider.set(Number(e.target.value))}
                          disabled={activeCandidate.piScorecard?.submitted}
                          className="w-full accent-brand-teal cursor-pointer disabled:opacity-50"
                        />
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">{slider.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* QUALITATIVE NOTES COLUMN */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white block">Interviewer qualitative Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => !activeCandidate.piScorecard?.submitted && setNotes(e.target.value)}
                        placeholder="Write detailed assessment feedback here..."
                        disabled={activeCandidate.piScorecard?.submitted}
                        className="w-full h-36 bg-navy-950/80 border border-white/[0.06] rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* WEIGHTED RESULT CALCULATION PREVIEW */}
                    <div className="bg-navy-950 border border-white/[0.05] p-4 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Standard Weight Output</span>
                        <span className="font-bold text-white text-xs">Technical PI Scorecard:</span>
                      </div>
                      <span className="text-xl font-black text-brand-teal">{weightedScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                {!activeCandidate.piScorecard?.submitted && (
                  <button
                    onClick={handleSubmitScorecard}
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-brand-teal hover:bg-brand-teal/90 text-navy-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-brand-teal/15"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                        Submitting Scorecard...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Submit & Permanent Lock-in Scorecard
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 italic">No candidate selected.</div>
          )}
        </div>

      </div>

    </div>
  );
}
