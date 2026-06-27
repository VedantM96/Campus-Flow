import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Job, Application, Candidate } from "./src/types";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let roles: Job[] = [
  {
    id: 1, title: 'Software Engineer Intern', company: 'Google', type: 'Internship',
    location: 'Bangalore', stipend: '₹2.4L/mo', deadline: 'Apply by Jul 15',
    match: 96, remote: false, duration: '3 months',
    skills: ['Python', 'Algorithms', 'Go', 'Distributed Systems'],
    color1: '#4285F4', color2: '#34A853',
    description: 'Join the core infrastructure team working on search ranking systems. You\'ll build scalable distributed components used by billions of users daily.',
    matchBreakdown: [
      { label: 'Skills', score: 98 },
      { label: 'Projects', score: 92 },
      { label: 'GPA', score: 95 },
      { label: 'CP Rating', score: 88 },
    ]
  },
  {
    id: 2, title: 'ML Research Intern', company: 'Microsoft', type: 'Research',
    location: 'Hyderabad', stipend: '₹1.8L/mo', deadline: 'Apply by Jul 20',
    match: 89, remote: true, duration: '6 months',
    skills: ['Python', 'PyTorch', 'NLP', 'Statistics'],
    color1: '#00A4EF', color2: '#7B68EE',
    description: 'Work alongside world-class researchers on large language models. Contribute to published research in NLP and vision transformers.',
    matchBreakdown: [
      { label: 'Skills', score: 85 },
      { label: 'Projects', score: 90 },
      { label: 'GPA', score: 95 },
      { label: 'Research', score: 72 },
    ]
  },
  {
    id: 3, title: 'Frontend Engineer', company: 'Razorpay', type: 'Full-time',
    location: 'Remote', stipend: '₹18LPA', deadline: 'Apply by Aug 1',
    match: 85, remote: true, duration: 'Permanent',
    skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
    color1: '#2B6CB0', color2: '#3182CE',
    description: 'Build the next generation of payment UI components used by 10M+ businesses across India. Own the design system end to end.',
    matchBreakdown: [
      { label: 'Skills', score: 92 },
      { label: 'Projects', score: 88 },
      { label: 'GPA', score: 80 },
      { label: 'Portfolio', score: 85 },
    ]
  },
  {
    id: 4, title: 'Data Analyst Intern', company: 'Amazon', type: 'Internship',
    location: 'Remote', stipend: '₹1.5L/mo', deadline: 'Apply by Jul 30',
    match: 82, remote: true, duration: '3 months',
    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
    color1: '#FF9900', color2: '#e47911',
    description: 'Analyse seller metrics and customer behaviour data at scale. Build dashboards that drive product decisions across APAC marketplace.',
    matchBreakdown: [
      { label: 'Skills', score: 78 },
      { label: 'Projects', score: 82 },
      { label: 'GPA', score: 88 },
      { label: 'Analytics', score: 70 },
    ]
  },
  {
    id: 5, title: 'SDE-1 Intern', company: 'Flipkart', type: 'Internship',
    location: 'Bangalore', stipend: '₹1.2L/mo', deadline: 'Apply by Aug 5',
    match: 79, remote: false, duration: '2 months',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
    color1: '#F59E0B', color2: '#D97706',
    description: 'Work on the supply chain optimisation platform handling millions of orders per day during sale events.',
    matchBreakdown: [
      { label: 'Skills', score: 72 },
      { label: 'Projects', score: 78 },
      { label: 'GPA', score: 88 },
      { label: 'DSA', score: 85 },
    ]
  },
  {
    id: 6, title: 'DevOps Intern', company: 'Atlassian', type: 'Internship',
    location: 'Remote', stipend: '₹1.6L/mo', deadline: 'Apply by Aug 10',
    match: 74, remote: true, duration: '4 months',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    color1: '#0052CC', color2: '#0065FF',
    description: 'Help build and maintain the CI/CD infrastructure that deploys Jira, Confluence, and Trello to millions of users globally.',
    matchBreakdown: [
      { label: 'Skills', score: 68 },
      { label: 'Projects', score: 72 },
      { label: 'GPA', score: 80 },
      { label: 'DevOps', score: 65 },
    ]
  },
  {
    id: 7, title: 'Product Analyst', company: 'PhonePe', type: 'Full-time',
    location: 'Pune', stipend: '₹12LPA', deadline: 'Apply by Aug 15',
    match: 71, remote: false, duration: 'Permanent',
    skills: ['Analytics', 'SQL', 'A/B Testing', 'Product Thinking'],
    color1: '#6B21A8', color2: '#9333EA',
    description: 'Drive product decisions for PhonePe\'s 500M+ user base using data-driven insights and user research.',
    matchBreakdown: [
      { label: 'Skills', score: 65 },
      { label: 'Projects', score: 72 },
      { label: 'GPA', score: 80 },
      { label: 'Strategy', score: 68 },
    ]
  },
  {
    id: 8, title: 'Security Researcher', company: 'Zomato', type: 'Internship',
    location: 'Gurgaon', stipend: '₹80K/mo', deadline: 'Apply by Aug 20',
    match: 64, remote: false, duration: '2 months',
    skills: ['Network Security', 'Python', 'Penetration Testing', 'Linux'],
    color1: '#EF4444', color2: '#F97316',
    description: 'Hunt for vulnerabilities in Zomato\'s platform and help secure the systems powering 20M+ food orders daily.',
    matchBreakdown: [
      { label: 'Skills', score: 58 },
      { label: 'Projects', score: 65 },
      { label: 'GPA', score: 80 },
      { label: 'Security', score: 52 },
    ]
  },
];

