# PROJECT SYNOPSIS

## 8th Semester — Major Project

---

## 1. Project Title

**MediChain SRM — AI Health Council**
*A Multi-LLM, Hash-Ledger-Secured AI Medical Assistant with 254,000+ Indian Medicine Database*

---

## 2. Group Details

| Sr. No | Name | Enrolment No. | Branch / Semester | Mobile | College Email |
|--------|------|---------------|-------------------|--------|---------------|
| 1 | Pratham Rajesh Nagpal | _______________ | CSE / 8th | _____________ | ____________@srmist.edu.in |
| 2 | _______________ | _______________ | CSE / 8th | _____________ | ____________@srmist.edu.in |
| 3 | _______________ | _______________ | CSE / 8th | _____________ | ____________@srmist.edu.in |
| 4 | _______________ | _______________ | CSE / 8th | _____________ | ____________@srmist.edu.in |

**University:** SRM Institute of Science and Technology  
**Department:** Computer Science & Engineering  
**Guide/Mentor:** _______________

---

## 3. Problem Statement

India faces a critical shortage of healthcare infrastructure, with only 1 doctor per 1,456 citizens (WHO recommends 1:1,000). Rural and semi-urban populations often lack access to qualified medical practitioners, leading to:

- **Self-medication without verification** — patients consume medicines without knowing contraindications, side effects, or safer generic alternatives.
- **Over-reliance on expensive branded drugs** — affordable generic equivalents are often unknown to patients.
- **Inaccessible medical terminology** — lab reports and prescriptions use clinical language that patients cannot interpret.
- **Data privacy concerns** — existing health apps transmit sensitive medical data to third-party servers without adequate encryption.
- **Single-point-of-failure AI systems** — most medical chatbots depend on a single LLM provider; when the API goes down or quota expires, the entire system becomes unusable.

There is a need for a **free, AI-powered, privacy-preserving medical assistant** that provides verified Indian-context health guidance, never goes offline, and empowers patients with actionable medicine information.

---

## 4. Objectives and Scope

### 4.1 Objectives

1. Develop a multi-LLM AI medical assistant that cascades through Google Gemini, GPT (via g4f), Ollama (local), and a hardcoded medical fallback — ensuring **zero downtime**.
2. Integrate a **254,000+ Indian medicines database** (enriched CSV) with search, verification, and cross-referencing of generic/branded alternatives with pricing.
3. Implement **tamper-evident hash-ledger security** (SHA-256 chain + AES-256-GCM encryption) to protect patient data integrity at the client level.
4. Provide **symptom analysis**, **medical report interpretation**, and **real-time medicine verification** within a single unified interface.
5. Build a responsive, premium web interface accessible on mobile and desktop browsers.

### 4.2 Scope

- **Target Users:** Indian citizens seeking preliminary medical guidance, medicine information, or report interpretation.
- **Coverage:** 254,022 Indian medicines across 8 drug classes, 7,649 manufacturers, including salt composition, dosage, side effects, contraindications, and MRP.
- **Limitations:** The system provides AI-assisted guidance only — it is **not a substitute** for professional medical consultation. The hash ledger is a prototype-level simulation, not a production distributed blockchain.

---

## 5. Methodology

### 5.1 System Architecture

The project follows a **client-server architecture** with a React (TypeScript) frontend and a Python (FastAPI) backend.

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)         │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │ MediBot  │ │ Symptom  │ │ Report │ │   Ledger     │  │
│  │  Chat    │ │ Analyzer │ │ Reader │ │  Explorer    │  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──────┬───────┘  │
│       │             │           │              │          │
│  ┌────┴─────────────┴───────────┴──────────────┴───────┐ │
│  │        Hash Ledger Service (AES-256 + SHA-256)      │ │
│  └─────────────────────┬───────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────┼─────────────────────────────────┐
│                    BACKEND (FastAPI + Python)             │
│  ┌─────────────────────┴───────────────────────────────┐ │
│  │               LLM Council (Multi-Provider)          │ │
│  │  ┌─────────┐  ┌──────┐  ┌────────┐  ┌──────────┐   │ │
│  │  │ Gemini  │→ │ g4f  │→ │ Ollama │→ │ Fallback │   │ │
│  │  │ 2.0     │  │ GPT  │  │ Local  │  │ Medical  │   │ │
│  │  └─────────┘  └──────┘  └────────┘  └──────────┘   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │   Indian Medicines Database (254,022 records, CSV)  │ │
│  │   pandas — search, verify, context injection        │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow Diagram (DFD — Level 1)

