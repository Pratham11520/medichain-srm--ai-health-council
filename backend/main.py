"""
MediChain SRM API — FastAPI Backend (Production v5.0)
Parallel LLM Consensus: Gemini + OpenRouter (parallel) → Ollama → HuggingFace → Fallback
254,000+ Indian Medicine Database | OpenFDA enrichment | Rate-Limited | Health-Checked
Blockchain-audited — every API call is logged into a tamper-evident hash chain.
Per-user encrypted data storage with JWT authentication.
"""

from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import re
import time
import uuid
import logging
import io
from dotenv import load_dotenv
from data.medicines import search_medicine, verify_medicine, get_medicine_context_for_ai, get_db_stats
from services.llm_council import ask_llm_council, get_council_status
from services.medical_enrichment import build_enrichment_context
from user_store import (
    verify_google_token, create_jwt, verify_jwt,
    save_user_data, load_user_data, load_all_user_data,
    delete_user_data, get_storage_stats,
)
from services.blockchain import secure_ledger

load_dotenv()

# ========================
# Logging Setup
# ========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("medichain")

# ========================
# Rate Limiter
# ========================
limiter = Limiter(key_func=get_remote_address)

# ========================
# App Setup
# ========================
app = FastAPI(
    title="MediChain SRM API",
    description="AI-Powered Indian Medical Assistant — Multi-LLM Council with 254k+ Medicine Database & Blockchain Audit",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ========================
# CORS — Restrict to known origins
# ========================
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:3000,http://localhost")
if raw_origins.strip() == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ========================
# Request ID Middleware
# ========================
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 1)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration}ms"
    logger.info(f"[{request_id}] {request.method} {request.url.path} → {response.status_code} ({duration}ms)")
    return response

# ========================
# System Prompt
# ========================
SYSTEM_PROMPT = """You are MediBot, the AI Medical Council assistant for MediChain SRM — an Indian health platform.
You are powered by a verified database of 254,000+ Indian medicines and enriched with OpenFDA drug data.
All responses are blockchain-audited for tamper-evident medical record integrity.

CRITICAL ACCURACY RULES (you MUST follow every single one):
1. You are ONLY a medical assistant. NEVER discuss anything unrelated to health, medicine, or wellness.
2. NEVER output promotional content or advertisements.
3. NEVER start your response with greetings like "Hello", "Hi", "I'm doing well" etc. — go directly to the clinical response.
4. ALWAYS respond in structured markdown with headers (##) and tables where applicable.
5. ONLY recommend medicines from the provided VERIFIED DATABASE CONTEXT below. If a medicine is NOT in the database, clearly mark it as ⚠️ UNVERIFIED.
6. For EVERY medicine you recommend, include: Drug name (generic + brand), Dose, Frequency, Duration, Price ₹ (from database ONLY — NEVER invent prices), Side effects.
7. ALWAYS include a generic low-cost alternative for every branded medicine with exact price savings.
8. Mention that medicines can be purchased from 1mg.com, Apollo Pharmacy, or Netmeds for verification and ordering.
9. Classify urgency: 🟢 Self-manageable at home | 🟡 Doctor within 48h | 🔴 EMERGENCY — go NOW.
10. ALWAYS end with: "⚕️ Disclaimer: AI-assisted guidance only. Consult a qualified MBBS/MD doctor before taking any medication."
11. Be empathetic, precise, and medically rigorous. The patient may be anxious.
12. If and only if a question is completely non-medical, reply: "I can only assist with medical and health questions."
13. NEVER hallucinate drug names or prices. If unsure, say "Please verify this medicine on 1mg.com or Apollo Pharmacy."
14. Include Indian home remedies (haldi milk, tulsi, jeera water, etc.) alongside medical advice.

Output Format (use this structure for clinical questions):
## 🩺 Assessment
## 📊 Possible Diagnoses
## 💊 Recommended Medicines (from Verified Indian Database)
| Type | Brand Name (India) | Generic Alternative | Dosage | Price ₹ | Available On |
|---|---|---|---|---|---|
## 🌿 Home Remedies & Indian Lifestyle Tips
## 🚨 Red Flags — Emergency Signs
## 🗓️ Urgency
## 🛒 Where to Buy
Verify and purchase medicines from: 1mg.com | Apollo Pharmacy | Netmeds | PharmEasy
⚕️ Disclaimer"""