let studentApplications: Application[] = [
  { id: 1, role: 'Software Engineer Intern', company: 'Google', status: 'Interview', date: 'Jun 18', color1: '#4285F4', color2: '#34A853', aiScore: 96 },
  { id: 2, role: 'ML Research Intern', company: 'Microsoft', status: 'Screened', date: 'Jun 20', color1: '#00A4EF', color2: '#7B68EE', aiScore: 89 },
  { id: 5, role: 'SDE-1 Intern', company: 'Flipkart', status: 'Offered', date: 'Jun 10', color1: '#F59E0B', color2: '#D97706', aiScore: 82 },
];

let candidates: Candidate[] = [
  {
    id: 1, name: 'Arjun Mehta', email: 'arjun.mehta@iitb.ac.in', college: 'IIT Bombay',
    cgpa: '9.2', role: 'Software Engineer Intern', stage: 'Interview', aiScore: 94,
    color1: '#6366F1', color2: '#8B5CF6',
    skills: ['Python', 'C++', 'Algorithms', 'System Design', 'LeetCode 2100+'],
    aiAssessment: 'Exceptional problem-solving skills with Codeforces rating 2100+. Published research on graph algorithms. Strongest candidate in this cohort. Recommend fast-tracking to offer.',
    timeline: [
      { event: 'Applied', date: 'Jun 10', note: 'Via CampusFlow' },
      { event: 'AI Screened', date: 'Jun 11', note: 'Score: 94/100' },
      { event: 'Technical Round 1', date: 'Jun 18', note: 'Cleared with distinction' },
      { event: 'Interview Scheduled', date: 'Jun 26', note: 'Final round pending' },
    ],
    cvScore: {
      skillsMatch: 9,
      experienceRelevance: 9,
      educationFit: 10,
      communication: 9,
      overallFit: 10,
      total: 94,
      strengths: ['Algorithms & Data Structures (Codeforces Candidate Master)', 'Advanced Distributed Systems design knowledge', 'Outstanding academic credentials'],
      concerns: ['Limited commercial enterprise software experience'],
      summary: 'Arjun is an exceptionally gifted algorithms developer. He shows solid foundational maturity and is prime for senior mentorship.'
    },
    interviewSession: {
      status: 'completed',
      questions: [
        { id: 'q1', category: 'technical', question: 'How would you optimize a distributed cache retrieval under heavy write-load?', hint: 'Cache invalidation, write-through vs write-back', userAnswer: 'I would employ a read-through write-back cache strategy with a consistent hashing ring, paired with Redis Sentinel to ensure durability and prevent cache thundering herd effects.', score: 9, feedback: 'Superb architecture strategy.' },
        { id: 'q2', category: 'behavioral', question: 'Tell us about a time you handled conflict in a hackathon team.', hint: 'STAR method, resolution', userAnswer: 'During a 36-hour sprint, we disagreed on DB choice. I listed Pros/Cons, proposed SQLite as an intermediate mock layer, and resolved the deadlock smoothly.', score: 8, feedback: 'Rational conflict resolution.' }
      ],
      currentQuestionIndex: 2,
      totalScore: 85,
      overallFeedback: 'Arjun answered technical prompts with high clarity and structural composition. Demonstrates true senior developer maturity.'
    },
    piScorecard: {
      technical: 9,
      communication: 8,
      problemSolving: 10,
      cultureFit: 8,
      notes: 'Outstanding technical capacity. Solved the system design problem effortlessly. Hire immediately!',
      submitted: true,
      submittedAt: 'Jun 18'
    }
  },
  {
    id: 2, name: 'Priya Nair', email: 'priya.nair@nit.ac.in', college: 'NIT Trichy',
    cgpa: '8.9', role: 'ML Research Intern', stage: 'Screened', aiScore: 88,
    color1: '#14B8A6', color2: '#06B6D4',
    skills: ['PyTorch', 'NLP', 'Python', 'Statistics', 'TensorFlow'],
    aiAssessment: 'Strong ML foundation with a published paper on sentiment analysis. Excellent communication skills noted in cover letter. High potential for research role.',
    timeline: [
      { event: 'Applied', date: 'Jun 12' },
      { event: 'AI Screened', date: 'Jun 13', note: 'Score: 88/100' },
      { event: 'HR Call Completed', date: 'Jun 20' },
    ],
    cvScore: {
      skillsMatch: 9,
      experienceRelevance: 8,
      educationFit: 9,
      communication: 10,
      overallFit: 8,
      total: 88,
      strengths: ['Published ML paper on sentiment classification', 'Hands-on training experience with LLM finetuning', 'Fluent technical articulation'],
      concerns: ['Relatively weak classical software engineering background (C++/Java)'],
      summary: 'Priya possesses excellent statistical rigor. Her research portfolio and presentation skills are highly impressive.'
    },
    interviewSession: {
      status: 'completed',
      questions: [
        { id: 'q1', category: 'technical', question: 'How do you prevent vanishing gradients in deep networks?', hint: 'Activation functions, skip connections', userAnswer: 'By using ReLU/LeakyReLU activations, batch normalization layers, and incorporating residual skip connections as seen in ResNet architectures.', score: 9, feedback: 'Accurate and well-defined explanation.' }
      ],
      currentQuestionIndex: 1,
      totalScore: 90,
      overallFeedback: 'Excellent grasp of deep learning principles and model evaluation guidelines.'
    },
    piScorecard: {
      technical: 8,
      communication: 9,
      problemSolving: 8,
      cultureFit: 9,
      notes: 'Priya has a highly pleasant presentation manner. Possesses deep statistical curiosity. Highly recommended.',
      submitted: false
    }
  },
  {
    id: 3, name: 'Rohan Kapoor', email: 'rohan.k@bits.ac.in', college: 'BITS Pilani',
    cgpa: '8.4', role: 'Frontend Engineer', stage: 'Applied', aiScore: 81,
    color1: '#EC4899', color2: '#F97316',
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma', 'Node.js'],
    aiAssessment: 'Impressive portfolio with 3 production-grade projects. Strong React skills. Minor gap in backend experience — recommend pairing with senior engineer.',
    timeline: [
      { event: 'Applied', date: 'Jun 21' },
      { event: 'AI Screened', date: 'Jun 22', note: 'Score: 81/100' },
    ],
    cvScore: {
      skillsMatch: 8,
      experienceRelevance: 8,
      educationFit: 8,
      communication: 8,
      overallFit: 8,
      total: 81,
      strengths: ['Highly aesthetic Figma-to-React conversion portfolio', 'Thorough understanding of state managers like Zustand', 'Responsive UI focus'],
      concerns: ['Limited backend scaling or relational DB optimization background'],
      summary: 'Rohan is a product-oriented frontend engineer. He crafts smooth, responsive client experiences.'
    },
    interviewSession: {
      status: 'pending',
      questions: [
        { id: 'q1', category: 'technical', question: 'Explain how React\'s reconciliation algorithm uses key prop.', hint: 'Virtual DOM diffing', userAnswer: '', score: 0 }
      ],
      currentQuestionIndex: 0
    },
    piScorecard: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      cultureFit: 0,
      notes: '',
      submitted: false
    }
  },
  {
    id: 4, name: 'Anjali Singh', email: 'anjali.s@vit.edu', college: 'VIT Vellore',
    cgpa: '8.7', role: 'Data Analyst Intern', stage: 'Screened', aiScore: 76,
    color1: '#F59E0B', color2: '#EF4444',
    skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics'],
    aiAssessment: 'Solid data skills with hands-on experience in e-commerce analytics project. Recommend adding one SQL assessment before final decision.',
    timeline: [
      { event: 'Applied', date: 'Jun 14' },
      { event: 'AI Screened', date: 'Jun 15', note: 'Score: 76/100' },
      { event: 'Assignment Sent', date: 'Jun 22' },
    ],
    cvScore: {
      skillsMatch: 7,
      experienceRelevance: 8,
      educationFit: 8,
      communication: 8,
      overallFit: 7,
      total: 76,
      strengths: ['Advanced interactive Tableau layouts', 'Proficient SQL query writing (complex aggregations)', 'Sound understanding of cohort retention analytics'],
      concerns: ['Limited scripting/automation background beyond basic Python pandas'],
      summary: 'Anjali is highly detail-oriented and understands e-commerce domain metrics well.'
    },
    interviewSession: {
      status: 'completed',
      questions: [
        { id: 'q1', category: 'technical', question: 'Describe the difference between inner join, left join and group by.', hint: 'Aggregation vs merging', userAnswer: 'Inner join aggregates matching rows, left join retains all left-hand rows, and group by clusters metrics for analysis.', score: 8, feedback: 'Strong SQL fundamentals.' }
      ],
      currentQuestionIndex: 1,
      totalScore: 80,
      overallFeedback: 'Demonstrated precise analytical reasoning.'
    },
    piScorecard: {
      technical: 7,
      communication: 8,
      problemSolving: 7,
      cultureFit: 8,
      notes: 'Competent data profiling capacity. Solved the simple relational puzzle quickly.',
      submitted: true,
      submittedAt: 'Jun 24'
    }
  },
  {
    id: 5, name: 'Kiran Reddy', email: 'kiran.r@iitm.ac.in', college: 'IIT Madras',
    cgpa: '9.0', role: 'Software Engineer Intern', stage: 'Offered', aiScore: 91,
    color1: '#10B981', color2: '#059669',
    skills: ['C++', 'Java', 'Competitive Programming', 'OS', 'Networks'],
    aiAssessment: 'Outstanding DSA skills — top 1% on Codeforces. Strong fundamentals in OS and networks. Excellent culture fit based on video screening.',
    timeline: [
      { event: 'Applied', date: 'Jun 5' },
      { event: 'AI Screened', date: 'Jun 6', note: 'Score: 91/100' },
      { event: 'Technical Round 1', date: 'Jun 12' },
      { event: 'Technical Round 2', date: 'Jun 19' },
      { event: 'Offer Extended', date: 'Jun 24', note: '🎉 ₹2.4L/mo' },
    ],
    cvScore: {
      skillsMatch: 10,
      experienceRelevance: 8,
      educationFit: 10,
      communication: 8,
      overallFit: 9,
      total: 91,
      strengths: ['Top 1% Codeforces rating (Master)', 'Impeccable B.Tech credentials from IIT Madras', 'Highly rigorous low-level systems knowledge'],
      concerns: ['Relatively dry web dev portfolio'],
      summary: 'Kiran represents the peak of technical problem-solving. Ideal for backend core or platform infrastructure teams.'
    },
    interviewSession: {
      status: 'completed',
      questions: [
        { id: 'q1', category: 'technical', question: 'How do you handle thread deadlock in multi-threaded application?', hint: 'Locks ordering, detection algorithms', userAnswer: 'By establishing a strict thread acquisition hierarchy, utilizing lock timeout periods, and running deadlock detection threads to release stuck resources.', score: 9, feedback: 'Perfect multi-threading strategy.' }
      ],
      currentQuestionIndex: 1,
      totalScore: 90,
      overallFeedback: 'Rigorous computer science knowledge.'
    },
    piScorecard: {
      technical: 10,
      communication: 8,
      problemSolving: 10,
      cultureFit: 9,
      notes: 'Outstanding technical capability. Solved both DSA puzzles perfectly in 15 minutes. Extended offer instantly.',
      submitted: true,
      submittedAt: 'Jun 19'
    }
  },
  {
    id: 6, name: 'Meera Iyer', email: 'meera.i@manipal.edu', college: 'Manipal Institute',
    cgpa: '8.1', role: 'DevOps Intern', stage: 'Applied', aiScore: 68,
    color1: '#0052CC', color2: '#8B5CF6',
    skills: ['Linux', 'Docker', 'Bash', 'AWS', 'Git'],
    aiAssessment: 'Decent DevOps fundamentals with practical experience on personal projects. Recommend a hands-on technical assessment to verify Kubernetes skills.',
    timeline: [
      { event: 'Applied', date: 'Jun 23' },
      { event: 'AI Screened', date: 'Jun 24', note: 'Score: 68/100' },
    ],
    cvScore: {
      skillsMatch: 7,
      experienceRelevance: 6,
      educationFit: 8,
      communication: 7,
      overallFit: 6,
      total: 68,
      strengths: ['Hands-on self-hosted container projects', 'Solid understanding of Linux bash automation', 'Adept Git pipeline configurations'],
      concerns: ['Lacks large scale production cloud experience'],
      summary: 'Meera has strong hobbyist deployment chops. Standard engineering profile with high upskilling potential.'
    },
    interviewSession: {
      status: 'pending',
      questions: [
        { id: 'q1', category: 'technical', question: 'What is the purpose of Docker multi-stage builds?', hint: 'Reduced image size', userAnswer: '', score: 0 }
      ],
      currentQuestionIndex: 0
    },
    piScorecard: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      cultureFit: 0,
      notes: '',
      submitted: false
    }
  }
];