```
                    ┌──────────────┐
                    │   Patient    │
                    └──────┬───────┘
                           │ (Symptoms / Query / Report)
                    ┌──────▼───────┐
                    │   Frontend   │──── Encrypt + Hash ──→ Local Ledger
                    └──────┬───────┘
                           │ REST API
                    ┌──────▼───────┐
                    │   Backend    │
                    └──┬───┬───┬───┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ LLM Council│ │  Medicine  │ │   Report   │
     │ (AI Reply) │ │  Database  │ │  Analyzer  │
     └────────────┘ └────────────┘ └────────────┘
            │              │              │
            └──────────────┴──────────────┘
                           │
                    ┌──────▼───────┐
                    │  Response    │ → Patient
                    └──────────────┘
```

### 5.3 LLM Council — Cascading Multi-Provider Strategy

The system does **not** depend on any single AI provider. The LLM Council tries providers in priority order:

| Priority | Provider | Cost | Requires |
|----------|----------|------|----------|
| 1 | Google Gemini 2.0 Flash | Free (quota-limited) | API Key |
| 2 | g4f (GPT-4o-mini) | Free (no key) | Internet |
| 3 | Ollama (local LLM) | Free (offline) | Ollama installed |
| 4 | Medical Fallback | Free (always works) | Nothing |

If Provider 1 fails (quota exceeded, network error), the system automatically tries Provider 2, then 3, then 4. The **hardcoded medical fallback** ensures the system **never returns an error** — it always provides at least basic symptom guidance and emergency contact information.

### 5.4 Security — Hash Ledger (Prototype)

Every user action (login, chat message, profile save) is recorded as a **block** in a client-side hash chain:

```
Block 0 (Genesis)          Block 1                    Block 2
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ index: 0         │      │ index: 1         │      │ index: 2         │
│ data: "Genesis"  │      │ data: "USER_INIT"│      │ data: "CHAT:..." │
│ prevHash: "0"    │ ───→ │ prevHash: a3f8...│ ───→ │ prevHash: 7c2b...│
│ hash: a3f8...    │      │ hash: 7c2b...    │      │ hash: e91d...    │
│ timestamp: ...   │      │ timestamp: ...   │      │ timestamp: ...   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

- **Hashing:** SHA-256 (Web Crypto API)
- **Encryption:** AES-256-GCM (PBKDF2 key derivation, 100,000 iterations)
- **Tamper Detection:** If any block's data is modified, the chain validation fails — demonstrated live in the Ledger Explorer page.

---

## 6. Hardware & Software Requirements

### 6.1 Software

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React + TypeScript | 18.x |
| Styling | Vanilla CSS + Framer Motion | — |
| Build Tool | Vite | 6.x |
| Backend | Python + FastAPI | 3.12 / 0.109 |
| Database | pandas (CSV-based) | ≥ 2.1 |
| AI — Cloud | Google Gemini (google-generativeai) | ≥ 0.8 |
| AI — Free | g4f (GPT4Free) | ≥ 0.3 |
| AI — Local | Ollama | Latest |
| Encryption | Web Crypto API (AES-256-GCM) | Browser-native |
| Hashing | SHA-256 | Browser-native |
| Version Control | Git + GitHub | — |
| IDE | VS Code / Gemini Code Assist | — |
| OS | Windows 10/11, Linux, macOS | — |

### 6.2 Hardware (Minimum)

| Resource | Specification |
|----------|--------------|
| Processor | Intel i5 / Ryzen 5 or higher |
| RAM | 8 GB (16 GB recommended for Ollama) |
| Storage | 2 GB free disk space |
| Network | Internet connection (for cloud LLMs) |
| Browser | Chrome 90+, Firefox 90+, Edge 90+ |

---

## 7. Application and Future Scope

### 7.1 Current Applications

1. **Primary healthcare triage** — Preliminary symptom analysis for patients in rural/underserved areas before visiting a doctor.
2. **Medicine verification** — Patients can verify prescribed medicines, find cheaper generic alternatives, and check contraindications.
3. **Lab report interpretation** — Simplified explanation of complex medical terminology in reports.
4. **Medical education** — Students can explore the 254k+ medicine database for pharmacology studies.
5. **Data integrity demonstration** — The Ledger Explorer serves as an educational tool for understanding tamper-evident record chaining.

### 7.2 Future Scope

1. **Mobile Application** — Native Android/iOS apps using React Native for wider accessibility.
2. **Multi-language Support** — Hindi, Tamil, Telugu, and other regional Indian languages for broader reach.
3. **Real Blockchain Integration** — Migration from prototype hash ledger to Hyperledger Fabric or Ethereum L2 for actual distributed tamper-proof records.
4. **Doctor Dashboard** — Allow verified doctors to review AI-generated recommendations and provide corrections.
5. **IoT Integration** — Connect with wearable health devices (smartwatches, BP monitors) for real-time vitals monitoring.
6. **Government API Integration** — Connect with ABDM (Ayushman Bharat Digital Mission) for Ayushman Bharat Health Account (ABHA) compatibility.
7. **Offline-First Mode** — Full Ollama-based local AI for areas with limited internet connectivity.
8. **Drug Interaction Checker** — Cross-reference multiple medicines for potential dangerous interactions.

---

## 8. Project Timeline (Gantt Chart)

```
Phase                          │ Week 1-2 │ Week 3-4 │ Week 5-6 │ Week 7-8 │ Week 9-10│ Week 11-12│ Week 13-14│
───────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┼───────────┤
Requirements & Research        │ ████████ │          │          │          │          │           │           │
System Design & Architecture   │ ████████ │ ████████ │          │          │          │           │           │
Frontend UI Development        │          │ ████████ │ ████████ │ ████████ │          │           │           │
Backend API Development        │          │ ████████ │ ████████ │          │          │           │           │
Medicine DB Integration (CSV)  │          │          │ ████████ │ ████████ │          │           │           │
LLM Council (Multi-Provider)   │          │          │          │ ████████ │ ████████ │           │           │
Hash Ledger Security           │          │          │          │ ████████ │ ████████ │           │           │
Ledger Explorer Page           │          │          │          │          │ ████████ │           │           │
Testing & Bug Fixes            │          │          │          │          │ ████████ │ █████████ │           │
Documentation & Synopsis       │          │          │          │          │          │ █████████ │ █████████ │
Final Review & Presentation    │          │          │          │          │          │           │ █████████ │
```

---

## 9. Conclusion

**MediChain SRM — AI Health Council** addresses the critical gap in accessible, affordable healthcare guidance for Indian citizens. The key innovations of this project are:

1. **Multi-LLM Council Architecture** — Unlike conventional single-provider AI chatbots, our cascading provider system (Gemini → g4f → Ollama → Fallback) ensures **zero-downtime** operation. The system gracefully degrades rather than failing completely.

2. **Comprehensive Indian Medicine Database** — Integration of 254,022 verified Indian medicines with full pharmacological profiles — enabling patients to verify prescriptions, discover generic alternatives at lower costs, and understand contraindications.

3. **Tamper-Evident Data Integrity** — The client-side hash ledger (SHA-256 + AES-256-GCM) demonstrates the principle of blockchain-inspired immutable record-keeping. The interactive Ledger Explorer page allows users to visualize, validate, and even simulate tampering to understand how data integrity works.

4. **Privacy-First Design** — All patient data is encrypted and processed locally where possible, with no mandatory cloud storage of sensitive health information.

The system stands out from existing medical chatbots by combining AI-powered medical advice, a massive verified medicine database, multi-provider resilience, and cryptographic data security into a single, free-to-use, visually premium web application.

---

## 10. References / Bibliography

### Books
1. Grinberg, M. (2018). *Flask Web Development: Developing Web Applications with Python*, 2nd Edition. O'Reilly Media. (Chapters 1-7: Web application architecture)
2. Ramalho, L. (2022). *Fluent Python*, 2nd Edition. O'Reilly Media. (Chapters 17-21: Concurrency and async programming)
3. Banks, A., & Porcello, E. (2020). *Learning React*, 2nd Edition. O'Reilly Media. (Chapters 5-10: Hooks, state management)
4. Antonopoulos, A. M. (2017). *Mastering Bitcoin*, 2nd Edition. O'Reilly Media. (Chapters 7-9: Blockchain data structures and hashing)

### Research Papers
1. Agbo, C. C., Mahmoud, Q. H., & Eze, J. M. (2019). "Blockchain Technology in Healthcare: A Systematic Review." *Healthcare*, 7(2), 56. MDPI.
2. Kuo, T., Kim, H., & Ohno-Machado, L. (2017). "Blockchain distributed ledger technologies for biomedical and health care applications." *Journal of the American Medical Informatics Association*, 24(6), 1211-1220. Oxford Academic.
3. Vaswani, A., et al. (2017). "Attention Is All You Need." *Advances in Neural Information Processing Systems*, 30. (Foundation of transformer-based LLMs)
4. Touvron, H., et al. (2023). "LLaMA: Open and Efficient Foundation Language Models." *arXiv preprint arXiv:2302.13971*. Meta AI.

### Online Resources
1. Google AI for Developers — Gemini API Documentation: https://ai.google.dev/docs
2. FastAPI Official Documentation: https://fastapi.tiangolo.com/
3. React Official Documentation: https://react.dev/
4. Ollama — Run LLMs Locally: https://ollama.ai/
5. Indian Pharmacopoeia Commission: https://www.ipc.gov.in/
6. Central Drugs Standard Control Organisation (CDSCO): https://cdsco.gov.in/
7. GPT4Free (g4f) GitHub Repository: https://github.com/xtekky/gpt4free
8. Web Crypto API (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
9. Vite Build Tool: https://vitejs.dev/
10. Framer Motion Animation Library: https://www.framer.com/motion/

---

*Prepared by: MediChain SRM Team — Department of Computer Science & Engineering, SRM Institute of Science and Technology*