# ========================
# Request Models (with validation)
# ========================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=2000, description="Patient's health query")
    history: List[str] = Field(default=[], max_items=20)
    user_context: str = Field(default="", max_length=1000)

    @validator("message")
    def sanitize_message(cls, v):
        # Strip potential prompt injection attempts
        v = v.strip()
        forbidden = ["ignore previous", "forget instructions", "you are now", "jailbreak"]
        for f in forbidden:
            if f in v.lower():
                raise ValueError("Message contains forbidden content")
        return v


class SymptomRequest(BaseModel):
    symptoms: dict = Field(..., description="Symptom key-value pairs from the form")
    user_context: str = Field(default="", max_length=1000)


class ReportRequest(BaseModel):
    file_content: str = Field(..., min_length=10, max_length=50000, description="Text content of medical report")
    file_type: str = Field(..., description="Type of report: blood, xray, urine, etc.")
    user_context: str = Field(default="", max_length=1000)


class DrugInteractionRequest(BaseModel):
    medicines: List[str] = Field(..., min_items=2, max_items=10, description="List of medicine names to check interactions for")
    user_context: str = Field(default="", max_length=500)


# ========================
# Health Check
# ========================

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint for Docker and load balancer."""
    return {
        "status": "ok",
        "version": "4.0.0",
        "service": "MediChain SRM API",
        "blockchain_blocks": len(secure_ledger.chain),
        "blockchain_valid": secure_ledger.is_valid(),
        "timestamp": int(time.time()),
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "🏥 MediChain SRM API v4.0 — AI Health Council (Blockchain-Audited)",
        "docs": "/docs",
        "health": "/health",
        "blockchain": "/api/blockchain/status",
    }


# ========================
# AI Endpoints (Rate-Limited)
# ========================

RATE_LIMIT = os.getenv("RATE_LIMIT_PER_MINUTE", "15")

@app.post("/api/chat", tags=["AI"])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def chat_endpoint(request: Request, body: ChatRequest):
    """Main MediBot chat — multi-LLM council with medicine database + OpenFDA enrichment."""
    try:
        # 1. Local medicine DB context (instant)
        medicine_context = get_medicine_context_for_ai(body.message, max_results=6)

        # 2. Extract likely medicine names from message for online enrichment
        med_words = re.findall(r'\b[A-Za-z][a-z]{3,}(?:\s+[A-Za-z][a-z]{3,})?\b', body.message)
        enrichment = await build_enrichment_context(body.message, med_words[:4])

        prompt_parts = [
            SYSTEM_PROMPT,
            f"\n=== PATIENT PROFILE ===\n{body.user_context}" if body.user_context else "",
            f"\n=== VERIFIED INDIAN MEDICINE DATABASE ===\n{medicine_context}" if medicine_context else "",
            enrichment if enrichment else "",
        ]
        if body.history:
            history_text = "\n".join(body.history[-8:])
            prompt_parts.append(f"\n=== CONVERSATION HISTORY ===\n{history_text}")
        prompt_parts.append(f"\n=== PATIENT QUERY ===\n{body.message}")

        full_prompt = "\n".join(p for p in prompt_parts if p)
        result = await ask_llm_council(full_prompt)

        # Blockchain audit — log this consultation (never crash if audit fails)
        try:
            msg_hash = str(hash(body.message))[:16]
            secure_ledger.add_block(f"CHAT:{msg_hash}:{result['provider']}:{len(result['text'])}")
        except Exception as audit_err:
            logger.warning(f"Blockchain audit failed (non-fatal): {audit_err}")

        # Cross-verify medicines in response against DB
        verified_count = 0
        med_words = re.findall(r'\b[A-Z][a-z]{2,}(?:\s+[A-Z]?[a-z]+)?\b', result["text"])
        for word in med_words[:10]:
            v = verify_medicine(word)
            if v and v.get("verified"):
                verified_count += 1

        logger.info(f"Chat response via provider={result['provider']} confidence={result.get('confidence')} quality={result.get('quality_score')} verified_meds={verified_count}")
        return {
            "text": result["text"],
            "provider": result["provider"],
            "confidence": result.get("confidence", "unknown"),
            "quality_score": result.get("quality_score", 0),
            "providers_consulted": result.get("providers_consulted", []),
            "response_id": result.get("response_id", ""),
            "verified_medicines": verified_count,
            "blockchain_block": len(secure_ledger.chain),
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Chat endpoint error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"AI Council error: {str(e)[:200]}")


@app.post("/api/analyze-symptoms", tags=["AI"])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def analyze_symptoms(request: Request, body: SymptomRequest):
    """Structured symptom analysis with urgency classification."""
    try:
        symptom_text = " ".join(str(v) for v in body.symptoms.values() if v)
        if len(symptom_text.strip()) < 5:
            raise HTTPException(status_code=422, detail="Please provide more symptom details.")
        medicine_context = get_medicine_context_for_ai(symptom_text, max_results=8)

        prompt = f"""{SYSTEM_PROMPT}

