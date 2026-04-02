import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "../App.css";
import "./css/Translationhub.css";
// import {  ArrowLeft,
//   Save, ArrowRight, Upload, FileText, CheckCircle2, Maximize2, BarChart3,
//   Minimize2, Users, Stethoscope, Edit3, Plus, X, Pill, Unlock, CheckCircle, TrendingUp, Languages, Loader2, Sparkles, Lock } from 'lucide-react';
import {
  ArrowLeft, Save, ArrowRight, Upload, FileText, CheckCircle2, Maximize2, BarChart3,
  Minimize2, Edit3, Unlock, CheckCircle, TrendingUp, Languages, Loader2, Sparkles, Lock,
  Globe, Shield, CheckCircle as CheckCircleIcon, Box, MessageSquare
} from 'lucide-react';
import { getProject, updateProjectMeta, markPhaseComplete, setP2DraftGenerated, computeProgress } from '../lib/progressStore';
import { usePhaseNavigation } from "./PhaseNav.jsx";

// --- Import the new component (Ensure file is created as TMLeverageOverview.jsx) ---
import TMLeverageOverview from "./TMLeverageOverview";



/* Sidebar phases (original list retained) */
// const SIDEBAR_PHASES = [
//   { id: 'P1', name: "Global Context Capture", sub: "Source content analysis", status: "done", iconClass: "icon-context" },
//   { id: 'P2', name: "Smart TM Translation", sub: "AI-powered translation", status: "active", iconClass: "icon-translation" },
//   { id: 'P3', name: "Cultural Intelligence", sub: "Cultural adaptation", status: "todo", iconClass: "icon-culture" },
//   { id: 'P4', name: "Regulatory Compliance", sub: "Compliance validation", status: "todo", iconClass: "icon-compliance" },
//   { id: 'P5', name: "Quality Intelligence", sub: "Quality assurance", status: "todo", iconClass: "icon-quality" },
//   { id: 'P6', name: "DAM Integration", sub: "Asset packaging", status: "todo", iconClass: "icon-dam" },
//   { id: 'P7', name: "Integration Lineage", sub: "System integration", status: "todo", iconClass: "icon-integration" },
// ];
const SIDEBAR_PHASES = [
  {
    id: 'P1',
    name: "Global Context Capture",
    sub: "Source content analysis",
    status: "done",
    icon: <Globe size={18} />,
    color: 'is-blue'
  },
  {
    id: 'P2',
    name: "Smart TM Translation",
    sub: "AI-powered translation",
    status: "active",
    icon: <Languages size={18} />,
    color: 'is-purple'
  },
  {
    id: 'P3',
    name: "Cultural Intelligence",
    sub: "Cultural adaptation",
    status: "todo",
    icon: <MessageSquare size={18} />,
    color: 'is-green'
  },
  {
    id: 'P4',
    name: "Regulatory Compliance",
    sub: "Compliance validation",
    status: "todo",
    icon: <Shield size={18} />,
    color: 'is-orange'
  },
  {
    id: 'P5',
    name: "Quality Intelligence",
    sub: "Quality assurance",
    status: "todo",
    icon: <CheckCircleIcon size={18} />,
    color: 'is-cyan'
  },
  {
    id: 'P6',
    name: "DAM Integration",
    sub: "Asset packaging",
    status: "todo",
    icon: <Box size={18} />,
    color: 'is-pink'
  },
  {
    id: 'P7',
    name: "Integration Lineage",
    sub: "System integration",
    status: "todo",
    icon: <MessageSquare size={18} />,
    color: 'is-violet'
  },
];

/* Env helpers */
const getEnv = () => {
  const pe = (typeof process !== "undefined" && process.env) ? process.env : {};
  const we = (typeof window !== "undefined" && window._env_) ? window._env_ : {};
  return { ...we, ...pe };
};
const ENV = getEnv();

/** Use .env or hardcode during test */
// const N8N_WEBHOOK_URL = ENV.REACT_APP_N8N_WEBHOOK_URL || ENV.VITE_N8N_WEBHOOK_URL || "";
// const N8N_BULK_WEBHOOK_URL = ENV.REACT_APP_N8N_BULK_WEBHOOK_URL || ENV.VITE_N8N_BULK_WEBHOOK_URL || "";

/**
 * Persists the successful AI translation to the PostgreSQL database
 */
const saveTranslationToDb = async (source, target, sLang, tLang, docName) => {
  try {
    const response = await fetch(
      "https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/translated-content",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_name: docName,
          source_text: source,
          target_text: target,
          source_language: sLang || "EN",
          target_language: tLang,
        }),
      },
    );

    if (response.ok) {
      console.log("Translation successfully saved to DB");
    } else {
      console.error("Failed to save to DB:", await response.text());
    }
  } catch (error) {
    console.error("Network error saving translation:", error);
  }
};

// For quick test you can uncomment and set directly:
const N8N_WEBHOOK_URL = "http://172.16.4.237:8031/webhook/csv_upload";
const N8N_BULK_WEBHOOK_URL = "http://172.16.4.237:8031/webhook/csv_upload_bulk";

// const N8N_WEBHOOK_URL = "http://172.16.4.237:8015/webhook-test/csv_upload";
// const N8N_BULK_WEBHOOK_URL = "http://172.16.4.237:8015/webhook-test/csv_upload_bulk";
// const N8N_BULK_WEBHOOK_URL = "http://172.16.4.237:8015/webhook-test/translateAll";

const N8N_AUTH =
  ENV.REACT_APP_N8N_TOKEN ||
  ENV.VITE_N8N_TOKEN ||
  "";

/** Extract target language from therapyArea like "Respiratory · DE" */
const getTargetLang = (therapyArea) => {
  const m = String(therapyArea || "").match(/·\s*([A-Za-z-]+)/);
  return m?.[1] || "DE";
};

/** Extract translated text from n8n response (single-segment helper retained) */
const extractTranslated = async (res) => {
  let body;
  try {
    body = await res.json();
  } catch {
    const text = await res.text();
    return (text || "").trim();
  }

  if (Array.isArray(body) && body.length > 0) {
    const first = body[0];
    if (first && typeof first.output === "string") return first.output.trim();
    for (const k of Object.keys(first || {})) {
      const v = first[k];
      if (typeof v === "string" && /translat|output/i.test(k)) return v.trim();
    }
  }

  if (body && typeof body === "object") {
    if (typeof body.translated === "string") return body.translated.trim();
    if (body.data && typeof body.data.translated === "string") return body.data.translated.trim();
    for (const k of Object.keys(body)) {
      const v = body[k];
      if (typeof v === "string" && /translat|output/i.test(k)) return v.trim();
    }
  }

  return "";
};

/* ===== Helpers to normalize n8n bulk output ===== */

/** Normalize the "output" object: alias keys like "segment 1" -> "1", "segment_1", etc. */
function normalizeOutputMap(outputObj) {
  const byKey = {};
  for (const [rawKey, rawVal] of Object.entries(outputObj || {})) {
    if (typeof rawVal !== "string") continue;
    const val = rawVal.trim();
    const key = String(rawKey).trim();

    // Keep original
    byKey[key] = val;

    // If key looks like "segment 1", alias to multiple variants
    const m = key.match(/segment[\s_-]*([0-9]+)/i);
    if (m) {
      const ix = m[1]; // "1"
      byKey[ix] = val;                     // "1"
      byKey[`segment ${ix}`] = val;        // "segment 1"
      byKey[`Segment ${ix}`] = val;        // case variant
      byKey[`segment_${ix}`] = val;        // "segment_1"
      byKey[`segment-${ix}`] = val;        // "segment-1"
      byKey[`seg ${ix}`] = val;            // "seg 1"
      byKey[`Seg ${ix}`] = val;            // "Seg 1"
      byKey[`segment${ix}`] = val;   // no-space
      byKey[`Segment${ix}`] = val;   // no-space PascalCase
    }
  }
  return byKey;
}

/** Lookup key variants for a segment */
function keyVariantsForSegment(seg) {
  const ix = String(seg.index);
  const id = String(seg.id);
  return [
    id,
    ix,
    `segment ${ix}`,
    `Segment ${ix}`,
    `segment_${ix}`,
    `segment-${ix}`,
    `seg ${ix}`,
    `Seg ${ix}`,
    `segment${ix}`,
    `Segment${ix}`,
    id.toLowerCase(),
    ix.toLowerCase(),
  ];
}

/** Extract bulk translations (robust to multiple response shapes, including your screenshot) */
// async function extractBulkTranslations(res, pending) {
//   try {
//     const resClone = res.clone(); 
//     let body;
    
//     // 1. Try to parse the main response
//     try {
//         body = await res.json();
//     } catch (e) {
//         console.warn("⚠️ Response was not JSON, falling back to text parsing.");
//         body = null;
//     }

//     console.log("📦 Raw N8N Response:", body);

//     let byKey = {};

//     // ---------------------------------------------------------
//     // SPECIAL HANDLER: Double-Stringified JSON (The Fix)
//     // ---------------------------------------------------------
//     if (typeof body === 'string') {
//         try {
//             const parsedBody = JSON.parse(body);
//             body = parsedBody; // Update body to be the object
//         } catch (e) {}
//     }
    
//     // Handle array where first item is stringified
//     if (Array.isArray(body) && body.length > 0 && typeof body[0] === 'string') {
//          try {
//             const parsedInner = JSON.parse(body[0]);
//             body = Array.isArray(parsedInner) ? parsedInner : [parsedInner];
//         } catch (e) {}
//     }

//     // Standard Normalizer Helper
//     const normalizeAndMap = (obj) => {
//         if (!obj) return;
//         const target = obj.output || obj; 
        
//         for (const [k, v] of Object.entries(target)) {
//             if (typeof v === 'string') {
//                 const cleanKey = k.toLowerCase().replace(/segment\s*[-_]?/i, "").trim(); 
                
//                 // Find matching segment in pending list
//                 const matchingSeg = pending.find(s => 
//                     String(s.index) === cleanKey || 
//                     s.id === k ||
//                     s.id === `seg-${cleanKey}`
//                 );

//                 if (matchingSeg) {
//                     byKey[matchingSeg.id] = v.trim();
//                 }
//             }
//         }
//     };

//     // PROCESS THE DATA
//     const items = Array.isArray(body) ? body : [body];

//     for (const item of items) {
//         if (!item) continue;
//         const actualItem = item.json ? item.json : item;
        
//         // Strategy A: Item has explicit ID
//         const key = actualItem.segmentId ?? actualItem.id ?? actualItem.index;
//         const val = actualItem.translated ?? actualItem.output ?? actualItem.result;

//         if (key && val && typeof val === 'string') {
//              const segId = String(key);
//              const match = pending.find(p => String(p.index) === segId || p.id === segId);
//              if (match) byKey[match.id] = val.trim();
//         } 
//         // Strategy B: Item IS the map
//         else {
//             normalizeAndMap(actualItem);
//         }
//     }

//     // FALLBACK: Raw text lines
//     if (Object.keys(byKey).length === 0) {
//         const txt = await resClone.text();
//         const lines = String(txt || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
//         pending.forEach((seg, i) => {
//             if (lines[i]) byKey[seg.id] = lines[i];
//         });
//     }

//     return byKey;

//   } catch (err) {
//     console.error("❌ Error parsing translations:", err);
//     return {};
//   }
// }

/** Extract bulk translations (Corrected for ID mismatch) */
/** Extract bulk translations (Defensive: Handles Strings, Objects, and Double-JSON) */
/** Extract bulk translations (Universal Unwrapper Fix) */
/** Extract bulk translations (Specific fix for Array -> Output -> Map structure) */
/** Extract bulk translations (Universal Unwrapper Fix) */
/** Extract bulk translations (Universal Unwrapper Fix) */

