"""
MediChain Medicine Database Service
Loads indian_medicines_enriched.csv (254k+ records) as a local verification database.
Provides fast search, lookup, and verification functions.
"""

import pandas as pd
import os
from typing import List, Optional, Dict, Any

# ------------------------------------
# Load CSV at module import (once)
# ------------------------------------
CSV_PATH = os.path.join(os.path.dirname(__file__), "indian_medicines_enriched.csv")

_df: Optional[pd.DataFrame] = None


def _get_db() -> pd.DataFrame:
    """Lazy-load the CSV into memory. Cached after first call."""
    global _df
    if _df is None:
        _df = pd.read_csv(CSV_PATH, dtype=str, na_values=[], keep_default_na=False)
        _df.columns = _df.columns.str.strip()
        # Normalize medicine_name for faster lookups
        _df["_name_lower"] = _df["medicine_name"].str.lower().str.strip()
    return _df


def search_medicine(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Search medicines by name, salt composition, drug class, or primary uses.
    Returns top `limit` matches as list of dicts.
    """
    db = _get_db()
    q = query.lower().strip()
    if not q:
        return []
    
    # Search across multiple columns
    mask = (
        db["_name_lower"].str.contains(q, na=False) |
        db["salt_composition"].str.lower().str.contains(q, na=False) |
        db["drug_class"].str.lower().str.contains(q, na=False) |
        db["primary_uses"].str.lower().str.contains(q, na=False)
    )
    
    results = db[mask].head(limit)
    
    # Return clean dicts (drop internal columns)
    return results.drop(columns=["_name_lower"], errors="ignore").to_dict(orient="records")


def verify_medicine(name: str) -> Optional[Dict[str, Any]]:
    """
    Verify a medicine by exact or close name match.
    Returns full medicine profile if found, None otherwise.
    """
    db = _get_db()
    q = name.lower().strip()
    
    # Try exact match first
    exact = db[db["_name_lower"] == q]
    if not exact.empty:
        row = exact.iloc[0].drop(labels=["_name_lower"], errors="ignore")
        return {
            "verified": True,
            "match_type": "exact",
            "medicine": row.to_dict()
        }
    
    # Try contains match
    partial = db[db["_name_lower"].str.contains(q, na=False)]
    if not partial.empty:
        row = partial.iloc[0].drop(labels=["_name_lower"], errors="ignore")
        return {
            "verified": True,
            "match_type": "partial",
            "medicine": row.to_dict()
        }
    
    return {
        "verified": False,
        "match_type": "none",
        "medicine": None
    }


def get_medicine_context_for_ai(query: str, max_results: int = 5) -> str:
    """
    Build a context string from matching medicines to inject into AI prompts.
    This gives the LLM real medicine data to cite rather than hallucinate.
    """
    results = search_medicine(query, limit=max_results)
    if not results:
        return ""
    
    lines = ["[VERIFIED INDIAN MEDICINES DATABASE — Matching records]:"]
    for med in results:
        name = med.get("medicine_name", "Unknown")
        salt = med.get("salt_composition", "unknown")
        uses = med.get("primary_uses", "unknown")
        dosage = med.get("dosage_adult", "unknown")
        price = med.get("price_inr", "N/A")
        form = med.get("dosage_form", "")
        contraindications = med.get("contraindications", "")
        side_effects = med.get("common_side_effects", "")
        
        lines.append(
            f"• {name} | Salt: {salt} | Uses: {uses} | "
            f"Dosage: {dosage} | Price: ₹{price} | Form: {form} | "
            f"Contraindications: {contraindications} | Side Effects: {side_effects}"
        )
    
    return "\n".join(lines)


def get_db_stats() -> Dict[str, Any]:
    """Return basic stats about the loaded medicine database."""
    db = _get_db()
    return {
        "total_medicines": len(db),
        "unique_drug_classes": db["drug_class"].nunique(),
        "unique_manufacturers": db["manufacturer"].nunique(),
    }