Analyze these symptoms for an Indian patient and provide a STRUCTURED clinical assessment:

Patient Symptoms: {body.symptoms}
Patient Context: {body.user_context}

{medicine_context if medicine_context else ''}

Provide your assessment in this exact structure:

## 🩺 Preliminary Assessment
Brief overview of likely condition(s).

## 📊 Potential Diagnoses (Ranked by Likelihood)
1. **[Most Likely]** — Rationale
2. **[Possible]** — Rationale
3. **[Less Likely]** — Rationale

## 💊 Suggested Medicines (From Verified Indian Database)
For each medicine:
- **Name (Generic / Brand)** — Dosage | Price ₹ | Duration
- Side effects to watch for

## 🌿 Evidence-Based Home Remedies
Practical, safe home care steps.

## 🚨 Red Flags — Seek Emergency Care If:
List specific warning signs that need immediate hospital visit.

## 🗓️ Urgency Level
🟢 Self-Manageable / 🟡 Doctor within 48h / 🔴 Emergency NOW

⚕️ Disclaimer: Consult a qualified doctor before taking any medication.
"""
        result = await ask_llm_council(prompt)
        try:
            sym_hash = str(hash(str(body.symptoms)))[:16]
            secure_ledger.add_block(f"SYMPTOMS:{sym_hash}:{result['provider']}")
        except Exception as audit_err:
            logger.warning(f"Blockchain audit failed (non-fatal): {audit_err}")
        return {
            "text": result["text"],
            "provider": result["provider"],
            "confidence": result.get("confidence", "unknown"),
            "quality_score": result.get("quality_score", 0),
            "providers_consulted": result.get("providers_consulted", []),
            "response_id": result.get("response_id", ""),
            "blockchain_block": len(secure_ledger.chain),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Symptom analysis error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)[:200]}")


@app.post("/api/analyze-report-file", tags=["AI"])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def analyze_report_file(request: Request, file: UploadFile = File(...), user_context: str = Form(default="")):
    """
    Upload a PDF medical report. The API auto-extracts text with pdfplumber,
    auto-detects the report type using the LLM, then runs full clinical analysis.
    No manual type selection needed.
    """
    if not file.filename:
        raise HTTPException(status_code=422, detail="No file provided.")

    # Validate file type
    allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {file.content_type}. Upload PDF, JPG, or PNG.")

    if file.size and file.size > 15 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large. Maximum 15 MB.")

    content = await file.read()
    extracted_text = ""
    extraction_method = ""

    # ── PDF text extraction with pdfplumber ─────────────────────────────
    if file.content_type == "application/pdf":
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pages_text = []
                for i, page in enumerate(pdf.pages[:12]):  # max 12 pages
                    text = page.extract_text() or ""
                    if text.strip():
                        pages_text.append(f"[Page {i+1}]\n{text}")
                extracted_text = "\n\n".join(pages_text)
                extraction_method = f"pdfplumber ({len(pdf.pages)} pages)"

            if len(extracted_text.strip()) < 30:
                extracted_text = f"[PDF: {file.filename}] — Scanned/image-based PDF detected. No text could be extracted. Please describe the key values below."
                extraction_method = "scanned-pdf-fallback"
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
            extracted_text = f"[PDF: {file.filename}] — Text extraction failed ({str(e)[:100]}). Please type key values in the text field."
            extraction_method = "extraction-failed"

    else:
        # For images, we note the file and ask AI to analyze contextually
        extracted_text = f"[Medical Report Image: {file.filename}, {file.content_type}, {len(content)//1024}KB] — Please analyze based on the patient description and medical context."
        extraction_method = "image-contextual"

    # ── Step 1: Auto-detect report type using quick LLM call ────────────
    DETECT_PROMPT = f"""
