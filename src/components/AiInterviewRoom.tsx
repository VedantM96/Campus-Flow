import { useState, useEffect } from "react";
import { Sparkles, Video, Mic, CheckCircle, ChevronRight, AlertCircle, RefreshCw, Send, ShieldAlert } from "lucide-react";

interface Question {
  id: string;
  category: string;
  question: string;
  hint: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

interface Session {
  status: string;
  questions: Question[];
  currentQuestionIndex: number;
  overallFeedback?: string;
  totalScore?: number;
}

export default function AiInterviewRoom() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [gradeFeedback, setGradeFeedback] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    fetchInterviewState();
  }, []);

  const fetchInterviewState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates/interview-state");
      const data = await res.json();
      setSession(data);
    } catch (e) {
      console.error("Failed to load interview state:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !session) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    try {
      setSubmittingAnswer(true);
      setGradeFeedback(null);

      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: currentAnswer
        })
      });

      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setCurrentAnswer("");
        
        // Show temporary score toast / notification
        if (data.gradedQuestion) {
          setGradeFeedback({
            score: data.gradedQuestion.score || 0,
            feedback: data.gradedQuestion.feedback || ""
          });
        }
      }
    } catch (e) {
      console.error("Failed to submit answer:", e);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">Booting AI Interview Environment...</p>
      </div>
    );
  }

  if (!session || session.status === "no_application") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-yellow-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-white font-bold text-lg">No Active Placement Application</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please browse open drives in the "Opportunities" tab and submit your application with a parsed resume. Once applied, your custom AI Interview slot will open.
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = session.status === "completed";
  const currentQuestion = !isCompleted ? session.questions[session.currentQuestionIndex] : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
        <div>
          <span className="text-[10px] bg-brand-indigo/20 border border-brand-indigo/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-max mb-1.5 animate-pulse">
            <span className="w-1 h-1 bg-brand-teal rounded-full animate-ping" />
            Phase 3: Automated AI Interview slot
          </span>
          <h2 className="text-white font-display text-2xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Async AI Recruiter Room
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Applicant Identity</span>
            <span className="text-xs font-bold text-white">Vedant Sharma</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-indigo/20 text-indigo-300 flex items-center justify-center font-bold text-sm border border-brand-indigo/30">
            VS
          </div>
        </div>
      </div>

      {isCompleted ? (
        /* COMPLETED PORTAL */
        <div className="glass p-8 rounded-2xl border border-brand-teal/20 bg-brand-teal/[0.01] text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-brand-teal/10 border border-brand-teal/20 rounded-full flex items-center justify-center mx-auto text-brand-teal">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-extrabold text-xl">AI Interview Round Completed!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your transcriptions and comprehensive performance report have been secured and logged. The Interviewer panel has been notified for human PI scorecard locking.
            </p>
          </div>

          {/* SUMMARY STATISTICS */}
          <div className="bg-navy-950/80 border border-white/[0.05] p-5 rounded-xl grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">AI Scorecard Target</span>
              <span className="text-2xl font-black text-brand-teal">{session.totalScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Status Lock</span>
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Final HR Pending
              </span>
            </div>
          </div>

          <div className="text-left bg-navy-950/40 p-4 rounded-xl border border-white/[0.04] text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
            <span className="font-bold text-white block mb-1">AI Executive Analysis:</span>
            {session.overallFeedback}
          </div>

          <button
            onClick={fetchInterviewState}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded-lg border border-white/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Interview State
          </button>
        </div>
      ) : (
        /* ACTIVE INTERVIEW SPREAD */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* WEBCAM SIMULATION PANEL */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative aspect-video md:aspect-[4/5] bg-[#0c0c16] rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl flex flex-col justify-between p-4">
              {cameraOn ? (
                /* SIMULATED WEBCAM SCREEN WITH GLOW */
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-brand-indigo/[0.03] to-transparent">
                  <div className="w-24 h-24 rounded-full border border-indigo-500/10 flex items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-indigo-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center text-white font-extrabold text-xs">
                        VS
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SUBTITLE OVERLAY */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/[0.05] p-2.5 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-white block">Vedant Sharma</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest flex items-center justify-center gap-1">
                      <span className="w-1 h-1 bg-brand-teal rounded-full animate-ping" /> Recording Live Stream
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  Camera Feed Paused
                </div>
              )}

              {/* FLOATING CONTROL CHIPS */}
              <div className="relative flex items-center justify-between z-10 w-full">
                <span className="bg-red-500/25 border border-red-500/30 text-red-400 font-bold px-2 py-0.5 rounded-md text-[9px] tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> REC
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCameraOn(!cameraOn)}
                    className={`p-2 rounded-lg border transition-colors ${
                      cameraOn ? "bg-white/5 border-white/[0.06] text-slate-300" : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMicOn(!micOn)}
                    className={`p-2 rounded-lg border transition-colors ${
                      micOn ? "bg-white/5 border-white/[0.06] text-slate-300" : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BOTTOM GLOWING WAVEFORM DECORATION */}
              <div className="relative z-10 w-full">
                {micOn && (
                  <div className="flex items-center justify-center gap-1 h-6">
                    {[1, 3, 2, 4, 3, 5, 2, 4, 1, 3, 2, 4, 1, 2, 1, 3, 4, 1, 2].map((val, idx) => (
                      <div
                        key={idx}
                        className="w-0.5 bg-brand-indigo rounded-full animate-pulse"
                        style={{
                          height: `${val * 3}px`,
                          animationDelay: `${idx * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PREVIOUS GRADED FEEDBACK DISPLAY */}
            {gradeFeedback && (
              <div className="bg-navy-950/40 p-4 rounded-xl border border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Previous Question score:</span>
                  <span className="text-brand-teal">{gradeFeedback.score}/10</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  "{gradeFeedback.feedback}"
                </p>
              </div>
            )}
          </div>

          {/* ACTIVE QUESTION PANEL */}
          <div className="md:col-span-3 space-y-4">
            <div className="glass p-6 rounded-2xl border border-white/[0.05] space-y-4 flex flex-col justify-between h-full min-h-[400px]">
              
              {/* STATUS INDICATOR */}
              <div className="flex items-center justify-between text-[11px] font-bold border-b border-white/[0.05] pb-3">
                <span className="text-indigo-400 uppercase tracking-widest font-mono">
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </span>
                <span className="text-slate-500 uppercase">
                  Category: {currentQuestion?.category}
                </span>
              </div>

              {/* QUESTION DISPENSARY */}
              <div className="space-y-3">
                <h3 className="text-white font-extrabold text-base leading-relaxed tracking-tight">
                  "{currentQuestion?.question}"
                </h3>
                
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-[10px] text-slate-500 flex gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-400 block mb-0.5">Scoring Criteria Tip:</span>
                    {currentQuestion?.hint}
                  </div>
                </div>
              </div>

              {/* STUDENT ANSWER SHEET */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Transcribed Response</label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your structured engineering response here. We recommend utilizing the STAR structure (Situation, Task, Action, Result) for behavioral prompts..."
                  disabled={submittingAnswer}
                  className="w-full h-36 bg-navy-950/80 border border-white/[0.06] rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-sans leading-relaxed"
                />
                
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                  <span>Minimum length suggested: 15 characters</span>
                  <span>{currentAnswer.length} chars</span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={handleSubmitAnswer}
                disabled={submittingAnswer || !currentAnswer.trim()}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  !currentAnswer.trim()
                    ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-lg shadow-brand-indigo/15"
                }`}
              >
                {submittingAnswer ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Grading answer using Gemini AI...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Response & Next Question
                  </>
                )}
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