/** Extract bulk translations (robust to multiple response shapes, including your screenshot) */
async function extractBulkTranslations(res, pending) {
  try {
    const body = await res.json();

    // CASE A: Array with an item containing { output: { "segment 1": "...", ... } }
    if (Array.isArray(body) && body.length > 0) {
      const first = body[0];
      if (first && typeof first === "object" && first.output && typeof first.output === "object") {
        return normalizeOutputMap(first.output);
      }
    }

    // CASE B: Object with output
    if (body && typeof body === "object" && body.output && typeof body.output === "object") {
      return normalizeOutputMap(body.output);
    }

    // CASE C: Array of items with segmentId/id/index + string fields
    const arr =
      Array.isArray(body) ? body :
      Array.isArray(body?.translations) ? body.translations :
      Array.isArray(body?.data) ? body.data :
      Array.isArray(body?.items) ? body.items : null;

    const byKey = {};
    if (arr) {
      for (const item of arr) {
        const key = item.segmentId ?? item.id ?? item.index;
        if (key === undefined || key === null) continue;

        let translated = "";
        for (const k of Object.keys(item)) {
          const v = item[k];
          if (typeof v === "string" && /translat|output|target|result/i.test(k)) {
            translated = v.trim();
            break;
          }
        }
        byKey[String(key)] = translated;

        // If numeric key, add "segment N" alias
        if (typeof key === "number" || /^\d+$/.test(String(key))) {
          const ix = String(key);
          byKey[`segment ${ix}`] = translated;
        }
      }
      return byKey;
    }

    // CASE D: Object fallback
    if (body && typeof body === "object") {
      const byKey2 = {};
      for (const k of Object.keys(body)) {
        const v = body[k];
        if (typeof v === "string") byKey2[k] = v.trim();
        else if (v && typeof v === "object") {
          for (const kk of Object.keys(v)) {
            const vv = v[kk];
            if (typeof vv === "string" && /translat|output|target|result/i.test(kk)) {
              byKey2[k] = vv.trim();
              break;
            }
          }
        }
      }
      if (Object.keys(byKey2).length > 0) return byKey2;
    }
  } catch {
    // fall through to text parsing
  }

  // Text fallback: map lines to pending indexes
  const txt = await res.text();
  const lines = String(txt || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const byKey = {};
  pending.forEach((seg, i) => {
    byKey[seg.id] = lines[i] || "";
    byKey[`segment ${seg.index}`] = lines[i] || ""; // helpful alias
  });
  return byKey;
}

/** Progress modal (visual) */
function BulkProgressModal({ open, progress, subtitle = "Translating all pending segments with Smart TM..." }) {
  if (!open) return null;
  const pct = Math.round((progress.done / Math.max(progress.total || 0, 1)) * 100);

  return (
    <div className="tm-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bulk-progress-title">
      <div className="tm-modal tm-modal-progress">
        <div className="tm-modal-header">
          <h3 id="bulk-progress-title" className="tm-modal-title">Bulk Translation in Progress</h3>
          <button className="tm-close is-disabled" aria-label="Close" disabled title="Closes when translation finishes">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <circle cx="14" cy="14" r="13" fill="#EEF3FB" stroke="#CFE0FB" />
              <path d="M9 9l10 10M19 9L9 19" stroke="#0B1220" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="tm-modal-sub">{subtitle}</p>

        <div className="tm-progress-bar large" aria-label="Bulk progress">
          <div className="tm-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="tm-modal-status">
          {progress.done} of {progress.total} segments completed
          {progress.failed > 0 ? ` (failed: ${progress.failed})` : ""}
        </div>

        <div className="tm-info-box">
          <svg className="tm-info-radio" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="9" cy="9" r="7.5" fill="none" stroke="#9CA3AF" />
            <circle cx="9" cy="9" r="3.5" fill="#1F7AEC" />
          </svg>
          <div className="tm-info-text">
            <div>This may take several minutes. Please don't close the window.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Draft panel integrated on the same page (TOP BAR REMOVED) ===== */
function DraftPanel({
  projectName,
  therapyArea,
  inboundLang,
  segments,
  tmLeveragePct = 0,
  onBackToWorkspace, // still passed, but no mini top bar is rendered
  onSendToCI,
}) {
  // Normalize and sort segments defensively
  const normalized = useMemo(() => {
    const arr = Array.isArray(segments) ? segments : [];
    return arr
      .map((s, i) => {
        const index = typeof s.index === "number" ? s.index : i + 1;
        const id = s.id ?? `seg-${index}`;
        const source = String(s.source ?? "");
        const translatedRaw = String(s.translated ?? "");
        const translated = translatedRaw.trim() === "— Awaiting translation —" ? "" : translatedRaw.trim();
        const words = typeof s.words === "number" ? s.words : source.split(/\s+/).filter(Boolean).length;
        const status = s.status ?? (translated ? "Completed" : "Pending");
        const lang = s.lang ?? inboundLang ?? "EN";
        return { ...s, id, index, source, translated, words, status, lang };
      })
      .sort((a, b) => (a.index || 0) - (b.index || 0));
  }, [segments, inboundLang]);

  const totalSegments = normalized.length;

  //Fixing Draft Panel badges......!......
  // 🆕 NEW: Calculate the individual score for each row
  const getSegScore = (seg) => {
    let rawScore = 0;
    if (typeof seg.matchScore === 'number') {
      rawScore = seg.matchScore;
    } else if (seg.reviewData && typeof seg.reviewData.tmScore === 'number') {
      rawScore = seg.reviewData.tmScore <= 1 ? seg.reviewData.tmScore * 100 : seg.reviewData.tmScore;
    } else if (seg.translated && seg.translated.trim() !== "" && seg.translated !== "— Awaiting translation —") {
      rawScore = 100;
    }
    return Math.round(rawScore);
  };


  const totalWords = normalized.reduce((a, s) => a + (s.words || 0), 0);

  const [openIds, setOpenIds] = useState(new Set());
  useEffect(() => {
    // setOpenIds(new Set(normalized.map((s) => s.id)));
    setOpenIds(new Set());
  }, [normalized]);

  const isOpen = (id) => openIds.has(id);
  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const compiledDraft = useMemo(() => {
    return normalized
      .map((s) => `Section ${s.index}\n${(s.translated || "").trim() || "[No translation]"}`)
      .join("\n\n---\n\n");
  }, [normalized]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledDraft);
      alert("Draft copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const handleDownloadAsText = () => {
    const blob = new Blob([compiledDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `DraftTranslation-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedAt = useMemo(() => {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const ss = d.getSeconds().toString().padStart(2, "0");
    return `${hh}:${mm}:${ss} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  }, []);

  return (
    <div className="dt-app">
      {/* NOTE: Mini top bar removed on purpose to avoid duplication with main page header/tabs */}

      {/* Header strip */}
      <div className="dt-header-strip">
        <div className="dt-header-left">
          <h2 className="dt-title"> <FileText size={19} className="h-5 w-5 text-emerald-600 ml-2" />Complete Draft Translation</h2>
          <div className="dt-subtitle">
            {totalSegments} segments • {totalWords} words • {tmLeveragePct}% TM leverage
          </div>
          {/* <div className="dt-subtitle dt-muted">
            {projectName} &nbsp;&middot;&nbsp; {therapyArea} &nbsp;&middot;&nbsp; {inboundLang}
          </div> */}
        </div>
        <div className="dt-header-actions">
          <button className="dt-btn outline py-2 px-4" onClick={handleCopyToClipboard}>Copy to Clipboard</button>
          <button className="dt-btn outline py-2 px-4" onClick={handleDownloadAsText}>Download as Text</button>
          <button className="dt-btn primary" onClick={() => onSendToCI(normalized)}>
          <ArrowRight size={15} className="h-4 w-4 mr-2" />Send to Cultural Intelligence</button>
        </div>
      </div>

      {/* Body */}
      <div className="dt-body">
        {/* Left sections */}
        <div className="dt-left">
          {normalized.length === 0 && (
            <div className="dt-empty">
              No translated segments found. Please run "Translate All" from the Smart TM Translation tab.
            </div>
          )}

          {normalized.map((s, i) => {
            const open = isOpen(s.id);
            return (
              <div key={s.id || `seg-${s.index || i}`} className="dt-item">
                <div className="dt-item-header">
                  <span className="dt-item-num">{s.index}</span>
                  <span className="dt-item-title">Section {s.index}</span>

                  <span className="dt-badge green">{s.words || 0} words</span>
                  {/* <span className="dt-badge gray">{tmLeveragePct}% TM</span> */}

                {/* NEW: Show individual segment score if available */}
                <span className="dt-badge gray">{getSegScore(s)}% TM</span>

                  <button
                    className={`dt-toggle ${open ? "open" : ""}`}
                    onClick={() => toggleOpen(s.id)}
                    aria-label={open ? "Collapse section" : "Expand section"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d={open ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {open && (
                  <div className="dt-item-content">
                    {(s.translated || "").trim() || "[No translation]"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right metadata */}
        <aside className="dt-right">
          <div className="dt-meta-card">
          <h4 className="dt-meta-title">
            <BarChart3 size={19} className="h-4 w-4" />
              Translation Metadata</h4>

            <div className="dt-meta-percentage-card">
              <div className="dt-meta-percentage">{tmLeveragePct}%</div>
              <div className="dt-meta-percentage-sub">Average TM Leverage</div>
            </div>

            <div className="dt-meta-list">
              <div className="dt-meta-row">
                <span className="dt-meta-label">Total Segments</span>
                <span className="dt-meta-value">{totalSegments}</span>
              </div>
              <div className="dt-meta-row">
                <span className="dt-meta-label">Total Words</span>
                <span className="dt-meta-value">{totalWords}</span>
              </div>
              <div className="dt-meta-row">
                <span className="dt-meta-label">Generated</span>
                <span className="dt-meta-value">{generatedAt}</span>
              </div>
            </div>

            <div className="dt-meta-ready">
              <span className="dt-ready-icon">✅</span>
              <span>Ready for Cultural Intelligence Analysis</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Smart TM Translation Hub */
export default function SmartTMTranslationHub({
  projectName: projectNameProp = "No project name to display",
  therapyArea = "Respiratory · DE",
  progressWords: progressWordsProp = { done: 0, total: 333 },
  // segments: segmentsProp = "No Segments to display",
  segments: segmentsProp = null,
}) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const projectId = state?.projectId;

  const [projectRec, setProjectRec] = useState(null);
  // // ✅ 1. Use async State for the project record
  // const [projectRec, setProjectRec] = useState(null);
  const country = state?.country ?? "Unknown Country";
  console.log(country);
  const inboundLang = projectRec?.meta?.targetLang || state?.lang || state?.sourceLang || "EN";
  
  console.log(country);
  // const refreshProgress = async () => {
  //   if (projectId) {
  //     const p = await getProject(projectId);
  //     setProjectRec(p);
  //   }
  // };
  // ✅ 1. Use async State for the project record
  
  
  // 🆕 NEW: Add a loading state. Defaults to true if we have a projectId to fetch.
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId); 

  const refreshProgress = async () => {
    if (projectId) {
      // Only set to true if it's the very first load to prevent flickering on background syncs
      // if (!projectRec) setIsLoadingProject(true); 
      const p = await getProject(projectId);
      setProjectRec(p);
      setIsLoadingProject(false); // 🆕 NEW: Turn off loader when data arrives
    } else {
      setIsLoadingProject(false);
    }
  };
 
useEffect(() => {
    refreshProgress();
    window.addEventListener('glocal_progress_updated', refreshProgress);
    return () => window.removeEventListener('glocal_progress_updated', refreshProgress);
  }, [projectId]);
// const { completedSet } = computeProgress(projectRec);
//   const totalTarget = 4;
//   const completedCount = Math.min(completedSet.size, totalTarget);
//   const overallPercent = (completedCount / totalTarget) * 100;
const totalTarget = 4;
  
  // 🆕 Synchronous progress calculation to prevent UI flicker
  // const progressData = useMemo(() => {
  //   let recToUse = projectRec;
  //   if (!recToUse && projectId) {
  //     const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
  //     recToUse = db[projectId];
  //   }
    
  //   const { completedSet } = computeProgress(recToUse || {});
  //   const count = Math.min(completedSet.size, totalTarget);
  //   return {
  //     completedSet,
  //     completedCount: count,
  //     overallPercent: Math.round((count / totalTarget) * 100)
  //   };
  // }, [projectRec, projectId]);

  // const { completedSet, completedCount, overallPercent } = progressData;
  // 🆕 NEW: Official Loading State for the Sidebar
  //Hari-24/3
  // const progressData = useMemo(() => {
  //   if (!projectRec) {
  //     // Return a temporary loading state while the database is fetching
  //     return { completedSet: new Set(), completedCount: 0, overallPercent: 0, isProgressLoading: true };
  //   }
  //   const { completedSet } = computeProgress(projectRec);
  //   const count = Math.min(completedSet.size, totalTarget);
  //   return {
  //     completedSet,
  //     completedCount: count,
  //     overallPercent: Math.round((count / totalTarget) * 100),
  //     isProgressLoading: false
  //   };
  // }, [projectRec]);

  // const { completedSet, completedCount, overallPercent, isProgressLoading } = progressData;

  //Hari-25/3
  //  const progressData = useMemo(() => {
  //   let recToUse = projectRec;
 
  //   // Synchronous fallback: If React state hasn't loaded yet,
  //   // grab the latest data directly from localStorage to prevent progress flicker.
  //   if (!recToUse && projectId) {
  //     try {
  //       const rawDb = localStorage.getItem('glocal_progress_v1');
  //       const db = JSON.parse(rawDb || '{}');
  //       recToUse = db[projectId];
  //     } catch (e) {
  //       console.error("Error reading progress from localStorage:", e);
  //     }
  //   }
 
  //   // If still no record exists, return the safe loading state
  //   if (!recToUse) {
  //     return { completedSet: new Set(), completedCount: 0, overallPercent: 0, isProgressLoading: true };
  //   }
 
  //   // Calculate progress based on the guaranteed latest data
  //   const { completedSet } = computeProgress(recToUse);
  //   const count = Math.min(completedSet.size, totalTarget);
   
  //   return {
  //     completedSet,
  //     completedCount: count,
  //     overallPercent: Math.round((count / totalTarget) * 100),
  //     isProgressLoading: !projectRec
  //   };
  // }, [projectRec, projectId]);
  //Hari-25/3--------------------------------------------------------------------
  // const progressData = useMemo(() => {
  //   let recToUse = projectRec;

  //   // ✅ FIXED: Safely check if the database record is actually empty (not just null)
  //   const isRecEmpty = !recToUse || Object.keys(recToUse).length === 0;

  //   // Synchronous fallback: If React state hasn't loaded or is empty, grab from cache
  //   if (isRecEmpty && projectId) {
  //     try {
  //       const rawDb = localStorage.getItem('glocal_progress_v1');
  //       const db = JSON.parse(rawDb || '{}');
  //       if (db[projectId]) {
  //           recToUse = db[projectId];
  //       }
  //     } catch (e) {
  //       console.error("Error reading progress from localStorage:", e);
  //     }
  //   }

  //   // If still no record exists anywhere (both DB and Cache are totally empty)
  //   if (!recToUse || Object.keys(recToUse).length === 0) {
  //     return { 
  //       completedSet: new Set(), 
  //       completedCount: 0, 
  //       overallPercent: 0, 
  //       isProgressLoading: isRecEmpty 
  //     };
  //   }

  //   // Calculate progress based on the guaranteed latest data
  //   const { completedSet } = computeProgress(recToUse);
  //   const count = Math.min(completedSet.size, totalTarget);

  //   return {
  //     completedSet,
  //     completedCount: count,
  //     overallPercent: Math.round((count / totalTarget) * 100),
  //     isProgressLoading: !projectRec // We found real data, so instantly stop the loading state!
  //   };
  // }, [projectRec, projectId]);

  //Hari-25/3 (Upgraded Universal Cache)
  const progressData = useMemo(() => {
    let recToUse = projectRec;

    // ✅ FIXED: Safely check if the database record is actually empty
    const isRecEmpty = !recToUse || Object.keys(recToUse).length === 0;

    // Synchronous fallback: If React state hasn't loaded or is empty, grab from cache
    if (isRecEmpty && projectId) {
      try {
        const rawDb = localStorage.getItem('glocal_progress_v1');
        const db = JSON.parse(rawDb || '{}');
        if (db[projectId]) {
            recToUse = db[projectId];
        }
      } catch (e) {
        console.error("Error reading progress from localStorage:", e);
      }
    }

    // If still no record exists anywhere (both DB and Cache are totally empty)
    if (!recToUse || Object.keys(recToUse).length === 0) {
      return { 
        completedSet: new Set(), 
        completedCount: 0, 
        overallPercent: 0, 
        isProgressLoading: isRecEmpty 
      };
    }

    // Calculate progress based on the guaranteed latest data
    const { completedSet } = computeProgress(recToUse);
    const count = Math.min(completedSet.size, totalTarget);

    return {
      completedSet,
      completedCount: count,
      overallPercent: Math.round((count / totalTarget) * 100),
      // ✅ FIXED: Look at the REAL database state for the loading text!
      isProgressLoading: !projectRec || Object.keys(projectRec).length === 0
    };
  }, [projectRec, projectId]);
 
  const { completedSet, completedCount, overallPercent, isProgressLoading } = progressData;
 
  

  // 🔁 Restore "draft generated" flag (from meta or localStorage)
  const draftGeneratedPersisted = !!(
    projectRec?.meta?.p2DraftGenerated ||
    localStorage.getItem(`p2_draft_generated_${projectId}`) === "true"
  );
  
  // Ensure Draft tab is unlocked if the persisted flag exists
  // useEffect(() => {
  //   if (draftGeneratedPersisted) {
  //     setIsDraftUnlocked(true);
  //     setShowGenerateDraft(false);
  //   }
  // }, [draftGeneratedPersisted]);
  
  // ✅ 2. Read segments safely once projectRec is loaded
  // ✅ 2. Read segments safely and stably
  //const persistedSegmentsP2 = React.useMemo(() => projectRec?.meta?.segmentsP2 || [], [projectRec]);
  // ✅ FIXED: Safely ensure we ALWAYS get an array, even if the DB gets corrupted during testing
  const persistedSegmentsP2 = React.useMemo(() => {
    const data = projectRec?.meta?.segmentsP2;
    return Array.isArray(data) ? data : [];
  }, [projectRec]);
  const persistedSegmentsP1 = React.useMemo(() => projectRec?.meta?.segmentsP1 || [], [projectRec]);

  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  // Toggle handler
 const [isFocusMode, setIsFocusMode] = useState(() => {
  // restore from localStorage on mount
  const v = localStorage.getItem('tm_focus_mode');
  return v === 'true';
});
const toggleFocusMode = () => setIsFocusMode(prev => !prev);

// persist on change
useEffect(() => {
  localStorage.setItem('tm_focus_mode', String(isFocusMode));
}, [isFocusMode]);

// keyboard: F to focus, Esc to exit
useEffect(() => {
  const onKey = (e) => {
    const k = String(e.key || '').toLowerCase();
    if (k === 'f') setIsFocusMode(true);
    if (k === 'escape') setIsFocusMode(false);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, []);

  /** Tabs */
  const [activeTab, setActiveTab] = useState("workspace");

  /** Prefer project from previous page */
  const projectName = state?.projectName ?? projectNameProp;

  /** Language passed from previous page */
  //const inboundLang = state?.lang ?? "EN";

  const gotoPhase = usePhaseNavigation(projectId, projectName,country); //31_03_sanju

  /** Normalize incoming segments */
  // const segments = useMemo(() => {
  //   const raw = Array.isArray(state?.segments)
  //     ? state.segments
  //     : Array.isArray(segmentsProp)
  //     ? segmentsProp
  //     : [];

  //   return (raw || [])
  //     .map((seg, i) => {
  //       const index = typeof seg.index === "number" ? seg.index : i + 1;
  //       const source = String(seg.source ?? "");
  //       const translated = String(seg.translated ?? "");
  //       const words =
  //         typeof seg.words === "number"
  //           ? seg.words
  //           : source.split(/\s+/).filter(Boolean).length;

  //       return {
  //         id: seg.id ?? `seg-${index}`,
  //         index,
  //         source,
  //         translated,
  //         words,
  //         status: seg.status ?? (translated.trim() ? "Completed" : "Pending"),
  //         lang: seg.lang ?? inboundLang,
  //       };
  //     })
  //     .filter((s) => s.source.trim().length > 0)
  //     .sort((a, b) => a.index - b.index);
  // }, [state?.segments, segmentsProp, inboundLang]);

  const segments = useMemo(() => {
    // const raw = Array.isArray(state?.segments)
    //   ? state.segments
    //   : Array.isArray(segmentsProp)
    //   ? segmentsProp
    //   : [];

// ✅ Prefer location.state.segments; fallback to persisted P1 segments
    //  const raw = Array.isArray(state?.segments)
    //    ? state.segments
    //    : (Array.isArray(segmentsProp) ? segmentsProp : persistedSegments);
    
const rawCandidate =   
    (Array.isArray(persistedSegmentsP2) && persistedSegmentsP2.length > 0)
     ? persistedSegmentsP2
   : (Array.isArray(state?.segments) && state.segments.length > 0)
     ? state.segments
    : (Array.isArray(persistedSegmentsP1) && persistedSegmentsP1.length > 0)
      ? persistedSegmentsP1
    : (Array.isArray(segmentsProp) && segmentsProp.length > 0)
      ? segmentsProp
    : [];



    return (rawCandidate || [])
      .map((seg, i) => {
        const index = typeof seg.index === "number" ? seg.index : i + 1;
        const source = String(seg.source ?? "");
        const translated = String(seg.translated ?? "");
        const words =
          typeof seg.words === "number"
            ? seg.words
            : source.split(/\s+/).filter(Boolean).length;

        return {
          id: seg.id ?? `seg-${index}`,
          index,
          source,
          translated,
          words,
          status: seg.status ?? (translated.trim() ? "Completed" : "Pending"),
          // 🆕 Default each segment's lang to inboundLang if not present
          lang: seg.lang ?? inboundLang,
          reviewData: seg.reviewData,
        };
      })
      .filter((s) => s.source.trim().length > 0)
      .sort((a, b) => a.index - b.index);
  // }, [state?.segments, segmentsProp, inboundLang]);
// }, [state?.segments, segmentsProp, persistedSegmentsP1, inboundLang]);
}, [state?.segments, segmentsProp, persistedSegmentsP1, persistedSegmentsP2, inboundLang]);

  /** Selected segment */
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!selectedId && segments.length) setSelectedId(segments[0].id);
  }, [segments, selectedId]);

  const selected = useMemo(
    () => segments.find((s) => s.id === selectedId) || null,
    [segments, selectedId]
  );

  /** UI overlays (do NOT mutate original segments) */
  const [segOverrides, setSegOverrides] = useState({}); // { [id]: { translated?: string, status?: string } }

  //const [segOverrides, setSegOverrides] = useState({}); // { [id]: { translated?: string, status?: string } }

  // 🆕 HYDRATE LOCAL OVERRIDES FROM DATABASE ON MOUNT
  // useEffect(() => {
  //   if (persistedSegmentsP2 && persistedSegmentsP2.length > 0) {
  //     const initialOverrides = {};
  //     persistedSegmentsP2.forEach(s => {
  //       // Only override if the user actually translated something or changed a status
  //       if (s.translated || s.status || s.reviewData) {
  //         initialOverrides[s.id] = { 
  //           translated: s.translated, 
  //           status: s.status,
  //           reviewData: s.reviewData 
  //         };
  //       }
  //     });
  //     setSegOverrides(prev => ({ ...prev, ...initialOverrides}));
  //   }
  // }, [persistedSegmentsP2]);

  const [hasHydrated, setHasHydrated] = useState(false); // 🆕 THE LOCK
 
  // 🆕 HYDRATE LOCAL OVERRIDES FROM DATABASE ON MOUNT
  useEffect(() => {
    // 🆕 If already loaded, lock the door to prevent "Echo Crush"
    if (hasHydrated || !persistedSegmentsP2 || persistedSegmentsP2.length === 0) return;
 
    const initialOverrides = {};
    persistedSegmentsP2.forEach(s => {
      if (s.translated || s.status || s.reviewData) {
        initialOverrides[s.id] = { 
          translated: s.translated, 
          status: s.status,
          reviewData: s.reviewData 
        };
      }
    });
    setSegOverrides(prev => ({ ...prev, ...initialOverrides}));
    setHasHydrated(true); // 🆕 ENGAGE THE LOCK
  }, [persistedSegmentsP2, hasHydrated]);

  // ✅ NEW: AUTO-SAVE REAL-TIME TRANSLATIONS TO DATABASE
  // useEffect(() => {
  //   if (!projectId || Object.keys(segOverrides).length === 0 || isBulkTranslating) return;

  //   // Debounce to prevent spamming the backend while typing
  //   const timeoutId = setTimeout(() => {
  //     const mergedSegments = segments.map((s) => {
  //       const o = segOverrides[s.id] || {};
  //       return { ...s, ...o };
  //     });
  //     updateProjectMeta(projectId, { segmentsP2: mergedSegments });
  //   }, 1000);

  //   return () => clearTimeout(timeoutId);
  // }, [projectId, segOverrides, segments, isBulkTranslating]);
/** Bulk modal */
  const [isBulkTranslating, setIsBulkTranslating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, failed: 0 });

  // ✅ NEW: AUTO-SAVE REAL-TIME TRANSLATIONS & LANGUAGE TO DATABASE
  useEffect(() => {
    if (!projectId || Object.keys(segOverrides).length === 0 || isBulkTranslating) return;
 
    // Debounce to prevent spamming the backend while typing
    const timeoutId = setTimeout(() => {
      const mergedSegments = segments.map((s) => {
        const o = segOverrides[s.id] || {};
        return { ...s, ...o };
      });
      // 🆕 Also save the target language so it survives sidebar navigation!
      updateProjectMeta(projectId, { 
        segmentsP2: mergedSegments, 
        //segmentsP3: mergedSegments, 
        targetLang: inboundLang 
      });
    }, 1000);
 
    return () => clearTimeout(timeoutId);
  }, [projectId, segOverrides, segments, inboundLang, isBulkTranslating]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [tmLeverageOn, setTmLeverageOn] = useState(true);

  

  /** Success banner → Generate Draft Translation */
  const [showGenerateDraft, setShowGenerateDraft] = useState(false);

  // 🚦 Draft tab lock: disabled until user clicks "Generate Draft Translation"
const [isDraftUnlocked, setIsDraftUnlocked] = useState(false);

/** Are ALL segments completed (has real text or explicit status=Completed)? */
// const allSegmentsCompleted = useMemo(() => {
//   if (segments.length === 0) return false;
//   return segments.every((s) => {
//     const o = segOverrides[s.id];
//     const translated = (o?.translated ?? s.translated ?? "").trim();
//     const status = (o?.status ?? s.status) || (translated ? "Completed" : "Pending");
//     // treat only real (non-placeholder) translations as completed
//     return (translated.length > 0 && translated !== "— Awaiting translation —") || status === "Completed";
//   });
// }, [segments, segOverrides]);
//  NEW: Auto-Unlock the Draft Tab ONLY when translations are 100% complete
  //Hari
 /** Are ALL segments completed (has real text or explicit status=Completed)? */
 //Hari
const allSegmentsCompleted = useMemo(() => {
  if (segments.length === 0) return false;
  return segments.every((s) => {
    const o = segOverrides[s.id];
    const translated = (o?.translated ?? s.translated ?? "").trim();
    const status = (o?.status ?? s.status) || (translated ? "Completed" : "Pending");
    
    // ✅ FIXED: Explicitly ignore ALL loading and error placeholders
    const isPlaceholder = 
      translated === "— Awaiting translation —" || 
      translated === "— Analyzing TM & Glossary —" || 
      translated === "— Failed —";

    // treat only real (non-placeholder) translations as completed
    return (translated.length > 0 && !isPlaceholder) || status === "Completed";
  });
}, [segments, segOverrides]);
  useEffect(() => {
    if (!allSegmentsCompleted) {
      // If a translation is deleted, strictly lock the tab
      setIsDraftUnlocked(false);
      if (activeTab === "draft") {
        setActiveTab("workspace");
      }
    } else if (draftGeneratedPersisted) {
      // If complete AND we already generated the draft in the past, keep it unlocked!
      setIsDraftUnlocked(true);
    }
  }, [allSegmentsCompleted, activeTab, draftGeneratedPersisted]);

/** Show success banner only when all complete AND draft is still locked */
//Hari
useEffect(() => {
     const canShow = allSegmentsCompleted && !isDraftUnlocked && !draftGeneratedPersisted;
     setShowGenerateDraft(canShow);
   }, [allSegmentsCompleted, isDraftUnlocked, draftGeneratedPersisted]);
// useEffect(() => {
//     setShowGenerateDraft(allSegmentsCompleted && !isDraftUnlocked);
//   }, [allSegmentsCompleted, isDraftUnlocked]);

  /** Draft state for same-page tab */
  const [draftSegments, setDraftSegments] = useState([]);
  const [tmLeveragePct, setTmLeveragePct] = useState(0);

  // 🆕 NEW: Auto-calculate using the EXACT logic from TMLeverageOverview.jsx
  // useEffect(() => {
  //   // 1. Merge segments with user overrides so we have the latest text/scores
  //   const mergedSegments = segments.map((s) => {
  //     const o = segOverrides[s.id] || {};
  //     return { ...s, ...o };
  //   });

  //   if (mergedSegments.length === 0) return;

  //   // 2. Use the exact variables from TMLeverageOverview
  //   let exact = 0;
  //   let fuzzy = 0;
    
  //   mergedSegments.forEach((seg) => {
  //     let rawScore = 0;

  //     // Exact logic from TMLeverageOverview Case A, B, and C
  //     if (typeof seg.matchScore === 'number') {
  //         rawScore = seg.matchScore;
  //     } else if (seg.reviewData && typeof seg.reviewData.tmScore === 'number') {
  //         rawScore = seg.reviewData.tmScore <= 1 
  //           ? seg.reviewData.tmScore * 100 
  //           : seg.reviewData.tmScore;
  //     } else if (seg.translated && seg.translated.trim() !== "" && seg.translated.trim() !== "— Awaiting translation —") {
  //         rawScore = 100;
  //     }

  //     const score = Math.round(rawScore);

  //     // Exact Classification Logic
  //     if (score >= 95) {
  //         exact++;      // Tier 1: Exact Match
  //     } else if (score >= 70) {
  //         fuzzy++;      // Tier 2: Fuzzy / Context Match
  //     }
  //   });

  //   const total = mergedSegments.length;
    
  //   // Exact Leverage Rate formula
  //   const leverageRate = total > 0 ? Math.round(((exact + fuzzy) / total) * 100) : 0;

  //   // 3. Set the state so the Draft Panel receives it
  //   setTmLeveragePct(leverageRate);
  // }, [segments, segOverrides]);

  // FIXED: Auto-calculate using the EXACT Average Logic from TMLeverageOverview
  //Hari
  useEffect(() => {
    // 1. Merge segments with user overrides so we have the latest text/scores
    const mergedSegments = segments.map((s) => {
      const o = segOverrides[s.id] || {};
      return { ...s, ...o };
    });

    if (mergedSegments.length === 0) {
      setTmLeveragePct(0);
      return;
    }

    // 2. Sum up the scores exactly as TMLeverageOverview does
    let totalScore = 0;
    
    mergedSegments.forEach((seg) => {
      let rawScore = 0;

      if (typeof seg.matchScore === 'number') {
          rawScore = seg.matchScore;
      } else if (seg.reviewData && typeof seg.reviewData.tmScore === 'number') {
          rawScore = seg.reviewData.tmScore <= 1 
            ? seg.reviewData.tmScore * 100 
            : seg.reviewData.tmScore;
      } else if (seg.translated && seg.translated.trim() !== "" && seg.translated.trim() !== "— Awaiting translation —") {
          rawScore = 100;
      }

      totalScore += Math.round(rawScore);
    });

    // 3. Calculate the true Average and set it
    const avg = Math.round(totalScore / mergedSegments.length);
    setTmLeveragePct(avg);
  }, [segments, segOverrides]);



  const [draftPrepared, setDraftPrepared] = useState(false); // to control empty state
  const [tmMatchInfo, setTmMatchInfo] = useState({}); // Stores match percentages by segment ID [cite: 34, 89]

  /** Resolved selected with overrides applied (display only) */
  const selectedResolved = useMemo(() => {
    if (!selected) return null;
    const o = segOverrides[selected.id] || {};
    return { ...selected, ...o };
  }, [selected, segOverrides]);

  /** Helper: has real translated string? */
  const hasRealTranslation = (s) => {
    const t = (s?.translated || "").trim();
    return t.length > 0 && t !== "— Awaiting translation —";
  };

  /** Detail card enabled iff we have real translation */
  const isDetailEnabled = useMemo(() => hasRealTranslation(selectedResolved), [selectedResolved]);

  /** When switching segments, keep detail disabled until translation exists */
  

  /** Progress respects overrides */
  const progressWords = useMemo(() => {
    const total = segments.reduce((acc, s) => acc + (s.words || 0), 0);
    const done = segments.reduce((acc, s) => {
      const o = segOverrides[s.id];
      const translated = (o?.translated ?? s.translated ?? "").trim();
      const status = o?.status ?? s.status;
      if (translated.length > 0 || status === "Completed") acc += (s.words || 0);
      return acc;
    }, 0);
    return total > 0 ? { done, total } : progressWordsProp;
  }, [segments, segOverrides, progressWordsProp]);

  const progressPct = useMemo(() => {
    const pct = (progressWords.done / Math.max(progressWords.total, 1)) * 100;
    return Math.round(pct);
  }, [progressWords]);

  /** ===== Phase‑2 Complete gate (same UX as Cultural page) ===== 10_03*/
 
  // Count how many segments still missing a real translation (or explicit Completed status)
  const remainingP2Segments = useMemo(() => {
    return segments.filter((s) => {
      const o = segOverrides[s.id];
      const translated = (o?.translated ?? s.translated ?? "").trim();
      const status = (o?.status ?? s.status) || (translated ? "Completed" : "Pending");
      const hasReal = translated.length > 0 && translated !== "— Awaiting translation —";
      return !(hasReal || status === "Completed");
    }).length;
  }, [segments, segOverrides]);
 
  // Reuse your existing allSegmentsCompleted + not bulk translating
  const canCompleteP2 = allSegmentsCompleted && !isBulkTranslating;
 
  // Tooltip text identical to the Cultural page style
  const p2Tooltip = canCompleteP2
    ? "Proceed to Cultural Intelligence"
    : `${remainingP2Segments} segment(s) still missing translation`;
 
  /** Sidebar navigation (original) */
  const handlePhaseClick = (phaseName) => {
    if (phaseName === "Global Context Capture") {
      navigate("/globalAssetCapture", {
        state: { projectName, segments, lang: inboundLang, country },
      });
    }
  };

  /** Merge UI overrides into base segments */
  const mergeSegmentsWithOverrides = (segmentsArr, overrides) => {
    if (!Array.isArray(segmentsArr)) return [];
    return segmentsArr.map((s) => {
      const o = overrides?.[s.id] || {};
      return {
        ...s,
        ...(o.translated !== undefined ? { translated: o.translated } : {}),
        ...(o.status !== undefined ? { status: o.status } : {}),
        ...(o.reviewData !== undefined ? { reviewData: o.reviewData}: {}),
      };
    });
  };

  /** Complete Phase */
  // const handleCompletePhase = () => {
  //   const mergedSegments = mergeSegmentsWithOverrides(segments, segOverrides);
  //   navigate("/culturalAdaptationWorkspace", {
  //     state: {
  //       projectName,
  //       segments: mergedSegments,
  //       lang: inboundLang,
  //     },
  //   });
  // };

  /** Complete Phase → go to Cultural Adaptation (preserving translated text) */
  /** Complete Phase → go to Cultural Adaptation (preserving translated text) */
  //Hari
  // const handleCompletePhase = async()=> {
  //   if (!allSegmentsCompleted) {
  //     alert("Please translate all segments before completing this phase.");
  //     return;
  //   }
    
  //   const mergedSegments = mergeSegmentsWithOverrides(segments, segOverrides).map(s => ({
  //     ...s,
  //     tmStatus: (s.translated?.trim() ? "Completed" : "Pending"),
  //     ciStatus: "Pending", // always start P3 as pending
  //   }));

  //   // ✅ Persist P2 outputs for downstream resume AND seed P3
  //   //Hari
  //   await updateProjectMeta(projectId, { 
  //     segmentsP2: mergedSegments,
  //     //segmentsP3: mergedSegments // 🆕 SEED PHASE 3 SO IT HAS DATA IMMEDIATELY
  //   });

  //   const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
  //   console.log('DB meta.segmentsP2', db[projectId]?.meta?.segmentsP2);
   
  //   await updateProjectMeta(projectId, { segmentsP2: mergedSegments });
  //   await markPhaseComplete(projectId, 'P2');     
  //   navigate("/culturalAdaptationWorkspace", {
  //     state: {
  //       projectId,
  //       projectName,
  //       segments: mergedSegments, // ✅ entire segments list, with translated content included
  //       // 🆕 propagate lang
  //       lang: inboundLang,
  //     },
  //   });
  // };

  //Hari
  const handleCompletePhase = async () => {
    if (!allSegmentsCompleted) {
      alert("Please translate all segments before completing this phase.");
      return;
    }
   
    const mergedSegments = mergeSegmentsWithOverrides(segments, segOverrides).map(s => ({
      ...s,
      tmStatus: (s.translated?.trim() ? "Completed" : "Pending"),
      ciStatus: "Pending", // always start P3 as pending
    }));
 
    // 1. Persist P2 outputs
    await updateProjectMeta(projectId, {
      segmentsP2: mergedSegments,
    });
 
    // 2. Mark Phase Complete (Updates storage and dispatches event)
    await markPhaseComplete(projectId, 'P2');
 
    // ✅ FIX: Micro-delay to ensure the Sidebar receives the "50%" update event
    // before the navigation clears the current component state.
    await new Promise(resolve => setTimeout(resolve, 50));
 
    const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
    console.log('DB meta.segmentsP2 after markPhaseComplete:', db[projectId]?.meta?.segmentsP2);
   
    // 3. Navigate to Phase 3
    navigate("/culturalAdaptationWorkspace", {
      state: {
        projectId,
        projectName,
        segments: mergedSegments,
        lang: inboundLang,
        forceRefresh: true, // Hint for the next page to fetch fresh data
        country
      },
    });
  };
 
 

  // /** Single segment translate (kept, via single endpoint if you need it) */
  // const handleAiTranslate = async () => {
  //   if (!selected) return;
  //   if (!N8N_WEBHOOK_URL) {
  //     setTranslationError("N8N_WEBHOOK_URL is not configured.");
  //     return;
  //   }

  //   setIsTranslating(true);
  //   setTranslationError(null);

  //   setSegOverrides((prev) => ({
  //     ...prev,
  //     [selected.id]: {
  //       ...prev[selected.id],
  //       translated: "— Awaiting translation —",
  //       status: "Pending",
  //     },
  //   }));

  //   try {
  //     const translated = await translateOneSegment(selected);
  //     setSegOverrides((prev) => ({
  //       ...prev,
  //       [selected.id]: {
  //         ...prev[selected.id],
  //         translated: translated || "— Awaiting translation —",
  //         status: translated ? "Completed" : "Pending",
  //       },
  //     }));
  //   } catch (err) {
  //     setTranslationError(err.message || "Translation failed.");
  //     setSegOverrides((prev) => ({
  //       ...prev,
  //       [selected.id]: {
  //         ...prev[selected.id],
  //         status: "Pending",
  //       },
  //     }));
  //   } finally {
  //     setIsTranslating(false);
  //   }
  // };

   // -----------------------------------------------------------------------
  // REPLACE YOUR EXISTING handleAiTranslate FUNCTION WITH THIS ONE
  // -----------------------------------------------------------------------
  const handleAiTranslate = async () => {
    if (!selected) return;

    // 1. Validation Checks
    if (!N8N_WEBHOOK_URL) {
      setTranslationError("N8N_WEBHOOK_URL is not configured.");
      return;
    }
    if (segOverrides[selected.id]?.status === "Completed") {
      return; // Already done
    }

    // 2. UI Feedback: "Thinking..."
    setIsTranslating(true);
    setTranslationError(null);

    
    //Hari - ADD THESE 3 LINES HERE AS WELL
    setIsDraftUnlocked(false);
    localStorage.removeItem(`p2_draft_generated_${projectId}`);
    try { updateProjectMeta(projectId, { p2DraftGenerated: false }); } catch(e) {}

    setSegOverrides((prev) => ({
      ...prev,
      [selected.id]: {
        ...prev[selected.id],
        translated: "— Analyzing TM & Glossary —",
        status: "Pending",
      },
    }));

    try {
      const targetLang = inboundLang; // e.g., "DE" or "Chinese"
      const sourceLang = "English";

      // ---------------------------------------------------------
      // STEP 1: SMART LOOKUP (The "Brain" API)
      // ---------------------------------------------------------
      const lookupRes = await fetch(
        "https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/smart-tm-lookup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_text: selected.source,
            target_lang: targetLang,
          }),
        },
      );

      if (!lookupRes.ok) throw new Error("Smart TM Lookup failed");
      const decision = await lookupRes.json();
      console.log("🧠 Smart TM Decision:", decision);

      let finalTranslation = "";
      let matchBadgeValue = 0;
      let statusLabel = "Completed"; // Default

      // ---------------------------------------------------------
      // STEP 2: EXECUTE DECISION (3 Tiers)
      // ---------------------------------------------------------

      // --- TIER 1: HIGH MATCH (>= 95%) -> REUSE ---
      if (decision.action === "reuse") {
        console.log(`Exact Match Found (${decision.score * 100}%). Reuse.`);
        finalTranslation = decision.translation;
        matchBadgeValue = Math.round(decision.score * 100);
        statusLabel = "Completed"; // Auto-approve high matches
      }

      // --- TIER 2: HYBRID / CONTEXT MATCH (70% - 94%) -> REVIEW NEEDED ---
      else if (decision.action === "context") {
        console.log(
          `Hybrid Match (${decision.score * 100}%). Enforcing Glossary & Context.`,
        );

        // Set Status to "Review Needed" so user MUST click "View Analysis"
        statusLabel = "Review Needed";
        matchBadgeValue = Math.round(decision.score * 100);

        // Call AI with Context + Glossary Hints
        const payload = {
          segmentId: selected.id,
          projectName,
          source: selected.source,
          sourceLang,
          targetLang,
          inboundLang,
          fuzzyMatch: decision.context_target, // Pass the previous translation as style guide
          glossaryHints: decision.glossary || [], // Pass mandatory terms
          meta: {
            brand_id: state?.brand_id,
            tm_score: decision.score,
          },
        };

        const aiRes = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(N8N_AUTH ? { Authorization: N8N_AUTH } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!aiRes.ok) throw new Error(`n8n Error: ${aiRes.status}`);
        finalTranslation = (await extractTranslated(aiRes)).trim();
      }

      // --- TIER 3: LOW MATCH (< 70%) -> FULL AI ---
      else {
        console.log(`Low/No Match. Full AI Generation.`);
        statusLabel = "Completed"; // Standard AI translation is auto-completed
        matchBadgeValue = 0;

        const payload = {
          segmentId: selected.id,
          projectName,
          source: selected.source,
          sourceLang,
          targetLang,
          inboundLang,
          fuzzyMatch: "", // No context
          glossaryHints: decision.glossary || [], // We still send glossary if we found any!
          meta: { tm_score: 0 },
        };

        const aiRes = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(N8N_AUTH ? { Authorization: N8N_AUTH } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!aiRes.ok) throw new Error(`n8n Error: ${aiRes.status}`);
        finalTranslation = (await extractTranslated(aiRes)).trim();
      }

      // ---------------------------------------------------------
      // STEP 3: FINALIZE & UPDATE UI
      // ---------------------------------------------------------
      if (finalTranslation && finalTranslation !== "— Awaiting translation —") {
        // A. Save to DB (Only if NOT reusing an exact match)
        // Note: For "Review Needed", we technically save the draft now,
        // but the user will approve/overwrite it in the Analysis page later.
        if (decision.action !== "reuse") {
          await saveTranslationToDb(
            selected.source,
            finalTranslation,
            sourceLang,
            targetLang,
            projectName,
          );
        }

        // // B. Prepare Data for Analysis Page
        // const formattedGlossary = {};
        // if (Array.isArray(decision.glossary)) {
        //   decision.glossary.forEach((item) => {
        //     formattedGlossary[item.term] = item.translation;
        //   });
        // }

        // // C. Update UI
        // setSegOverrides((prev) => ({
        //   ...prev,
        //   [selected.id]: {
        //     ...prev[selected.id],
        //     translated: finalTranslation,
        //     status: statusLabel,
        //     // Important: Store data for the Analysis Page
        //     reviewData: {
        //       tmScore: decision.score,
        //       glossaryUsed: formattedGlossary,
        //       maskedSource: selected.source,
        //     },
        //   },
        // }));

        // // D. Update Badge
        // if (typeof setTmMatchInfo === "function") {
        //   setTmMatchInfo((prev) => ({
        //     ...prev,
        //     [selected.id]: matchBadgeValue,
        //   }));
        // }
        // B. Prepare Data for Analysis Page
        const formattedGlossary = {};
        if (Array.isArray(decision.glossary)) {
          decision.glossary.forEach((item) => {
            formattedGlossary[item.term] = item.translation;
          });
        }

        // ✅ 1. CREATE the updated data object for this specific segment
        const newSegmentData = {
          translated: finalTranslation,
          status: statusLabel,
          reviewData: {
            tmScore: decision.score,
            glossaryUsed: formattedGlossary,
            maskedSource: selected.source,
          },
        };

        // ✅ 2. AWAIT the project database save FIRST to strictly prevent the race condition!
        // const updatedOverrides = {
        //   ...segOverrides,
        //   [selected.id]: {
        //     ...(segOverrides[selected.id] || {}),
        //     ...newSegmentData
        //   }
        // };
        // await updateProjectMeta(projectId, { segmentsP2: updatedOverrides });
        // ✅ 2. AWAIT the project database save FIRST to strictly prevent the race condition!
        const updatedOverrides = {
          ...segOverrides,
          [selected.id]: {
            ...(segOverrides[selected.id] || {}),
            ...newSegmentData
          }
        };
        
        // ✅ FIXED: Convert the overrides dictionary back into an Array before saving!
        const mergedSegmentsToSave = mergeSegmentsWithOverrides(segments, updatedOverrides);
        await updateProjectMeta(projectId, { segmentsP2: mergedSegmentsToSave });

        // ✅ 3. THEN update the UI (This safely triggers the banner only AFTER the DB is secure)
        setSegOverrides((prev) => ({
          ...prev,
          [selected.id]: {
            ...prev[selected.id],
            ...newSegmentData
          },
        }));

        // D. Update Badge
        if (typeof setTmMatchInfo === "function") {
          setTmMatchInfo((prev) => ({
            ...prev,
            [selected.id]: matchBadgeValue,
          }));
        }
      }
    } catch (err) {
      console.error("Translation logic error:", err);
      setTranslationError(err.message || "Translation failed.");
      setSegOverrides((prev) => ({
        ...prev,
        [selected.id]: {
          ...prev[selected.id],
          translated: "— Failed —",
          status: "Pending",
        },
      }));
    } finally {
      setIsTranslating(false);
    }
  };

  /** Helper: translate one segment via n8n (single endpoint) */
  async function translateOneSegment(seg) {
    const targetLang = inboundLang;

    const payload = {
      segmentId: seg.id,
      index: seg.index,
      projectName,
      source: seg.source,
      sourceLang: "EN",
      targetLang,
      inboundLang,
      meta: {
        therapyArea,
        words: seg.words,
        tmLeverage: tmLeverageOn,
        sourceLangFromPrev: inboundLang,
      },
    };

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_AUTH ? { Authorization: N8N_AUTH } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`n8n responded with ${res.status}: ${txt}`);
    }

    const translated = (await extractTranslated(res)).trim();
    return translated;
  }

  /** Mark selected segment complete (overlay only) */
  const handleCompleteSegment = () => {
    if (!selected) return;
    setSegOverrides((prev) => ({
      ...prev,
      [selected.id]: {
        ...prev[selected.id],
        status: "Completed",
      },
    }));
  };

  /** Bulk: send all pending segments in ONE request — and then auto-prep Draft tab */
//   const handleTranslateAllClick = async () => {
//     if (!N8N_BULK_WEBHOOK_URL) {
//       setTranslationError("N8N_BULK_WEBHOOK_URL is not configured.");
//       return;
//     }

//     const pending = segments.filter((s) => {
//       const o = segOverrides[s.id];
//       const mergedTranslated = (o?.translated ?? s.translated ?? "").trim();
//       const mergedStatus = o?.status ?? s.status;
//       return !(mergedTranslated.length > 0 || mergedStatus === "Completed");
//     });

//     if (pending.length === 0) {
//       // Already translated → show draft tab (hide banner on draft)
//       // const mergedSegmentsNow = mergeSegmentsWithOverrides(segments, segOverrides);
//       // setDraftSegments(mergedSegmentsNow);
//       // setTmLeveragePct(0);
//       // setDraftPrepared(true);
//       // setActiveTab("draft");
//       // setShowGenerateDraft(false); 
//       setShowGenerateDraft(allSegmentsCompleted && !isDraftUnlocked);
//       return;
//     }

//     // Show placeholders for pending segments while bulk call runs
//     setSegOverrides((prev) => {
//       const next = { ...prev };
//       for (const s of pending) {
//         next[s.id] = {
//           ...next[s.id],
//           translated: "— Awaiting translation —",
//           status: "Pending",
//         };
//       }
//       return next;
//     });

//     setBulkProgress({ done: 0, total: pending.length, failed: 0 });
//     setShowGenerateDraft(false);
//     setIsBulkTranslating(true);
//     setTranslationError(null);

//     //Hari
//     setIsDraftUnlocked(false);
//     localStorage.removeItem(`p2_draft_generated_${projectId}`);
//     try { updateProjectMeta(projectId, { p2DraftGenerated: false }); } catch(e) {}

//     try {
//       const targetLang = getTargetLang(therapyArea);

//       const payload = {
//         projectName,
//         sourceLang: "EN",
//         targetLang,
//         inboundLang,
//         tmLeverageOn,
//         therapyArea,
//         segments: pending.map((s) => ({
//           segmentId: s.id,
//           index: s.index,
//           source: s.source,
//           words: s.words,
//         })),
//       };

//       const res = await fetch(N8N_BULK_WEBHOOK_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(N8N_AUTH ? { Authorization: N8N_AUTH } : {}),
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(`Bulk n8n responded with ${res.status}: ${txt}`);
//       }

//       // Parse translations from bulk response (handles your screenshot shape)
//       const byKey = await extractBulkTranslations(res, pending);

//       // Apply overrides from returned items
//       let translatedCount = 0;
//       //const locallyMergedOverrides = { ...segOverrides };
//       const updates ={};

//       for (const s of pending) {
//         const candidates = keyVariantsForSegment(s);
//         const translatedRaw = candidates
//           .map((k) => byKey[k])
//           .find((v) => typeof v === "string" && v.trim().length > 0);

//         const translated = (translatedRaw || "").trim();

//         if (translated) {
//           translatedCount += 1;
//           // locallyMergedOverrides[s.id] = {
//           //   ...(locallyMergedOverrides[s.id] || {}),
//           //   translated,
//           //   status: "Completed",
//           // };
//           updates[s.id] = {
//             translated, status : "Completed", 
//             reviewData : {tmScore:1}
//           };
//         } else {
//           // locallyMergedOverrides[s.id] = {
//           //   ...(locallyMergedOverrides[s.id] || {}),
//           //   status: "Pending",
//           // };
//           updates[s.id] ={
//             status : "Pending",
//           };
//         }
//       }

//       setSegOverrides((prev) => {
//         const next = { ...prev };
//         for (const [id, data] of Object.entries(updates)) {
//           next[id] = { ...(next[id] || {}), ...data };
//         }
//         return next;
//       });

//       // setBulkProgress({
//       //   done: translatedCount,
//       //   total: pending.length,
//       //   failed: Math.max(pending.length - translatedCount, 0),
//       // });

//       // Prepare and switch to 'draft' tab with merged segments (hide banner)
//       // const mergedSegmentsFinal = mergeSegmentsWithOverrides(segments, locallyMergedOverrides);
//       // setDraftSegments(mergedSegmentsFinal);
//       // setTmLeveragePct(0);
//       // setDraftPrepared(true);
//       // setActiveTab("draft");
//       // setShowGenerateDraft(false); 
      
// // Do NOT auto-switch to Draft; just show the "Generate Draft Translation" banner
// setShowGenerateDraft(true);

//     } catch (err) {
//       setTranslationError(err.message || "Bulk translation failed.");
//       setBulkProgress((bp) => ({ ...bp, failed: bp.total - bp.done }));
//     } finally {
//       setIsBulkTranslating(false);
//     }
//   };
    /** Bulk: send all pending segments to TM Brain, then to AI, and auto-prep Draft tab */
  const handleTranslateAllClick = async () => {
    // 1. Validation
    if (!N8N_BULK_WEBHOOK_URL) {
      setTranslationError("N8N_BULK_WEBHOOK_URL is not configured.");
      return;
    }

    // Filter segments that actually need work 
    const pendingSegments = segments.filter((s) => {
      const o = segOverrides[s.id];
      const mergedTranslated = (o?.translated ?? s.translated ?? "").trim();
      const mergedStatus = o?.status ?? s.status;
      return !(mergedTranslated.length > 0 || mergedStatus === "Completed");
    });

    if (pendingSegments.length === 0) {
      // ✅ FIXED: Show banner instead of auto-navigating to draft
      setShowGenerateDraft(allSegmentsCompleted && !isDraftUnlocked);
      return;
    }

    // 2. UI Setup & Safety Locks
    setIsBulkTranslating(true);
    setTranslationError(null);
    setBulkProgress({ done: 0, total: pendingSegments.length, failed: 0 });
    setShowGenerateDraft(false);

    // ✅ FIXED: Lock the Draft Tab securely while processing
    setIsDraftUnlocked(false);
    localStorage.removeItem(`p2_draft_generated_${projectId}`);
    try { updateProjectMeta(projectId, { p2DraftGenerated: false }); } catch(e) {}

    // ✅ FIXED: Set safe placeholders so the progress bar doesn't falsely complete
    setSegOverrides((prev) => {
      const next = { ...prev };
      for (const s of pendingSegments) {
        next[s.id] = {
          ...next[s.id],
          translated: "— Analyzing TM & Glossary —",
          status: "Pending",
        };
      }
      return next;
    });

    try {
      // ---------------------------------------------------------
      // STEP 1: BULK SMART LOOKUP (Check Python Brain)
      // ---------------------------------------------------------
      console.log("🧠 Checking TM for all segments...");
      
      const lookupRes = await fetch("https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/smart-tm-lookup-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_texts: pendingSegments.map(s => s.source),
          target_lang: inboundLang
        })
      });

      const decisions = await lookupRes.json(); // Array of { action, score, translation... }

      // ---------------------------------------------------------
      // STEP 2: SORT & APPLY EXACT MATCHES
      // ---------------------------------------------------------
      const segmentsToGenerate = [];
      const updates = {};
      let completedCount = 0;

      pendingSegments.forEach((seg, index) => {
        const decision = decisions[index];

        if (decision && decision.action === "reuse") {
          // TIER 1: Exact Match from DB -> Apply immediately!
          console.log(`♻️ Reusing exact match for Seg ${seg.index}`);
          updates[seg.id] = {
            translated: decision.translation,
            status: "Completed",
            reviewData: { tmScore: decision.score } // ✅ Properly assigns the TM Score!
          };
          completedCount++;
        } else {
          // TIER 2 & 3: Needs AI Generation via N8N
          segmentsToGenerate.push({
            id: seg.id,
            segmentId: seg.id,
            index: seg.index,
            source: seg.source,
            words: seg.words,
            fuzzyContext: decision?.context_target, 
            glossary: decision?.glossary || []
          });
        }
      });
      
      // Update UI with exact matches immediately
      setSegOverrides(prev => {
        const next = { ...prev };
        for (const [id, data] of Object.entries(updates)) next[id] = { ...next[id], ...data };
        return next;
      });
      setBulkProgress({ done: completedCount, total: pendingSegments.length, failed: 0 });

      // ---------------------------------------------------------
      // STEP 3: BATCH CALL TO N8N (Only for the remaining ones)
      // ---------------------------------------------------------
      if (segmentsToGenerate.length > 0) {
        console.log(`🤖 Sending ${segmentsToGenerate.length} segments to AI...`);
        
        // Update placeholders to show AI is working
        setSegOverrides((prev) => {
          const next = { ...prev };
          for (const s of segmentsToGenerate) {
            next[s.id] = { ...next[s.id], translated: "— Awaiting translation —" };
          }
          return next;
        });
        
        const payload = {
          projectName,
          sourceLang: "English",
          targetLang: inboundLang,
          therapyArea: `Respiratory · ${inboundLang}`,
          tmLeverageOn,
          // We map the segments to include context hints right in the prompt
          segments: segmentsToGenerate.map(s => ({
             segmentId: s.segmentId,
             index: s.index,
             source: s.fuzzyContext 
               ? `[Context: Similar previous translation was "${s.fuzzyContext}"] ${s.source}` 
               : s.source,
             words: s.words
          })),
          glossaryHints: segmentsToGenerate.flatMap(s => s.glossary)
        };

        const n8nRes = await fetch(N8N_BULK_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(N8N_AUTH ? { Authorization: N8N_AUTH } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!n8nRes.ok) throw new Error("AI Generation failed");

        // ✅ KEY FIX: Use your existing, bulletproof extraction logic
        const byKey = await extractBulkTranslations(n8nRes, segmentsToGenerate);
        
        // Merge AI results into updates
        for (const s of segmentsToGenerate) {
          const candidates = keyVariantsForSegment(s);
          const translatedRaw = candidates
            .map((k) => byKey[k])
            .find((v) => typeof v === "string" && v.trim().length > 0);

          const translated = (translatedRaw || "").trim();

          if (translated) {
            updates[s.id] = {
              translated,
              status: "Completed",
              reviewData: { tmScore: 0 } // ✅ Explicitly marks AI generations as 0% TM Match!
            };
            completedCount++;
          } else {
            updates[s.id] = { status: "Pending" };
          }
        }
      }

      // ---------------------------------------------------------
      // STEP 4: FINAL UI UPDATE & SAVE
      // ---------------------------------------------------------
      setSegOverrides((prev) => {
        const next = { ...prev };
        for (const [id, data] of Object.entries(updates)) {
          next[id] = { ...(next[id] || {}), ...data };
        }
        return next;
      });
      
      setBulkProgress({ done: completedCount, total: pendingSegments.length, failed: pendingSegments.length - completedCount });

      console.log("💾 Saving all new translations to DB...");
      
      // Save newly generated AI translations to DB
      const itemsToSave = segmentsToGenerate.map(s => {
        const finalTrans = updates[s.id]?.translated;
        if (finalTrans) {
            return {
                document_name: projectName,
                source_text: s.source,
                target_text: finalTrans,
                source_language: "English",
                target_language: inboundLang
            };
        }
        return null;
      }).filter(Boolean);

      if (itemsToSave.length > 0) {
        // Non-blocking DB save
        fetch("https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/translated-content/bulk", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ items: itemsToSave })
        }).catch(err => console.warn("Background DB save failed", err));
      }
      
      // ✅ FIXED: Show the Generate Draft Banner (Instead of Auto-Navigating)
      setTimeout(() => {
          setIsBulkTranslating(false);
          setShowGenerateDraft(true); 
      }, 500);

    } catch (err) {
      console.error(err);
      setTranslationError("Bulk processing failed: " + err.message);
      setIsBulkTranslating(false);
    }
  };
  /** Generate Draft Translation → switch to Draft tab on the same page (hide banner) */
  // const handleGenerateDraftTranslation = () => {
  //   const mergedSegments = mergeSegmentsWithOverrides(segments, segOverrides);
  //   setDraftSegments(mergedSegments);
  //   setTmLeveragePct(0);
  //   setDraftPrepared(true);
  //   setActiveTab("draft");
  //   setShowGenerateDraft(false); 
  // };

  /** Generate Draft Translation → switch to Draft tab and unlock it */
const handleGenerateDraftTranslation = () => {
  const mergedSegments = mergeSegmentsWithOverrides(segments, segOverrides);
  setDraftSegments(mergedSegments);
  setTmLeveragePct(0);
  setDraftPrepared(true);
  setIsDraftUnlocked(true);       // 🔓 unlock Draft tab
  setActiveTab("draft");          // go to Draft tab
  setShowGenerateDraft(false);    // hide the success banner
   
  // ✅ Persist "draft generated" so it survives navigation/refresh
  // try {
  //   updateProjectMeta(projectId, {
  //     segmentsP2: mergedSegments,           
  //     p2DraftGeneratedAt: new Date().toISOString(),
  //     p2DraftGenerated: true,
  //   });
  // } catch (e) {
  //   console.warn("Failed to persist draft generated flag", e);
  // }
   setP2DraftGenerated(projectId, true, { segmentsP2: mergedSegments });
  // Optional localStorage fallback (project-scoped key)
  localStorage.setItem(`p2_draft_generated_${projectId}`, "true");
};

  /** Send to CI (from Draft panel) */
  // const handleSendToCI = (normalizedDraftSegments) => {
  //   navigate("/culturalAdaptationWorkspace", {
  //     state: {
  //       projectName,
  //       segments: normalizedDraftSegments,
  //       lang: inboundLang,
  //       therapyArea,
  //     },
  //   });
  // };
  /** Send to CI (from Draft panel) */
  //Hari - 24/3
  // const handleSendToCI = async (normalizedDraftSegments) => {
    
  //   // Persist P2 + "draft generated" flag before leaving
  //   // try {
  //   //   updateProjectMeta(projectId, {
  //   //     segmentsP2: normalizedDraftSegments,
  //   //     p2DraftGenerated: true,
  //   //     p2DraftGeneratedAt: new Date().toISOString(),
  //   //   });
  //   // } catch (e) {
  //   //   console.warn('Failed to persist segmentsP2 before sending to CI', e);
  //   // }
  //   //Hari - 24/3
  //   await setP2DraftGenerated(projectId, true, { segmentsP2: normalizedDraftSegments });
  //   localStorage.setItem(`p2_draft_generated_${projectId}`, "true");
  //   await markPhaseComplete(projectId, 'P2');    
  //     navigate("/culturalAdaptationWorkspace", {
  //       state: {
  //         projectId,
  //         projectName,
  //         segments: normalizedDraftSegments,
  //         lang: inboundLang,
  //         therapyArea,
  //         fromDraft: true, // optional: for any additional UX control on CI
  //       },
  //     });
  //   };

  //Hari-25/3
  const handleSendToCI = async (normalizedDraftSegments) => {

    // 1. Persist P2 and the draft flag (Updates metadata)

    // This helper from progressStore.js already calls updateProjectMeta

    await setP2DraftGenerated(projectId, true, { segmentsP2: normalizedDraftSegments });

    // 2. Local fallback flag

    localStorage.setItem(`p2_draft_generated_${projectId}`, "true");

    // 3. Mark Phase Complete (Updates storage and dispatches 'glocal_progress_updated')

    await markPhaseComplete(projectId, 'P2');
 
    // ✅ FIX: Micro-delay to ensure the Sidebar and Progress logic 

    // "catch" the P2 completion event before the current page unmounts.

    await new Promise(resolve => setTimeout(resolve, 50));
 
    // 4. Navigate to Cultural Intelligence

    navigate("/culturalAdaptationWorkspace", {

      state: {

        projectId,

        projectName,

        segments: normalizedDraftSegments,

        lang: inboundLang,

        therapyArea,

        country,

        fromDraft: true,

        forceRefresh: true // Hint for the next page to fetch fresh data

      },

    });

  };
 

  return (
    <div className={`tm-app ${isFocusMode ? 'is-focus' : ''}`} data-page="tm">
      {/* Sidebar */}
      <aside className="tm-sidebar">
        {/* Global Progress Section */}
        {/* <div className="tm-sidebar-progress">
          <div className="tm-progress-row">
            <span className="tm-progress-label">Overall Progress</span>
            <span className="tm-progress-value">{overallPercent}%</span>
          </div>
          <div className="tm-progress-sub">{completedCount} of {totalTarget} phases completed</div>
         
          <div className="tm-progress-bar">
            <div
              className="tm-progress-fill"
              style={{ width: `${overallPercent}%`, transition: 'width 0.4s ease-out' }}
            />
          </div>
        </div> */}
        {/* Global Progress Section */}
        {/*Hari-24/3*/}
        <div className="tm-sidebar-progress" style={{ opacity: isProgressLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
          <div className="tm-progress-row">
            <span className="tm-progress-label">Overall Progress</span>
            {/* 🆕 Show ... while loading */}
            <span className="tm-progress-value">{isProgressLoading ? "..." : `${overallPercent}%`}</span>
          </div>
          {/* 🆕 Show Syncing... while loading */}
          <div className="tm-progress-sub">{isProgressLoading ? "Loading..." : `${completedCount} of ${totalTarget} phases completed`}</div>
         
          <div className="tm-progress-bar">
            <div
              className="tm-progress-fill"
              style={{ width: `${overallPercent}%`, transition: 'width 0.4s ease-out' }}
            />
          </div>
        </div>
 
        {/* Phase Navigation */}
        <nav className="tm-phases">
          {SIDEBAR_PHASES.map((p) => {
            // Check if the phase is completed globally
            const isDone = completedSet.has(p.id.toUpperCase());
 
            return (
              <button
                key={p.id}
                // If it's done, force the 'done' status. Otherwise, use its default status.
                className={`tm-phase-item ${isDone ? "done" : p.status} ${p.status === "active" ? "is-active" : ""}`}
                aria-label={`Open ${p.name}`}
                onClick={() => gotoPhase(p.id)}
              >
                {/* <span className={`tm-phase-icon ${p.iconClass}`} /> */}
                <span className={`tm-phase-icon ${p.color || ''}`}>{p.icon}</span>
                <span className="tm-phase-text">
                  <span className="tm-phase-title">{p.name}</span>
                  <span className="tm-phase-sub">{p.sub}</span>
                </span>
               
                {/* Show checkmark if completed globally */}
                {isDone && !isProgressLoading && <span className="tm-phase-check">✓</span>}
                {/* Show dot if active but not yet completed */}
                {p.status === "active" && !isDone && !isProgressLoading && <span className="tm-phase-dot" />}
              </button>
            );
          })}
        </nav>
      </aside>

  {/* Main */}
      <div className="tm-main">
        {/* Header */}
        <header className="tm-header py-3 px-4">
      <div className="tm-crumbs">
          <button className="tm-crumb" onClick={() => navigate('/')}>
          <ArrowLeft size={14} className="h-1 w-1 mr-2" /> Main Hub
          </button>
          <span className="tm-divider"></span>
          <button className="tm-crumb" onClick={() => navigate('/glocalizationHub')}>
            Glocalization Hub
          </button>
        </div>
      {/* Center: Title */}
        <div className="tm-title-section">
          <h1 className="tm-page-title">{projectName}</h1>
          {/* <span className="tm-title-sub">{therapyArea}</span> */}
        </div>
            
      {/* Right: Saved + Buttons */}
        <div className="tm-header-right">
          <span className="tm-saved"> <CheckCircle2 size={12} className="h-1 w-1 text-green-600" />
          Saved</span>
          <button className="tm-btn-outline">
          <Save size={15} className="h-4 w-4 mr-2" /> Save
          </button>
          
<button
              className="tm-btn-outline"
              onClick={toggleFocusMode}
              aria-pressed={isFocusMode}
              title={isFocusMode ? 'Exit focus (Esc)' : 'Enter focus (F)'}
            >
              {isFocusMode ? (
                <>
                  <Minimize2 size={16} /> Exit
                </>
              ) : (
                <>
                  <Maximize2 size={16} /> Focus
                </>
              )}
            </button>

        </div>
      </header>

        {/* Top tabs bar */}
        <section className="tm-tabs-bar">
  <div className="tm-tabs">
    <button
      className={`tm-tab ${activeTab === 'workspace' ? 'is-active' : ''}`}
      onClick={() => setActiveTab('workspace')}
    >
      <FileText className="tm-tab-icon" />
      Translation Workspace
    </button>

    {/* <button
      className={`tm-tab ${activeTab === 'draft' ? 'is-active' : ''}`}
      onClick={() => setActiveTab('draft')}
    >
      <CheckCircle className="tm-tab-icon" />
      Draft Translation
    </button> */}

    {/* <button
  className={`tm-tab ${activeTab === 'draft' ? 'is-active' : ''} ${!isDraftUnlocked ? 'is-disabled' : ''}`}
  onClick={() => isDraftUnlocked && setActiveTab('draft')}
  disabled={!isDraftUnlocked}
  title={isDraftUnlocked ? 'Open Draft Translation' : 'Generate Draft Translation to open'}
>
  <CheckCircle className="tm-tab-icon" />
  Draft Translation
</button> */}
<button
            className={`tm-tab ${activeTab === "draft" ? "is-active" : ""} ${!isDraftUnlocked ? "is-locked" : ""}`}
            onClick={() => {
              if (isDraftUnlocked) setActiveTab("draft");
            }}
            style={!isDraftUnlocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            title={!isDraftUnlocked ? "Please translate all segments to unlock the Draft" : "View compiled draft"}
          >
            <CheckCircle2 size={16} />
            Draft Translation
          </button>

    <button
      className={`tm-tab ${activeTab === 'tm' ? 'is-active' : ''}`}
      onClick={() => setActiveTab('tm')}
    >
      <TrendingUp className="tm-tab-icon" />
      TM Leverage Overview
    </button>
  </div>

          {/* <div className="tm-tabs-right">
            <div className="tm-progress-inline">
              <span className="tm-progress-inline-label">Progress:</span>
              <span className="tm-progress-inline-value">
                {progressWords.done} / {progressWords.total} words
              </span>
              <div className="tm-progress-inline-bar">
                <div className="tm-progress-inline-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="tm-tabs-actions">
              <button
                className={`tm-btn primary outline ${isBulkTranslating ? "is-loading" : ""}`}
                onClick={handleTranslateAllClick}
                disabled={isBulkTranslating}
              >
                {isBulkTranslating ? "Translating all…" : "Translate All"}
              </button>

              <button className="tm-btn primary" onClick={handleCompletePhase}>
                Complete Phase
              </button>
            </div>
          </div> */}
        </section>

        {/* Success banner (HIDDEN when on Draft tab) */}
        {showGenerateDraft && activeTab !== "draft" && (
          <div className="tm-success-banner">
            <div className="tm-success-left">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#D1FADF" stroke="#12B981" />
                <path d="M7.5 12.5l3 3 6-6" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="tm-success-text">
                <strong>All Segments Completed! 🎉</strong>
                <span className="tm-success-sub">
                  Ready to generate the complete draft translation for Cultural Intelligence review
                </span>
              </div>
            </div>

            <button className="tm-success-btn" onClick={handleGenerateDraftTranslation}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3 7h7l-5.5 4 2.1 7L12 16l-6.6 4 2.1-7L2 9h7z" fill="currentColor" />
              </svg>
              <span>Generate Draft Translation</span>
            </button>
          </div>
        )}

        {/* Workspace tab */}
        {activeTab === "workspace" && (
              <div>
              <section className="tm-page-heading">
    <div>
      <h2 className="tm-section-title">Smart TM Translation Hub</h2>
      <p className="tm-section-sub">AI-powered translation with Translation Memory leverage</p>
    </div>
  
    <div className="tm-heading-right">
      {/* Reuse the same inline progress and actions, or keep empty if you prefer only the tabs bar showing them. */}
      <div className="tm-progress-inline">
        <span className="tm-progress-inline-label">Progress:</span>
        <span className="tm-progress-inline-value">
          {progressWords.done} / {progressWords.total} words
        </span>
        <div className="tm-progress-inline-bar">
          <div
            className="tm-progress-inline-fill"
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
      </div>
  
      <div className="tm-actions">
        {/* <button className="tm-btn-outline"> <Languages size={14} className="h-4 w-4 mr-2" /> Translate All</button> */}
        <button
                  className={`tm-btn outline ${isBulkTranslating ? "is-loading" : ""}`}
                  onClick={handleTranslateAllClick}
                  disabled={isBulkTranslating}
                >
                  <Languages size={14} className="h-4 w-4 mr-2" />
                  {isBulkTranslating ? "Translating all…" : "Translate All"}
                </button>
        {/* <button className="tm-btn-primary" onClick={handleCompletePhase}><CheckCircle2 size={14} className="h-4 w-4 mr-2" />Complete Phase</button> */}
        <button
  className="tm-btn primary"              // ⬅️ 10_03same core class as Cultural page
  onClick={handleCompletePhase}
  disabled={!canCompleteP2}               // ⬅️ real disabled attribute
  aria-disabled={!canCompleteP2}          // ⬅️ a11y mirror
  title={p2Tooltip}                       // ⬅️ identical tooltip behavior
>
  <CheckCircle2 size={14} className="h-4 w-4 mr-2" />
  Complete Phase 2
</button>
      </div>
    </div>
  </section>
  {/* 🆕 NEW: LOADING GATE STARTS HERE */}
  {isLoadingProject ? (
    <div className="tm-workspace-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', color: '#6B7280' }}>
      <Loader2 size={32} className="animate-spin mb-4 text-emerald-600" />
      <p>Syncing Data....</p>
    </div>
  ) : (
  <section className="tm-workspace">
          {/* Left card: Segments list (unchanged) */}
          <div className="tm-card tm-left">
            <div className="tm-card-header">
              <h3 className="tm-card-title">Segments</h3>
              <span className="tm-light">{segments.length} items</span>
            </div>

            <div className="tm-seg-list">
              {segments.map((seg) => {
                const isSelected = seg.id === selectedId;
                
// ✅ Use overrides if present
    const o = segOverrides[seg.id];
    const mergedStatus = o?.status ?? seg.status;

                // const statusClass =
                //   seg.status === "Pending"
                //     ? "pending"
                //     : seg.status === "Completed"
                //     ? "completed"
                //     : "neutral";
                
                const statusClass =
                mergedStatus === "Pending"
                  ? "pending"
                  : mergedStatus === "Completed"
                  ? "completed"
                  : "neutral";
            //     return (
            //       <button
            //         key={seg.id}
            //         className={`tm-seg-item ${isSelected ? "is-selected" : ""}`}
            //         onClick={() => setSelectedId(seg.id)}
            //         aria-label={`Open Segment ${seg.index}`}
            //       >
            //         <div className="tm-seg-item-top">
            //           <span className={`tm-seg-pill ${statusClass}`}>Segment {seg.index}</span>
            //           <span className="tm-seg-state">{seg.status}</span>
            //         </div>
            //         <div className="tm-seg-snippet">{seg.source}</div>
            //         <div className="tm-seg-meta-row">
            //           <span className="tm-seg-meta">{seg.words} words</span>
            //         </div>
            //       </button>
            //     );
            //   })}
            //   {segments.length === 0 && (
            //     <div className="tm-empty">No segment present to display.</div>
            //   )}
            // </div>
            
return (
  <button
    key={seg.id}
    className={`tm-seg-item ${isSelected ? "is-selected" : ""}`}
    onClick={() => setSelectedId(seg.id)}
    aria-label={`Open Segment ${seg.index}`}
  >
    <div className="tm-seg-item-top">
      <span className={`tm-seg-pill ${statusClass}`}>Segment {seg.index}</span>
      <span className="tm-seg-state">{mergedStatus}</span>
    </div>
    <div className="tm-seg-snippet">{seg.source}</div>
    <div className="tm-seg-meta-row">
      <span className="tm-seg-meta">{seg.words} words</span>
    </div>
  </button>
);
})}
{segments.length === 0 && (
<div className="tm-empty">No segment present to display.</div>
)}
</div>

          </div>
         {/* ===== Right column: TWO SEPARATE CARDS ===== */}
         <div className="tm-right-column">
            {/* 1) ACTION CARD — always first */}
            <div className="tm-card tm-action-card">
            <div className="tm-card-header">
      <h3 className="tm-card-title">
        {selectedResolved?.index ? `Section ${selectedResolved.index}` : "Section"}
      </h3>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {/* Optional TM badge here if you want it in the header too */}
        {/* <span className="tm-chip">TM: {selectedResolved?.status === "Completed" ? "100%" : "0%"}</span> */}
        <span className="tm-chip soft">
          {selectedResolved?.type || "body"}
        </span>
      </div>
    </div>
    {selectedResolved?.status !== "Completed" && 
              <div className="tm-card-header1">
              <div className="tm-action-title">
                  <h3 className="tm-card-title1">TM Leverage</h3>
                  <div className="tm-card-subset">
                    <span className="tm-light">
                      {tmLeverageOn
                        ? "AI will use Translation Memory for consistency and cost savings"
                        : "Pure AI translation without TM matching"}
                    </span>
                  </div>
                </div>
                <label className="tm-switch" aria-label="Toggle TM Leverage">
                  <input
                    type="checkbox"
                    checked={tmLeverageOn}
                    onChange={(e) => setTmLeverageOn(e.target.checked)}
                  />
                  <span className="tm-slider" />
                </label>
              </div>
}

              {/* <div className="tm-action-buttons">
                <button
                  className={`tm-btn primary small ${isTranslating ? "is-loading" : ""}`}
                  onClick={handleAiTranslate}
                  disabled={!selected || isTranslating}
                >
                  {isTranslating ? "Translating…" : "AI Translate"}
                </button>

                <button
                  className="tm-btn outline small"
                  onClick={handleCompleteSegment}
                  disabled={!selected}
                >
                  Complete
                </button>
              </div> */}

<div className="tm-detail-actions">
  {/* Completed segment - show Edit button only when NOT editing */}
  
{selectedResolved?.status === "Completed" && !isEditingTranslation && (
    <button
      className="tm-btn outline small"
      onClick={() => setIsEditingTranslation(true)}
      title="Edit Translation"
    >
      <Edit3 size={15} className="h-4 w-4 mr-2" />
      Edit Translation
    </button>
  )}

  {selectedResolved?.status === "Completed" && isEditingTranslation && (
    <button
      className="tm-btn primary small"
      onClick={() => {
        // Persist as needed, then re-lock
        setIsEditingTranslation(false);
      }}
      title="Save Changes"
    >
      <CheckCircle size={16} className="h-4 w-4 mr-2" />
      Save Changes
    </button>
  )}

  {/* Pending / In-progress segment - show AI Translate + Complete */}
  
{/* Pending / In-progress segment - show AI Translate + Complete */}
{selectedResolved?.status !== "Completed" && (
  <>
    <button
      className={`tm-btn outline small ${isTranslating ? "is-loading" : ""} flex items-center gap-2`}
      onClick={handleAiTranslate}
      disabled={!selectedResolved || isTranslating}
    >
      {isTranslating
        ? <Loader2 size={14} className="h-4 w-4 animate-spin" />
        : <Sparkles size={14} className="h-4 w-4" />}
      {isTranslating ? "Translating…" : "AI Translate"}
    </button>

    {/* <button
      className="tm-btn primary small flex items-center gap-2"
      onClick={handleCompleteSegment}
      disabled={!hasRealTranslation(selectedResolved)}
      title="Mark segment as complete"
    >
      <CheckCircle size={15} className="h-4 w-4" />
      Complete
    </button> */}
  </>
)}
</div>

              {/* Inline feedback */}
              {translationError && (
                <div className="tm-inline-error" role="alert">{translationError}</div>
              )}
              {/* {!isDetailEnabled && selected && (
                <div className="tm-inline-hint">
                  After translation, the detail card with Source/Translated will enable below.
                </div>
              )} */}
            </div>

            {/* 2) DETAIL CARD — below; disabled until translation exists */}
            <div
              className={`tm-card tm-detail-card ${isDetailEnabled ? "" : "is-disabled"}`}
              aria-disabled={!isDetailEnabled}
            >
              {/* {!isDetailEnabled && (
                <div className="tm-detail-overlay">
                  <div className="tm-overlay-content">
                    <div className="tm-overlay-title">Waiting for translation…</div>
                    <div className="tm-overlay-sub">
                      Click <strong>AI Translate</strong> above to fetch translation from n8n.
                    </div>
                  </div>
                </div>
              )} */}

              {/* <div className="tm-card-header">
                <h3 className="tm-card-title">Section 1</h3>
                <div className="tm-card-subset">
                  <span className="tm-light">body</span>
                </div>
              </div> */}

              {/* {!selected && (
                <div className="tm-empty large">
                  Select a segment from the left to view Source &amp; Translated text.
                </div>
              )} */}

              {selected && (
                <div className="tm-detail">
                  {/* <div className="tm-detail-row">
                    <div className="tm-detail-row-left">
                      <span className="tm-chip soft">Source Text</span>
                    </div>
                    <div className="tm-detail-row-right">
                      <span className="tm-lang-chip">{selectedResolved?.lang || inboundLang || "EN"}</span>
                    </div>
                  </div>
                  <div className="tm-box source">{selectedResolved?.source || ""}</div> */}

<div className="tm-source-card">
  <div className="tm-source-card-header">
    <span className="tm-chip soft tm-chip-source">
    <FileText size={15} className="h-4 w-4" />
      Source Text
    </span>
    <span className="tm-lang-chip">
      {/* {selectedResolved?.lang || inboundLang || "EN"} */}
      EN
    </span>
  </div>

  <div className="tm-source-card-body">
    {selectedResolved?.source || ""}
  </div>
</div>

                  
                  {/* <div className="tm-chip success">Translated Text</div>
                  <div className="tm-box translated">
                    {isDetailEnabled
                      ? (selectedResolved?.translated || "")
                      : <span className="tm-light">— Awaiting translation —</span>}
                  </div>
                  <div className="tm-detail-tools">
                    <span className="tm-light">
                      {selectedResolved?.status === "Completed" ? "TM 100%" : "TM 0%"}
                    </span>
                    <div className="tm-detail-spacer" />
                    <button className="tm-btn link small" disabled={!isDetailEnabled}>
                      Locked
                    </button>
                    <button className="tm-btn link small" disabled={!isDetailEnabled}>
                      View TM Analysis
                    </button>
                  </div> */}
                  
{/* Translated Text card (pretty version) */}
<div className="tm-translated-card">
  {/* Header row */}
  <div className="tm-translated-card-header">
    <span className="tm-chip success tm-chip-translated">
    <Languages size={15} className="h-4 w-4" />
      Translated Text
    </span>


    <span className="tm-lang-chip1">
    {inboundLang}
  </span>
  {/* <span className="tm-light">
    TM {tmMatchInfo[selectedResolved?.id] || 0}%
  </span> */}
   
<div className="tm-translated-tools" >
    {/* Completed + not editing → Locked pill */}
    {selectedResolved?.status === "Completed" && !isEditingTranslation && (
      <span className="tm-locked-pill" title="Locked">
        <Lock size={13} className="h-3 w-3 mr-1" />
        Locked
      </span>
    )}

    {/* Completed + editing → Unlock + Editing pill */}
    {selectedResolved?.status === "Completed" && isEditingTranslation && (
      <span className="tm-editing-pill" title="Editing">
        <Unlock size={13} className="h-3 w-3 mr-1" />
        Editing
      </span>
    )}

    {/* Completed only → View TM Analysis */}
    {selectedResolved?.status === "Completed" && (
      <button
        className="tm-btn link small"
        disabled={!isDetailEnabled}
        onClick={() => {
          const reviewData = selectedResolved?.reviewData || segOverrides[selectedResolved?.id]?.reviewData;
    
          navigate("/tm-analysis", {
            state: {
              segment: selectedResolved,
              reviewData: reviewData,
              projectName: projectName,
              targetLang: inboundLang || "EN",
              sourceLang: "English",
              allSegments: mergeSegmentsWithOverrides(segments, segOverrides),
              country
            }
          });
        }}
      >
         <BarChart3 size={15} className="h-4 w-4 mr-2" />
        {/* View TM Analysis */}
        View TM Analysis {selectedResolved?.status === "Review Needed" ? "(Action Required)" : ""}
      </button>
    )}
  </div>

  </div>

  {/* Body panel (rounded green-tinted area) */}
  {/* <div className="tm-translated-card-body">
    {isDetailEnabled
      ? (selectedResolved?.translated || "")
      : <span className="tm-light">— Awaiting translation —</span>}
  </div> */}
  
<div className="tm-translated-card-body">
  {!isDetailEnabled ? (
    <span className="tm-light">Enter translation or use TM/AI suggestions...</span>
  ) : isEditingTranslation ? (
    <textarea
      value={selectedResolved?.translated || ""}
      onChange={(e) => {
        const newText = e.target.value;
        setSegOverrides(prev => ({
          ...prev,
          [selectedResolved.id]: {
            ...prev[selectedResolved.id],
            translated: newText
          }
        }));
      }}
      placeholder="Edit translated text..."
      className="tm-translated-textarea"
    />
  ) : (
    <div className="tm-translated-readonly">
      {selectedResolved?.translated || ""}
    </div>
  )}
</div>

</div>
                </div>
              )}
            </div>
          </div>
        </section>
  )}
        </div>
         )}
        {/* Integrated Draft tab content (same page) */}
        {activeTab === "draft" && (
          <DraftPanel
            projectName={projectName}
            therapyArea={therapyArea}
            inboundLang={inboundLang}
            segments={draftPrepared ? draftSegments : mergeSegmentsWithOverrides(segments, segOverrides)}
            tmLeveragePct={tmLeveragePct}
            onBackToWorkspace={() => setActiveTab("workspace")} // no mini top bar shown
            onSendToCI={handleSendToCI}
          />
        )}
        
        {/* === NEW TM LEVERAGE TAB INTEGRATION === */}
        {activeTab === "tm" && (
          <TMLeverageOverview 
            segments={mergeSegmentsWithOverrides(segments, segOverrides)} 
          />
        )}
        
      </div>

      {/* Bulk progress modal */}
      <BulkProgressModal
        open={isBulkTranslating}
        progress={bulkProgress}
        subtitle="Translating all pending segments with Smart TM..."
      />
    </div>
  );
}