You are a medical report classifier. Given this text from a medical document, identify the report type.

Document text (first 800 chars):
{extracted_text[:800]}

Respond with ONLY one of these exact labels (nothing else):
Blood Test / CBC
Urine Analysis  
Lipid Profile
Liver Function Test (LFT)
Kidney Function Test (KFT)
Thyroid Panel
HbA1c / Diabetes Panel
ECG Report
X-Ray / Radiology Report
MRI / CT Scan Report
Complete Metabolic Panel
Cardiac Markers
General Medical Report

Report type:"""

    try:
        detect_result = await ask_llm_council(DETECT_PROMPT)
        detected_type = detect_result["text"].strip().split("\n")[0].strip()
        # Sanitize — take only the first line, max 60 chars
        detected_type = detected_type[:60]
        # Remove any markdown or extra content
        detected_type = re.sub(r'[\*\_\#]', '', detected_type).strip()
        logger.info(f"Auto-detected report type: '{detected_type}'")
    except Exception as e:
        logger.warning(f"Report type detection failed: {e}")
        detected_type = "General Medical Report"

    # ── Step 2: Full clinical analysis ──────────────────────────────────
    local_db = get_medicine_context_for_ai(extracted_text[:300], max_results=5)
    report_words = re.findall(r'\b[A-Za-z][a-z]{3,}\b', extracted_text)
    try:
        enrichment = await build_enrichment_context(extracted_text, report_words[:3])
    except Exception:
        enrichment = ""

    analysis_prompt = f"""{SYSTEM_PROMPT}

You are interpreting a **{detected_type}** medical report for an Indian patient.
This report type was AUTO-DETECTED from the document content.

Patient Context: {user_context or 'Not specified'}
Extraction Method: {extraction_method}

=== FULL REPORT TEXT ===
{extracted_text[:8000]}

{"=== VERIFIED INDIAN MEDICINE DATABASE ===" + chr(10) + local_db if local_db else ""}
{enrichment if enrichment else ""}

Provide a COMPREHENSIVE clinical interpretation using EXACTLY this structure:

## 🯠 Auto-Detected Report Type: {detected_type}

## 📋 What This Report Measures
Briefly explain what a {detected_type} tests and why doctors order it.

## 🔍 Complete Parameter Analysis

| Parameter | Your Value | Normal Range (Indian Adult) | Status | Clinical Significance |
|-----------|-----------|----------------------------|--------|-----------------------|

(Extract EVERY testable value from the report. Use ✅ Normal / ⚠️ Borderline / 🔴 Abnormal for Status)

## ✅ Parameters Within Normal Range
Briefly note healthy findings to reassure the patient.

## ⚠️ Abnormal Values — Patient-Friendly Explanations
For each out-of-range value, explain:
- **[Parameter Name]**: Your value is [X]. Normal is [Y]. In simple terms, this means...
- Most likely cause in Indian population
- Whether this is urgent or can wait for a routine appointment

## 💊 Recommended Treatment & Medicines
Based on abnormal findings, recommend from verified Indian medicine database:
| Medicine / Supplement | Dose | Brand (India) | Price ₹ | Duration | Purpose |
|----------------------|------|--------------|---------|----------|---------|

## 👍 Pros of These Values / Healthy Signs
Positive findings worth noting.

## 👎 Cons / What Needs Attention
Findings that need lifestyle changes or medical follow-up.

## 🌿 Home Remedies & Lifestyle for Indian Patients
5 specific, evidence-based lifestyle recommendations:
1. Diet: (Indian food-specific suggestions)
2. Exercise: (specific, measurable)
3. Sleep/Stress:
4. Supplements:
5. Monitoring:

## 🚨 Urgent Values Requiring Immediate Medical Attention
Values that need same-day or ER visit.

## 🗓️ Follow-up Plan
| Action | Timeline | Specialist |
|--------|----------|------------|

⚕️ Disclaimer: This AI interpretation is generated from extracted text and must be reviewed by your treating physician. Never self-medicate based solely on AI output.
"""

    result = await ask_llm_council(analysis_prompt)
    try:
        secure_ledger.add_block(f"REPORT_FILE:{file.filename}:{detected_type}:{result['provider']}")
    except Exception as audit_err:
        logger.warning(f"Blockchain audit failed (non-fatal): {audit_err}")
    return {
        "text": result["text"],
        "provider": result["provider"],
        "confidence": result.get("confidence", "unknown"),
        "quality_score": result.get("quality_score", 0),
        "providers_consulted": result.get("providers_consulted", []),
        "response_id": result.get("response_id", ""),
        "detected_type": detected_type,
        "extraction_method": extraction_method,
        "chars_extracted": len(extracted_text),
        "blockchain_block": len(secure_ledger.chain),
    }
@app.post("/api/analyze-report", tags=["AI"])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def analyze_report(request: Request, body: ReportRequest):
    """Medical report interpretation with OpenFDA enrichment for flagged parameters."""
    try:
        # Extract potential drug/parameter names from report for enrichment
        report_words = re.findall(r'\b[A-Za-z][a-z]{3,}\b', body.file_content)
        enrichment = await build_enrichment_context(body.file_content, report_words[:3])
        local_db = get_medicine_context_for_ai(body.file_content[:200], max_results=4)

        prompt = f"""{SYSTEM_PROMPT}

You are interpreting a **{body.file_type.upper()}** medical report for an Indian patient.

Patient Context: {body.user_context or 'Not specified'}

=== FULL REPORT TEXT ===
{body.file_content}

{"=== VERIFIED INDIAN MEDICINE DATABASE ===" + chr(10) + local_db if local_db else ""}
{enrichment if enrichment else ""}

Provide a COMPREHENSIVE clinical interpretation using EXACTLY this structure. DO NOT SKIP ANY SECTIONS. You MUST explain what is low/high and how to cure it natively if possible.

## 🯠 Report Type: {body.file_type.upper()}

## 📋 What This Report Measures
Briefly explain what this tests and why doctors order it.

## 🔍 Complete Parameter Analysis

| Parameter | Your Value | Normal Range (Indian Adult) | Status | Clinical Significance |
|-----------|-----------|----------------------------|--------|-----------------------|

(Extract EVERY testable value from the report. Use ✅ Normal / ⚠️ Borderline / 🔴 Abnormal for Status)

## ✅ Parameters Within Normal Range
Briefly note healthy findings to reassure the patient.

## ⚠️ Abnormal Values — Patient-Friendly Explanations
For EVERY out-of-range value, you MUST explain:
- **[Parameter Name]**: Your value is [X]. Normal is [Y]. In simple terms, this means...
- Most likely cause in Indian population (why is it high/low?)
- Whether this is urgent or can wait for a routine appointment

## 💊 Recommended Treatment & Medicines
Based on abnormal findings, recommend from verified Indian medicine database:
| Medicine / Supplement | Dose | Brand (India) | Price ₹ | Duration | Purpose |
|----------------------|------|--------------|---------|----------|---------|

## 👍 Pros of These Values / Healthy Signs
Positive findings worth noting.

## 👎 Cons / What Needs Attention
Findings that need lifestyle changes or medical follow-up.

## 🌿 Home Remedies & Lifestyle for Indian Patients
How to cure or manage the abnormal values natively. Give 5 specific, evidence-based lifestyle recommendations:
1. Diet: (Indian food-specific suggestions)
2. Exercise: (specific, measurable)
3. Sleep/Stress:
4. Supplements:
5. Monitoring:

## 🚨 Urgent Values Requiring Immediate Medical Attention
Values that need same-day or ER visit.

## 🗓️ Follow-up Plan
| Action | Timeline | Specialist |
|--------|----------|------------|