// Quota Circuit Breaker
let quotaExceededUntil = 0;

function isGeminiQuotaExceeded(): boolean {
  return Date.now() < quotaExceededUntil;
}

function recordGeminiQuotaExceeded() {
  // Set breaker for 45 seconds to bypass API calls and avoid redundant rate limits
  quotaExceededUntil = Date.now() + 45000;
  console.warn(`[Circuit Breaker] Gemini quota exceeded. Bypassing API calls for 45 seconds.`);
}

// Lazy Gemini Client setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (isGeminiQuotaExceeded()) {
    return null; // Temporarily bypass to use high-quality local heuristics immediately
  }
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err: any) {
        console.warn("Failed to initialize GoogleGenAI:", err?.message || err);
      }
    }
  }
  return aiClient;
}

// Helper to generate heuristic-based fallback response for Resume Optimization
function getHeuristicResumeReport(skills: string[]) {
  const allSkillsStr = skills.join(", ").toLowerCase();
  const suggestions: string[] = [];

  if (!allSkillsStr.includes("git") && !allSkillsStr.includes("github")) {
    suggestions.push("Integrate clear GitHub repository hyperlinks demonstrating raw engineering contributions.");
  }
  if (!allSkillsStr.includes("unit") && !allSkillsStr.includes("test")) {
    suggestions.push("Explicitly list experience with modern testing frameworks (Jest, Vitest, Cypress) to boost standard industry ATS scores.");
  }
  if (skills.length < 5) {
    suggestions.push("Incorporate additional core programming languages or infrastructure tags (e.g. Docker, TypeScript) to rank higher in screening algorithms.");
  }

  // Ensure we always have exactly 3 suggestions
  while (suggestions.length < 3) {
    suggestions.push(`Quantify your professional outcomes — e.g. "Improved query performance by ${Math.floor(Math.random() * 20) + 10}% using Redis caching."`);
    suggestions.push("Structure your work experience chronologically utilizing standard bulleted Action-Impact verbs.");
  }

  return {
    atsScore: Math.floor(Math.random() * 15) + 78, // 78-92 range
    matchBoost: `+${Math.floor(Math.random() * 10) + 12}%`, // +12% to +21%
    suggestions: suggestions.slice(0, 3)
  };
}

