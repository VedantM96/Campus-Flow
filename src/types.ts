export interface MatchBreakdown {
  label: string;
  score: number;
}

export interface Job {
  id: string | number;
  title: string;
  company: string;
  type: string; // Internship, Full-time, etc.
  location: string;
  stipend: string;
  deadline: string;
  match: number;
  remote: boolean;
  duration: string;
  skills: string[];
  color1: string;
  color2: string;
  description: string;
  matchBreakdown: MatchBreakdown[];
  minCgpa?: number;
  allowedBranches?: string[];
  ctc?: string;
  status?: string; // draft, open, closed
}

export interface Application {
  id: string | number;
  role: string;
  company: string;
  status: string; // Applied, Screened, Interview, Offered, Rejected
  date: string;
  color1: string;
  color2: string;
  aiScore: number | null;
  cvScore?: any;
  aiInterviewScore?: any;
  piScore?: any;
}

export interface TimelineEvent {
  event: string;
  date: string;
  note?: string;
}

export interface InterviewQuestion {
  id: string;
  category: "technical" | "behavioral" | "role_fit";
  question: string;
  hint: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

export interface PiScorecard {
  technical: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  notes: string;
  submitted: boolean;
  submittedAt?: string;
}

export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  college: string;
  cgpa: string;
  role: string;
  stage: string; // Applied, Screened, Interview, Offered, Rejected
  aiScore: number;
  color1: string;
  color2: string;
  skills: string[];
  aiAssessment: string;
  timeline: TimelineEvent[];
  cvScore?: {
    skillsMatch: number;
    experienceRelevance: number;
    educationFit: number;
    communication: number;
    overallFit: number;
    total: number;
    strengths: string[];
    concerns: string[];
    summary: string;
  };
  interviewSession?: {
    status: "pending" | "in_progress" | "completed";
    questions: InterviewQuestion[];
    currentQuestionIndex: number;
    overallFeedback?: string;
    totalScore?: number;
  };
  piScorecard?: PiScorecard;
}

// ── CAMPUS BUZZ TYPES ──────────────────────────────────
export interface CampusChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: string;
}

export interface CampusGroupChat {
  id: string;
  postId: string;
  postTitle: string;
  hashtag: string;
  messages: CampusChatMessage[];
  isOpen: boolean;
}

export interface CampusBuzzPost {
  id: string;
  title: string;
  description: string;
  hashtag: string; // #foodsplit, #cabsplit, #resell, #lost, #found
  image: string;
  posterName: string;
  posterEmail: string;
  createdAt: string;
  expiryTime?: string; // for #foodsplit and #cabsplit
  durationMinutes?: number;
  groupChatRoomId?: string;
  contactInfo?: string; // for #lost, #found
  linkedEventId?: string; // option to link official posts to calendar
  formUrl?: string; // option for google form embedding in club posts
  isOfficial?: boolean; // true for club / admin posts
  isActive: boolean;
}

export interface CampusComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  posterRealName: string;
  posterRealEmail: string;
  isResolved: boolean;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  creatorRole: "club" | "admin" | "student";
  creatorName: string;
  linkedPostId?: string;
  isApproved: boolean; // requests from students must be approved by admin
}