⚕️ Disclaimer: This AI interpretation is generated from extracted text and must be reviewed by your treating physician. Never self-medicate based solely on AI output.
"""
        result = await ask_llm_council(prompt)
        try:
            secure_ledger.add_block(f"REPORT:{str(hash(body.file_content))[:16]}:{result['provider']}")
        except Exception as audit_err:
            logger.warning(f"Blockchain audit failed (non-fatal): {audit_err}")
        return {
            "text": result["text"],
            "provider": result["provider"],
            "confidence": result.get("confidence", "unknown"),
            "quality_score": result.get("quality_score", 0),
            "providers_consulted": result.get("providers_consulted", []),
            "response_id": result.get("response_id", ""),
            "blockchain_block": len(secure_ledger.chain),
        }
    except Exception as e:
        logger.error(f"Report analysis error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Report analysis error: {str(e)[:200]}")


@app.post("/api/drug-interactions", tags=["AI"])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def check_drug_interactions(request: Request, body: DrugInteractionRequest):
    """Check for potential dangerous drug interactions between multiple medicines."""
    try:
        med_list = ", ".join(body.medicines)
        all_context = []
        for med in body.medicines:
            ctx = get_medicine_context_for_ai(med, max_results=2)
            if ctx:
                all_context.append(ctx)

        prompt = f"""{SYSTEM_PROMPT}

A patient is taking or considering these medicines together:
**{med_list}**

Patient Context: {body.user_context}

{"Verified Database Info:\n" + chr(10).join(all_context) if all_context else ""}

Provide a DRUG INTERACTION ANALYSIS:

## ⚗️ Medicines Being Checked
List each medicine with its class and primary use.

## 🔴 Dangerous Interactions (AVOID)
Combinations that must NOT be taken together. Explain the mechanism.

## 🟡 Moderate Interactions (Use with Caution)
Combinations possible but requiring monitoring or dose adjustment.

## 🟢 Safe Combinations
Pairs that are generally safe to use together.

## 💡 Alternatives to Consider
If any dangerous interaction found, suggest safer alternatives from Indian formulary.

## 📋 Monitoring Required
What symptoms/tests to watch for if continuing these medicines.