// ── API ROUTES ───────────────────────────────────────────

// GET /api/jobs
app.get("/api/jobs", (req, res) => {
  res.json(roles);
});

// POST /api/jobs
app.post("/api/jobs", async (req, res) => {
  const { title, company, type, location, stipend, skills, description } = req.body;
  if (!title || !company) {
    return res.status(400).json({ error: "Title and Company are required." });
  }

  const skillArray = typeof skills === 'string'
    ? skills.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : (Array.isArray(skills) ? skills : []);

  // Standard gradient colors
  const gradientColors = [
    { c1: '#4285F4', c2: '#34A853' },
    { c1: '#00A4EF', c2: '#7B68EE' },
    { c1: '#2B6CB0', c2: '#3182CE' },
    { c1: '#6B21A8', c2: '#9333EA' },
    { c1: '#EF4444', c2: '#F97316' }
  ];
  const colorScheme = gradientColors[Math.floor(Math.random() * gradientColors.length)];

  const newJob: any = {
    id: roles.length + 1,
    title,
    company,
    type: type || 'Internship',
    location: location || 'Bangalore',
    stipend: stipend || '₹1.5L/mo',
    deadline: 'Apply within 2 weeks',
    match: 75, // initial default
    remote: (location || '').toLowerCase().includes('remote'),
    duration: '3 months',
    skills: skillArray,
    color1: colorScheme.c1,
    color2: colorScheme.c2,
    description: description || `Exciting opportunity to join the engineering team at ${company}. Work with highly talented professionals on next-generation problems.`,
    matchBreakdown: [
      { label: 'Skills', score: 70 },
      { label: 'Projects', score: 80 },
      { label: 'GPA', score: 85 },
      { label: 'Evaluation', score: 65 },
    ]
  };

  // Try to use Gemini to compute real match score for Vedant Sharma (B.Tech CSE student profile)
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Evaluate the match of a student with the following job posting.
Student profile: B.Tech CSE, NIT Raipur, CGPA 8.91, Skills: C++, DSA, JavaScript, React, Python, Tailwind CSS, SQL.
Job Description:
Title: ${newJob.title}
Company: ${newJob.company}
Skills Required: ${skillArray.join(", ")}
Description: ${newJob.description}

Evaluate the student's qualification and output:
1. Overall Match Score (an integer between 40 and 100)
2. Match Breakdown scores for: Skills Match, Projects, GPA Match, Coding Match.
Format the output strictly as JSON adhering to this schema:
{
  "match": number,
  "breakdown": [
    { "label": "Skills", "score": number },
    { "label": "Projects", "score": number },
    { "label": "GPA", "score": number },
    { "label": "Evaluation", "score": number }
  ]
}
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              match: { type: Type.INTEGER },
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    score: { type: Type.INTEGER }
                  },
                  required: ["label", "score"]
                }
              }
            },
            required: ["match", "breakdown"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        newJob.match = parsed.match || 75;
        newJob.matchBreakdown = parsed.breakdown || newJob.matchBreakdown;
      }
    } catch (e: any) {
      const errMsg = String(e?.message || e || "").toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("limit")) {
        recordGeminiQuotaExceeded();
      }
      console.warn("Gemini failed to generate match parameters, using heuristics:", e?.message || e);
      // fallback calculation
      let score = 65;
      const studentSkills = ['c++', 'dsa', 'javascript', 'react', 'python', 'tailwind', 'sql'];
      const matched = skillArray.filter((s: string) => studentSkills.includes(s.toLowerCase()));
      score += Math.min(matched.length * 8, 30);
      newJob.match = Math.min(score, 98);
      newJob.matchBreakdown[0].score = Math.min(score + 2, 100);
      newJob.matchBreakdown[1].score = Math.floor(Math.random() * 15) + 75;
    }
  } else {
    // fallback score calculation
    let score = 65;
    const studentSkills = ['c++', 'dsa', 'javascript', 'react', 'python', 'tailwind', 'sql'];
    const matched = skillArray.filter((s: string) => studentSkills.includes(s.toLowerCase()));
    score += Math.min(matched.length * 8, 30);
    newJob.match = Math.min(score, 98);
    newJob.matchBreakdown[0].score = Math.min(score + 2, 100);
    newJob.matchBreakdown[1].score = Math.floor(Math.random() * 15) + 75;
  }

  roles.unshift(newJob);
  res.status(201).json(newJob);
});

