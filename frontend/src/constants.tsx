import React from 'react';

export const LOGO_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const FEATURES = [
  {
    title: "AI LLM Council",
    desc: "Powered by Gemini AI models with Google Search grounding for real-time verified medical information and treatment plans.",
    icon: "🧠",
    gradient: "from-violet-500 to-purple-600"
  },
  {
    title: "Hash Ledger Security",
    desc: "Blockchain-inspired tamper-evident hash chain with AES-256-GCM encryption + SHA-256 hashing for prototype-level data integrity.",
    icon: "🔒",
    gradient: "from-sky-500 to-blue-600"
  },
  {
    title: "Indian Medical Database",
    desc: "254,000+ verified Indian medications with salt composition, dosage, side effects, prices, and generic alternatives from the enriched CSV database.",
    icon: "🇮🇳",
    gradient: "from-orange-500 to-amber-600"
  },
  {
    title: "Report Analyzer",
    desc: "Upload PDFs or images of lab reports. AI explains findings in simple language with actionable recommendations.",
    icon: "📋",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    title: "Symptom Checker",
    desc: "Interactive button-based symptom form with AI-driven diagnosis, severity indicators, and prescribed medications.",
    icon: "🩺",
    gradient: "from-rose-500 to-pink-600"
  },
  {
    title: "Nearest Doctor Finder",
    desc: "Real-time location tracking finds the closest hospitals, doctors and pharmacies using Google Maps integration.",
    icon: "📍",
    gradient: "from-emerald-500 to-green-600"
  },
];

export const PROBLEM_STATEMENT = `India faces a critical shortage of accessible, verified medical advice. With a doctor-to-patient ratio of 1:1456, 
millions lack timely healthcare. Self-medication and misinformation lead to adverse health outcomes. Medical data privacy remains a major concern 
with frequent data breaches in healthcare systems.`;

export const OBJECTIVES = [
  "Provide free, AI-driven medical consultation accessible to every Indian citizen",
  "Ensure medication safety through verified Indian pharmacy cross-referencing",
  "Protect patient privacy with AES-256-GCM encryption and tamper-evident hash chains",
  "Offer generic low-cost medicine alternatives to reduce healthcare costs",
  "Enable intelligent report analysis to simplify complex medical terminology",
  "Connect patients with nearest healthcare facilities using real-time GPS"
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Secure Profile",
    desc: "Sign up with Google or Email. Your data is encrypted with military-grade AES-256 encryption.",
    icon: "🔐"
  },
  {
    step: "02",
    title: "Describe Your Concern",
    desc: "Chat naturally, upload reports, or use the interactive symptom checker to explain your health issue.",
    icon: "💬"
  },
  {
    step: "03",
    title: "Get AI Medical Guidance",
    desc: "Receive verified medications, home remedies, and doctor recommendations — all personalized for you.",
    icon: "✅"
  }
];

export const TEAM_INFO = {
  university: "Medical AI Research",
  department: "Computer Science & Engineering",
  tagline: "Built for patients, powered by AI, secured by hash-ledger protocol"
};