⚕️ Disclaimer: Always inform your doctor about ALL medicines you are taking.
"""
        result = await ask_llm_council(prompt)
        try:
            secure_ledger.add_block(f"DRUG_INTERACTION:{':'.join(body.medicines[:3])}:{result['provider']}")
        except Exception as audit_err:
            logger.warning(f"Blockchain audit failed (non-fatal): {audit_err}")
        return {
            "medicines_checked": body.medicines,
            "text": result["text"],
            "provider": result["provider"],
            "confidence": result.get("confidence", "unknown"),
            "quality_score": result.get("quality_score", 0),
            "providers_consulted": result.get("providers_consulted", []),
            "response_id": result.get("response_id", ""),
            "blockchain_block": len(secure_ledger.chain),
        }
    except Exception as e:
        logger.error(f"Drug interaction error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Interaction check error: {str(e)[:200]}")


# ========================
# LLM Council Status
# ========================

@app.get("/api/llm/status", tags=["System"])
async def llm_status():
    """Check which LLM providers are currently available."""
    return await get_council_status()


# ========================
# Blockchain Audit Endpoints
# ========================

@app.get("/api/blockchain/status", tags=["Blockchain"])
async def blockchain_status():
    """Get blockchain audit chain status — tamper-evident record integrity."""
    return {
        "chain_length": len(secure_ledger.chain),
        "is_valid": secure_ledger.is_valid(),
        "latest_block": secure_ledger.get_latest_block().model_dump() if secure_ledger.chain else None,
        "genesis_hash": secure_ledger.chain[0].hash if secure_ledger.chain else None,
        "algorithm": "SHA-256",
        "encryption": "AES-256-GCM",
    }

@app.get("/api/blockchain/chain", tags=["Blockchain"])
async def blockchain_chain():
    """Export full blockchain audit chain for verification."""
    return {
        "chain": [block.model_dump() for block in secure_ledger.chain],
        "total_blocks": len(secure_ledger.chain),
        "is_valid": secure_ledger.is_valid(),
    }


# ========================
# Medicine Database Endpoints
# ========================

@app.get("/api/medicines/search", tags=["Medicines"])
async def search_medicines_endpoint(
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results"),
):
    """Search the 254k+ Indian medicines database by name, salt, class, or use-case."""
    results = search_medicine(q, limit=limit)
    return {"query": q, "count": len(results), "results": results}


@app.get("/api/medicines/verify", tags=["Medicines"])
async def verify_medicine_endpoint(
    name: str = Query(..., min_length=2, max_length=200, description="Medicine name to verify"),
):
    """Verify a specific medicine and get its full pharmacological profile."""
    result = verify_medicine(name)
    return result


@app.get("/api/medicines/stats", tags=["Medicines"])
async def medicine_stats():
    """Get Indian medicines database statistics."""
    return get_db_stats()


# ========================
# Authentication Endpoints
# ========================

class GoogleAuthRequest(BaseModel):
    id_token: str

class EmailLoginRequest(BaseModel):
    email: str
    name: str = ""

class UserDataSaveRequest(BaseModel):
    data_type: str
    encrypted_data: str


@app.post("/api/auth/google", tags=["Auth"])
async def auth_google(body: GoogleAuthRequest):
    """Verify Google ID token and issue a JWT session token."""
    user_info = await verify_google_token(body.id_token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    token = create_jwt(user_info["email"], user_info.get("name", ""), user_info.get("picture", ""))
    try:
        secure_ledger.add_block(f"AUTH:GOOGLE:{user_info['email'][:20]}:{int(time.time())}")
    except Exception:
        pass

    logger.info(f"Google auth success: {user_info['email'][:30]}")
    return {
        "token": token,
        "user": user_info,
        "status": "authenticated",
    }


@app.post("/api/auth/email-login", tags=["Auth"])
async def auth_email(body: EmailLoginRequest):
    """Simple email-based login (for demo/dev). Issues JWT without OTP verification."""
    if not body.email or '@' not in body.email:
        raise HTTPException(status_code=422, detail="Invalid email")

    token = create_jwt(body.email, body.name or body.email.split('@')[0])
    try:
        secure_ledger.add_block(f"AUTH:EMAIL:{body.email[:20]}:{int(time.time())}")
    except Exception:
        pass

    return {
        "token": token,
        "user": {"email": body.email, "name": body.name or body.email.split('@')[0]},
        "status": "authenticated",
    }


def _extract_jwt_user(request: Request) -> dict:
    """Extract and verify JWT from Authorization header."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    payload = verify_jwt(auth[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


@app.post("/api/user/data", tags=["User Data"])
async def save_data(request: Request, body: UserDataSaveRequest):
    """Save encrypted user data. Backend stores encrypted blob — zero knowledge."""
    user = _extract_jwt_user(request)
    result = save_user_data(user["email"], body.data_type, body.encrypted_data)
    try:
        secure_ledger.add_block(f"DATA_SAVE:{user['email'][:15]}:{body.data_type}")
    except Exception:
        pass
    return result


@app.get("/api/user/data", tags=["User Data"])
async def load_data(request: Request, data_type: str = Query(default="")):
    """Load encrypted user data. Returns encrypted blob for client-side decryption."""
    user = _extract_jwt_user(request)
    if data_type:
        blob = load_user_data(user["email"], data_type)
        if blob is None:
            return {"data_type": data_type, "data": None, "found": False}
        return {"data_type": data_type, "data": blob, "found": True}
    else:
        all_data = load_all_user_data(user["email"])
        return {"data": all_data, "data_types": list(all_data.keys())}


@app.delete("/api/user/data", tags=["User Data"])
async def delete_data(request: Request):
    """Delete all user data (GDPR compliance)."""
    user = _extract_jwt_user(request)
    result = delete_user_data(user["email"])
    try:
        secure_ledger.add_block(f"DATA_DELETE:{user['email'][:15]}:{int(time.time())}")
    except Exception:
        pass
    return result


@app.get("/api/storage/stats", tags=["System"])
async def storage_stats():
    """Get storage statistics."""
    return get_storage_stats()


# ========================
# Error Handlers
# ========================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"error": "Endpoint not found", "path": str(request.url.path)})


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal Server Error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error. The AI Council is available as fallback."})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=2)