// GET /api/applications
app.get("/api/applications", (req, res) => {
  res.json(studentApplications);
});

// POST /api/applications
app.post("/api/applications", async (req, res) => {
  const { roleId } = req.body;
  const job = roles.find(r => String(r.id) === String(roleId));
  if (!job) {
    return res.status(404).json({ error: "Job posting not found" });
  }

  // Check if student has already applied
  const existing = studentApplications.find(a => a.company === job.company && a.role === job.title);
  if (existing) {
    return res.status(400).json({ error: `Already applied to ${job.company}!` });
  }

  const newApp = {
    id: studentApplications.length + 1,
    role: job.title,
    company: job.company,
    status: 'Applied',
    date: 'Just now',
    color1: job.color1,
    color2: job.color2,
    aiScore: job.match
  };

  studentApplications.unshift(newApp);

  // Auto-generate recruiter candidate instance
  const newCandidateId = candidates.length + 1;
  const newCandidate: any = {
    id: newCandidateId,
    name: 'Vedant Sharma',
    email: 'vedant.sharma@nitrr.ac.in',
    college: 'NIT Raipur',
    cgpa: '8.91',
    role: job.title,
    stage: 'Applied',
    aiScore: job.match,
    color1: '#6366F1',
    color2: '#8B5CF6',
    skills: ['C++', 'DSA', 'JavaScript', 'React', 'Python', 'Tailwind CSS', 'SQL'],
    aiAssessment: `AI Evaluation computed standard skills overlap of ${(job.match * 0.9).toFixed(1)}%. Shows strong background in React/Frontend engineering matching core job mandates.`,
    timeline: [
      { event: 'Applied', date: 'Just now', note: 'Via CampusFlow' },
      { event: 'AI Screened', date: 'Just now', note: `Score: ${job.match}/100` }
    ]
  };

  // Try to use Gemini to create a rich tailored Recruiter AI Assessment for this candidate
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a concise recruiter-focused AI assessment comment (under 50 words) for a candidate applying to this job.
Candidate: Vedant Sharma, NIT Raipur student, B.Tech CSE, 8.91 CGPA, React, JS, C++, DSA.
Job Posting: ${job.title} at ${job.company} (${job.description})
Format: Clean, objective professional assessment highlighting specific strengths/compatibility.`,
      });
      if (response.text) {
        newCandidate.aiAssessment = response.text.trim();
      }
    } catch (e: any) {
      const errMsg = String(e?.message || e || "").toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("limit")) {
        recordGeminiQuotaExceeded();
      }
      console.warn("Gemini failed to generate candidate assessment:", e?.message || e);
    }
  }

  candidates.unshift(newCandidate);

  res.status(201).json({
    application: newApp,
    candidate: newCandidate
  });
});

// GET /api/candidates
app.get("/api/candidates", (req, res) => {
  res.json(candidates);
});

// POST /api/candidates/advance
app.post("/api/candidates/advance", (req, res) => {
  const { id, nextStage } = req.body;
  const candidate = candidates.find(c => String(c.id) === String(id));
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  const oldStage = candidate.stage;
  candidate.stage = nextStage || 'Screened';

  // Add event to timeline
  candidate.timeline.unshift({
    event: `Moved to ${candidate.stage}`,
    date: 'Just now',
    note: `Recruiter advanced candidate from ${oldStage}`
  });

  // Sync back to student's application state if candidate name matches 'Vedant Sharma'
  if (candidate.name === 'Vedant Sharma') {
    const studentApp = studentApplications.find(a => a.company === candidate.role.split("—")[0].trim() || a.role === candidate.role);
    if (studentApp) {
      studentApp.status = candidate.stage;
    }
  }

  res.json(candidate);
});

// GET /api/candidates/interview-state
app.get("/api/candidates/interview-state", (req, res) => {
  // Find or initialize interview state for Vedant Sharma
  let student = candidates.find(c => c.name === "Vedant Sharma");
  if (!student) {
    // If student has not applied yet, return default pending state
    return res.json({
      status: "no_application",
      questions: []
    });
  }

  if (!student.interviewSession) {
    student.interviewSession = {
      status: "pending",
      questions: [
        { id: "q1", category: "technical", question: "Explain the difference between Virtual DOM and Real DOM in React, and how React's fiber architecture optimizes rendering performance.", hint: "Reconciliation, fiber nodes, scheduling updates" },
        { id: "q2", category: "technical", question: "Describe how you would optimize a slow database query involving multiple JOIN operations on columns without indexes.", hint: "Indexes, execution plan, query optimization, indexing foreign keys" },
        { id: "q3", category: "technical", question: "What is a deadlock in multithreading, and what are the techniques to systematically prevent it?", hint: "Deadlock conditions, mutual exclusion, circular wait, resource acquisition ordering" },
        { id: "q4", category: "behavioral", question: "Describe a complex technical challenge you faced during a project. How did you diagnose and overcome it?", hint: "STAR methodology, structured troubleshooting, metrics, outcomes" },
        { id: "q5", category: "role_fit", question: "Why do you want to join our engineering organization, and how do your skills in B.Tech CSE align with our scaling roadmap?", hint: "Core alignment, technology stack overlap, eagerness to learn" }
      ],
      currentQuestionIndex: 0
    };
  }

  res.json(student.interviewSession);
});

// POST /api/interview/answer
app.post("/api/interview/answer", async (req, res) => {
  const { questionId, userAnswer } = req.body;
  const student = candidates.find(c => c.name === "Vedant Sharma");
  
  if (!student || !student.interviewSession) {
    return res.status(400).json({ error: "No active interview session found." });
  }

  const session = student.interviewSession;
  const qIndex = session.questions.findIndex(q => q.id === questionId);
  if (qIndex === -1) {
    return res.status(404).json({ error: "Question not found in active session." });
  }

  const question = session.questions[qIndex];
  question.userAnswer = userAnswer || "";

  let score = 7;
  let feedback = "Decent overview. Could be expanded with more technical details or production-level examples.";

  const client = getGeminiClient();
  if (client && userAnswer && userAnswer.trim().length > 10) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an AI interviewer scoring an answer.
Question: ${question.question}
Category: ${question.category}
What a strong answer should cover: ${question.hint}

Candidate's Answer:
"${userAnswer}"

Grade the answer out of 10. Give constructive feedback in 2 sentences.
Return STRICTLY as a JSON object matching this schema:
{
  "score": number, // integer 0 to 10
  "feedback": "string"
}
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text.trim());
        score = result.score || 7;
        feedback = result.feedback || feedback;
      }
    } catch (e: any) {
      const errMsg = String(e?.message || e || "").toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("limit")) {
        recordGeminiQuotaExceeded();
      }
      console.warn("Gemini failed to grade answer, using heuristics:", e?.message || e);
    }
  } else {
    // Basic heuristic grading based on answer length and keywords
    const lowerAns = (userAnswer || "").toLowerCase();
    const keywords = question.hint.toLowerCase().split(",").map(k => k.trim());
    let matchCount = 0;
    keywords.forEach(kw => {
      if (lowerAns.includes(kw)) matchCount++;
    });

    if (lowerAns.length < 15) {
      score = 3;
      feedback = "Answer is too brief. Please provide a more comprehensive, structured explanation.";
    } else {
      score = Math.min(5 + matchCount * 1.5, 10);
      if (score >= 8) {
        feedback = "Excellent! You demonstrated solid theoretical concepts and clear, logical reasoning.";
      } else if (score >= 6) {
        feedback = "Good response. It covers the core requirements, though elaborating on production scaling would strengthen it.";
      }
    }
  }

  question.score = score;
  question.feedback = feedback;

  // Advance index
  session.currentQuestionIndex += 1;

  if (session.currentQuestionIndex >= session.questions.length) {
    session.status = "completed";
    
    // Calculate total score scaled to 100
    const totalRaw = session.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const maxRaw = session.questions.length * 10;
    session.totalScore = Math.round((totalRaw / maxRaw) * 100);
    session.overallFeedback = `AI Interview completed successfully with aggregate technical proficiency of ${session.totalScore}%. Shown good analytical depth and communication skills.`;

    // Sync to candidate main score
    student.aiScore = Math.round((student.aiScore + session.totalScore) / 2);
    student.stage = "Interview"; // Advanced to interview PI stage
    
    // Add to student timeline
    student.timeline.unshift({
      event: "AI Interview Completed",
      date: "Just now",
      note: `Scored ${session.totalScore}/100 in comprehensive technical async interview.`
    });

    // Sync back to student applications
    const studentApp = studentApplications.find(a => a.role === student.role);
    if (studentApp) {
      studentApp.status = "Interview";
      studentApp.aiScore = student.aiScore;
    }
  } else {
    session.status = "in_progress";
  }

  res.json({
    session,
    gradedQuestion: question
  });
});

// POST /api/candidates/scorecard
app.post("/api/candidates/scorecard", (req, res) => {
  const { id, technical, communication, problemSolving, cultureFit, notes } = req.body;
  const candidate = candidates.find(c => String(c.id) === String(id));
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  candidate.piScorecard = {
    technical: Number(technical || 0),
    communication: Number(communication || 0),
    problemSolving: Number(problemSolving || 0),
    cultureFit: Number(cultureFit || 0),
    notes: notes || "",
    submitted: true,
    submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
  };

  // Add event to timeline
  candidate.timeline.unshift({
    event: "Interviewer Scorecard Locked",
    date: "Just now",
    note: `Overall rating: ${((candidate.piScorecard.technical*0.35 + candidate.piScorecard.communication*0.25 + candidate.piScorecard.problemSolving*0.25 + candidate.piScorecard.cultureFit*0.15) * 10).toFixed(1)}% by Recruiter`
  });

  res.json(candidate);
});

// POST /api/candidates/bulk-action
app.post("/api/candidates/bulk-action", (req, res) => {
  const { selections, actionType } = req.body; // selections: list of candidate IDs, actionType: 'Offered' | 'Rejected' | 'Interview'
  if (!selections || !Array.isArray(selections)) {
    return res.status(400).json({ error: "Selections must be an array." });
  }

  const updatedCandidates: any[] = [];
  selections.forEach(id => {
    const candidate = candidates.find(c => String(c.id) === String(id));
    if (candidate) {
      const oldStage = candidate.stage;
      candidate.stage = actionType;
      
      let note = "";
      if (actionType === "Offered") {
        note = "🎉 Extended official placement offer letter via automated CampusFlow batch.";
      } else if (actionType === "Rejected") {
        note = "Application closed in this placement drive.";
      } else {
        note = `Recruiter updated status to ${actionType}.`;
      }

      candidate.timeline.unshift({
        event: actionType === "Offered" ? "Offer Extended" : actionType === "Rejected" ? "Application Closed" : `Status: ${actionType}`,
        date: "Just now",
        note: note
      });

      // Sync back to student applications if name matches
      if (candidate.name === 'Vedant Sharma') {
        const studentApp = studentApplications.find(a => a.role === candidate.role);
        if (studentApp) {
          studentApp.status = actionType;
        }
      }

      updatedCandidates.push(candidate);
    }
  });

  res.json({
    success: true,
    count: updatedCandidates.length,
    updated: updatedCandidates
  });
});

// POST /api/optimize-resume
app.post("/api/optimize-resume", async (req, res) => {
  const { skills, profileText } = req.body;
  const activeSkills = Array.isArray(skills) ? skills : ['C++', 'DSA', 'JavaScript', 'React', 'Python', 'Tailwind CSS'];

  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this student's profile for a software recruitment system:
Skills: ${activeSkills.join(", ")}
Profile description: ${profileText || "Student pursuing B.Tech in CSE at NIT Raipur. GPA: 8.91. Enthusiastic about web development and data structures."}

Provide:
1. An ATS Score (integer 0-100)
2. A match boost percentage (e.g. "+18%")
3. Exactly 3 highly actionable, highly personalized resume optimization suggestions in markdown.
Return the result strictly as a JSON object matching this schema:
{
  "atsScore": number,
  "matchBoost": string,
  "suggestions": string[]
}
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.INTEGER },
              matchBoost: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["atsScore", "matchBoost", "suggestions"]
          }
        }
      });

      if (response.text) {
        return res.json(JSON.parse(response.text.trim()));
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("limit")) {
        recordGeminiQuotaExceeded();
      }
      console.warn("Gemini call to optimize resume failed, using fallback:", err?.message || err);
    }
  }

  // Fallback
  return res.json(getHeuristicResumeReport(activeSkills));
});

// GET /api/ai-insights
app.get("/api/ai-insights", async (req, res) => {
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an elite AI campus recruiting advisor. Look at this student candidate list:
${JSON.stringify(candidates.map(c => ({ name: c.name, score: c.aiScore, stage: c.stage, role: c.role, skills: c.skills })))}

Provide exactly 3 high-impact, short, and punchy recruiting insights or actionable alerts for the recruiter dashboard.
Each insight must be under 15 words.
Return the results strictly as a JSON list matching this schema:
[
  { "text": string, "color": "#6366F1", "iconType": "star" | "clock" | "lightning" },
  { "text": string, "color": "#14B8A6", "iconType": "star" | "clock" | "lightning" },
  { "text": string, "color": "#EC4899", "iconType": "star" | "clock" | "lightning" }
]
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                color: { type: Type.STRING },
                iconType: { type: Type.STRING, enum: ["star", "clock", "lightning"] }
              },
              required: ["text", "color", "iconType"]
            }
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const mapped = parsed.map((item: any) => {
          let icon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
          if (item.iconType === 'lightning') {
            icon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
          } else if (item.iconType === 'star') {
            icon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
          }
          return { text: item.text, color: item.color || '#6366F1', icon };
        });
        return res.json(mapped);
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("limit")) {
        recordGeminiQuotaExceeded();
      }
      console.warn("Failed to generate AI insights, using fallback:", err?.message || err);
    }
  }

  // Fallback insights
  const defaultInsights = [
    { text: '87% of top candidates for SWE roles have Python on their CV — consider adding it to the JD.', color: '#6366F1', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
    { text: '3 candidates in "Screened" have been waiting >5 days. Moving them faster improves acceptance rate by 23%.', color: '#14B8A6', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    { text: 'Vedant Sharma (AI Score: 96) has high technical overlap. Fast-track requested.', color: '#EC4899', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  ];
  return res.json(defaultInsights);
});



// ── VITE MIDDLEWARE SETUP ────────────────────────────────

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to host localhost and port 3000
  app.listen(PORT, "localhost", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();