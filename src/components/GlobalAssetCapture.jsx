import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import {  ArrowLeft,
  Save, ArrowRight, Upload, FileText, CheckCircle2, Maximize2,
  Minimize2, Users, Stethoscope, Edit2, Plus, X, Pill, Unlock, Box, MessageSquare, Globe, Languages, Shield, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { Button } from "@mui/material";
import { updateProjectMeta, markPhaseComplete, getProject, resetP2DraftState } from '../lib/progressStore';
import { usePhaseNavigation } from "./PhaseNav.jsx";
import "./css/GlobalAssetCapture.css";
import {computeProgress } from '../lib/progressStore';
 

export default function GlobalContextCapture() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isFocusMode, setIsFocusMode] = useState(false); 

  // Toggle handler
const toggleFocusMode = () => setIsFocusMode(prev => !prev);
const projectId = state?.projectId || 'proj-unknown';
 const [projectRec, setProjectRec] = useState(null);

const refreshProgress = async () => {
    const record = await getProject(projectId);
    setProjectRec(record||{});
  };
  useEffect(() => {
    refreshProgress();
    window.addEventListener('glocal_progress_updated', refreshProgress);
    return () => window.removeEventListener('glocal_progress_updated', refreshProgress);
  }, [projectId]);
 
  // // 4. Calculate the "First 4 Phases" specific logic
  // const { completedSet } = computeProgress(projectRec);
  // const totalTarget = 4; // Your requirement
  // const completedCount = Math.min(completedSet.size, totalTarget);
  // const overallPercent = (completedCount / totalTarget) * 100;

  // 4. Calculate the "First 4 Phases" specific logic
  const totalTarget = 4; // Your requirement
  
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

  // 🆕 NEW: Official Loading State for the Sidebar
  //Hari-24/3
  // const progressData = useMemo(() => {
  //   if (!projectRec) {
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

  // //Hari-25/3-------------
  // const progressData = useMemo(() => {
  //   let recToUse = projectRec;
 
  //   // Synchronous fallback: If React state hasn't loaded, grab the latest from localStorage
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
  // }, [projectRec, projectId]); // Make sure projectId is in the dependency array

  //Hari-25/3 (Upgraded Universal Cache)
  const progressData = useMemo(() => {
    let recToUse = projectRec;
    
    // ✅ FIXED: Safely check if the database record is an empty object
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

    // If still no record exists anywhere (both DB and Cache are empty)
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
      
      // Look at the REAL database state for the loading text!
      isProgressLoading: !projectRec || Object.keys(projectRec).length === 0
    };
  }, [projectRec, projectId]);
 
  const { completedSet, completedCount, overallPercent, isProgressLoading } = progressData;
  
 

  //const { completedSet, completedCount, overallPercent, isProgressLoading } = progressData;
  

 // From previous page (if passed)
 const projectName =
 state?.projectName ||
 "HCP Clinical Insights Email Campaign - DE Adaptation";
const importedContent = state?.content || `No content to display`;
const type = state?.type || "email";
 // 🆕 Receive language from previous page (fallbacks included)
  // Prefer 'lang', then 'sourceLang', finally default to 'EN'
  const inboundLang = state?.lang ?? state?.sourceLang ?? "EN";
   
   const country = state?.country ?? null;
   console.log(country);
// Tabs
const [contentTab, setContentTab] = useState("editor"); // "editor" | "preview"
const [contentText, setContentText] = useState(importedContent);


  const [isEditingSummary, setIsEditingSummary] = useState(false);
  
  // Local fallback (unchanged)
  const localSegments = useMemo(() => segmentContent(contentText), [contentText]);
  const [summary, setSummary] = useState({
    assetType: "Marketing Email",
    indication: "Not specified",
    therapyArea: "Respiratory",
    audience: "Pulmonologists"
  });
  const [extraAudiences, setExtraAudiences] = useState([]);
  const [apiRawJson, setApiRawJson] = useState(null);
  const [isSegLoading, setIsSegLoading] = useState(false);
  const [segError, setSegError] = useState("");
  const [assetType, setAssetType] = useState(type || "email");
  const [therapeuticContext, setTherapeuticContext] = useState("");
  const [indication, setIndication] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalAudiences, setAdditionalAudiences] = useState([]);
  const [isEditingContext, setIsEditingContext] = useState(false);
  /*09_06*/
  const isP1Completable = !!apiRawJson && !isSegLoading && !segError;
   
// ✅ read the passed values
const marketsCount   = state?.marketsCount ?? 0;
const marketCodes    = Array.isArray(state?.marketCodes) ? state.marketCodes : [];
const gotoPhase = usePhaseNavigation(projectId, projectName,country); //31_03_sanju
React.useEffect(() => {
  localStorage.setItem('gac_focus_mode', String(isFocusMode));
}, [isFocusMode]);


// Progress and State Maintenance - DATABASE FIRST
  // React.useEffect(() => {
  //   async function loadProjectData() {
  //     if (!projectId) return;

  //     const rec = await getProject(projectId);
  //     const m = rec?.meta || {};
  //     const hasFreshImport = state?.content && state.content !== "No content to display";

  //     // 1. DATABASE FIRST: If we have saved text, ALWAYS use it (prevents back-arrow data loss)
  //     if (typeof m.contentText === "string" && m.contentText.trim().length > 0) {
  //       setContentText(m.contentText);
  //     } 
  //     // 2. FRESH IMPORT: Only use router state if the database is empty
  //     else if (hasFreshImport) {
  //       setContentText(state.content);
  //       await updateProjectMeta(projectId, { contentText: state.content });
  //     }

  //     // RESTORE SEGMENTATION PREVIEW
  //     if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
  //       const reconstructedJson = {
  //         output: m.segmentsP1.reduce((acc, seg) => {
  //           acc[seg.id || `segment ${seg.index}`] = seg.source;
  //           return acc;
  //         }, {}),
  //       };
  //       setApiRawJson(reconstructedJson);
  //     }

  //     if (typeof m.assetType === "string") setAssetType(m.assetType);
  //     if (typeof m.therapeuticContext === "string") setTherapeuticContext(m.therapeuticContext);
  //     if (typeof m.indication === "string") setIndication(m.indication);
  //     if (typeof m.targetAudience === "string") setTargetAudience(m.targetAudience);
  //     if (Array.isArray(m.additionalAudiences)) setAdditionalAudiences(m.additionalAudiences);
  //   }
  //   loadProjectData();
  // }, [projectId, state?.content]);

  // // AUTO-SAVE CONTENT EDITS
  // React.useEffect(() => {
  //   if (!projectId || contentText === "No content to display") return;
  //   const timeoutId = setTimeout(() => {
  //     updateProjectMeta(projectId, { contentText });
  //   }, 1000); // 1-second debounce
  //   return () => clearTimeout(timeoutId);
  // }, [projectId, contentText]);

  // Progress and State Maintenance - DATABASE FIRST
  // React.useEffect(() => {
  //   async function loadProjectData() {
  //     if (!projectId) return;

  //     const rec = await getProject(projectId);
  //     const m = rec?.meta || {};
  //     const hasFreshImport = state?.content && state.content !== "No content to display";
      
  //     // ✅ 1. Check if we have real, valid text (Ignore the "Loading..." trap!)
  //     const hasValidDbText = typeof m.contentText === "string" && m.contentText.trim().length > 0 && m.contentText !== "Loading...";

  //     // 1. DATABASE FIRST: If we have valid saved text, ALWAYS use it
  //     if (hasValidDbText) {
  //       setContentText(m.contentText);
  //     } 
  //     // 2. FRESH IMPORT: Only use router state if the database is empty
  //     else if (hasFreshImport) {
  //       setContentText(state.content);
  //       await updateProjectMeta(projectId, { contentText: state.content });
  //     }
  //     // ✅ 3. ULTIMATE FALLBACK: Reconstruct text from saved segments if contentText was lost!
  //     else if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
  //       const reconstructedText = m.segmentsP1.map(seg => seg.source).join("\n\n");
  //       setContentText(reconstructedText);
  //       await updateProjectMeta(projectId, { contentText: reconstructedText });
  //     } else {
  //       setContentText("No content found for this project.");
  //     }

  //     // RESTORE SEGMENTATION PREVIEW
  //     if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
  //       const reconstructedJson = {
  //         output: m.segmentsP1.reduce((acc, seg) => {
  //           acc[seg.id || `segment ${seg.index}`] = seg.source;
  //           return acc;
  //         }, {}),
  //       };
  //       setApiRawJson(reconstructedJson);
  //     }

  //     if (typeof m.assetType === "string") setAssetType(m.assetType);
  //     if (typeof m.therapeuticContext === "string") setTherapeuticContext(m.therapeuticContext);
  //     if (typeof m.indication === "string") setIndication(m.indication);
  //     if (typeof m.targetAudience === "string") setTargetAudience(m.targetAudience);
  //     if (Array.isArray(m.additionalAudiences)) setAdditionalAudiences(m.additionalAudiences);
  //   }
  //   loadProjectData();
  // }, [projectId, state?.content]);

  // Progress and State Maintenance - DATABASE FIRST
  // React.useEffect(() => {
  //   async function loadProjectData() {
  //     if (!projectId) return;

  //     const rec = await getProject(projectId);
  //     const m = rec?.meta || {};
      
  //     // Safely clean strings to prevent hidden spaces from breaking our logic
  //     const importedStr = (state?.content || "").trim();
  //     const dbStr = (m.contentText || "").trim();
      
  //     const hasFreshImport = importedStr.length > 0 && !importedStr.includes("Loading...") && importedStr !== "No content to display";
      
  //     // ✅ FIXED: Use .includes() to catch "Loading..." even if it has spaces or newlines attached!
  //     const hasValidDbText = dbStr.length > 0 && !dbStr.includes("Loading...") && dbStr !== "No content to display";

  //     // 1. DATABASE FIRST: If we have valid saved text, ALWAYS use it
  //     if (hasValidDbText) {
  //       setContentText(m.contentText); // Keep original formatting for display
  //     } 
  //     // 2. FRESH IMPORT: Only use router state if the database is empty
  //     else if (hasFreshImport) {
  //       setContentText(state.content);
  //       await updateProjectMeta(projectId, { contentText: state.content });
  //     }
  //     // 3. ULTIMATE FALLBACK: Reconstruct text from saved segments if contentText was lost/corrupted!
  //     else if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
  //       const reconstructedText = m.segmentsP1.map(seg => seg.source).join("\n\n");
  //       setContentText(reconstructedText);
  //       await updateProjectMeta(projectId, { contentText: reconstructedText });
  //     } else {
  //       setContentText("No content found for this project.");
  //     }

  //     // RESTORE SEGMENTATION PREVIEW
  //     if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
  //       const reconstructedJson = {
  //         output: m.segmentsP1.reduce((acc, seg) => {
  //           acc[seg.id || `segment ${seg.index}`] = seg.source;
  //           return acc;
  //         }, {}),
  //       };
  //       setApiRawJson(reconstructedJson);
  //     }

  //     // Restore dropdowns
  //     if (typeof m.assetType === "string") setAssetType(m.assetType);
  //     if (typeof m.therapeuticContext === "string") setTherapeuticContext(m.therapeuticContext);
  //     if (typeof m.indication === "string") setIndication(m.indication);
  //     if (typeof m.targetAudience === "string") setTargetAudience(m.targetAudience);
  //     if (Array.isArray(m.additionalAudiences)) setAdditionalAudiences(m.additionalAudiences);
  //   }
  //   loadProjectData();
  // }, [projectId, state?.content]);

  // AUTO-SAVE CONTENT EDITS
  // React.useEffect(() => {
  //   if (!projectId) return;
    
  //   // ✅ FIXED: Prevent Auto-Save from saving "Loading..." (even with spaces) into the DB
  //   const textToSave = (contentText || "").trim();
  //   if (textToSave === "" || textToSave === "No content to display" || textToSave.includes("Loading...")) {
  //     return;
  //   }
    
  //   const timeoutId = setTimeout(() => {
  //     updateProjectMeta(projectId, { contentText });
  //   }, 1000); // 1-second debounce
    
  //   return () => clearTimeout(timeoutId);
  // }, [projectId, contentText]);

  // Progress and State Maintenance - DATABASE FIRST
  React.useEffect(() => {
    async function loadProjectData() {
      if (!projectId) return;

      const rec = await getProject(projectId);
      const m = rec?.meta || {};
      
      const importedStrOriginal = (state?.content || "").trim();
      const dbStrOriginal = (m.contentText || "").trim();
      
      // ✅ FIXED: Convert to lowercase to catch ANY casing variations (Content vs content)
      const importedStrLower = importedStrOriginal.toLowerCase();
      const dbStrLower = dbStrOriginal.toLowerCase();
      
      // ✅ FIXED: A universal helper to catch all placeholder traps
      const isInvalidText = (str) => {
        return str === "" || 
               str.includes("loading") || 
               str.includes("no content to display") || 
               str.includes("no content found");
      };

      const hasValidDbText = !isInvalidText(dbStrLower);
      const hasFreshImport = !isInvalidText(importedStrLower);

      // 1. DATABASE FIRST: If we have valid saved text, ALWAYS use it
      if (hasValidDbText) {
        setContentText(m.contentText); // Keep original formatting for display
      } 
      // 2. FRESH IMPORT: Only use router state if the database is empty
      else if (hasFreshImport) {
        setContentText(state.content);
        await updateProjectMeta(projectId, { contentText: state.content });
      }
      // 3. ULTIMATE FALLBACK: Reconstruct text from saved segments if contentText was lost/corrupted!
      else if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
        const reconstructedText = m.segmentsP1.map(seg => seg.source).join("\n\n");
        setContentText(reconstructedText);
        await updateProjectMeta(projectId, { contentText: reconstructedText });
      } else {
        setContentText("No content found for this project.");
      }

      // RESTORE SEGMENTATION PREVIEW
      if (Array.isArray(m.segmentsP1) && m.segmentsP1.length > 0) {
        const reconstructedJson = {
          output: m.segmentsP1.reduce((acc, seg) => {
            acc[seg.id || `segment ${seg.index}`] = seg.source;
            return acc;
          }, {}),
        };
        setApiRawJson(reconstructedJson);
      }

      // Restore dropdowns
      if (typeof m.assetType === "string") setAssetType(m.assetType);
      if (typeof m.therapeuticContext === "string") setTherapeuticContext(m.therapeuticContext);
      if (typeof m.indication === "string") setIndication(m.indication);
      if (typeof m.targetAudience === "string") setTargetAudience(m.targetAudience);
      if (Array.isArray(m.additionalAudiences)) setAdditionalAudiences(m.additionalAudiences);
    }
    loadProjectData();
  }, [projectId, state?.content]);

  // AUTO-SAVE CONTENT EDITS
  React.useEffect(() => {
    if (!projectId) return;
    
    // ✅ FIXED: Check the lowercase version so it never saves bad data again
    const textToSave = (contentText || "").trim().toLowerCase();
    
    if (
      textToSave === "" || 
      textToSave.includes("loading") || 
      textToSave.includes("no content to display") || 
      textToSave.includes("no content found")
    ) {
      return; // Abort auto-save!
    }
    
    const timeoutId = setTimeout(() => {
      updateProjectMeta(projectId, { contentText });
    }, 1000); // 1-second debounce
    
    return () => clearTimeout(timeoutId);
  }, [projectId, contentText]);

  // AUTO-SAVE CONTENT EDITS
  React.useEffect(() => {
    // ✅ FIXED: Prevent Auto-Save from saving "Loading..." into the database ever again!
    if (!projectId || contentText === "No content to display" || contentText === "Loading...") return;
    
    const timeoutId = setTimeout(() => {
      updateProjectMeta(projectId, { contentText });
    }, 1000); // 1-second debounce
    
    return () => clearTimeout(timeoutId);
  }, [projectId, contentText]);

  // ❌ NOTE: The duplicate "Hydrate from persisted meta" useEffect that was below here 
  // has been intentionally deleted because it was causing async conflicts.

 // 🆕 Hydrate from persisted meta
    // React.useEffect(() => {
    //    if (!projectId) return;
    //    const rec = getProject(projectId);
    //    const m = rec?.meta || {};
    //    // only set if a value exists to avoid clobbering current edits
    //    if (typeof m.assetType === 'string') setAssetType(m.assetType);
    //   if (typeof m.therapeuticContext === 'string') setTherapeuticContext(m.therapeuticContext);
    //    if (typeof m.indication === 'string') setIndication(m.indication);
    //    if (typeof m.targetAudience === 'string') setTargetAudience(m.targetAudience);
    //    if (Array.isArray(m.additionalAudiences)) setAdditionalAudiences(m.additionalAudiences);
    //    if (typeof m.contentText === 'string' && m.contentText.trim().length) {
    //      setContentText(m.contentText);
    //    }
    //  }, [projectId]);
  
// // Sidebar Phases (unchanged)
// const phases = useMemo(
//   () => [
//     { id: 'P1', name: "Global Context Capture", sub: "Source content analysis", status: "active" },
//     { id: 'P2', name: "Smart TM Translation", sub: "AI-powered translation", status: "todo" },
//     { id: 'P3', name: "Cultural Intelligence", sub: "Cultural adaptation", status: "todo" },
//     { id: 'P4', name: "Regulatory Compliance", sub: "Compliance validation", status: "todo" },
//     { id: 'P5', name: "Quality Intelligence", sub: "Quality assurance", status: "todo" },
//     { id: 'P6', name: "DAM Integration", sub: "Asset packaging", status: "todo" },
//     { id: 'P7', name: "Integration Lineage", sub: "System integration", status: "todo" },
//   ],
//   []
// );

const phases = [
  {
    id: 'P1',
    name: "Global Context Capture",
    sub: "Source content analysis",
    status: "active",
    icon: <Globe size={18} />,
    color: 'is-blue'
  },
  {
    id: 'P2',
    name: "Smart TM Translation",
    sub: "AI-powered translation",
    status: "todo",
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


 // Sidebar Phases (unchanged)
  // const phases = useMemo(
  //   () => [
  //     {
  //       id: "P1",
  //       name: "Global Context Capture",
  //       sub: "Source content analysis",
  //       status: "active",
  //     },
  //     {
  //       id: "P2",
  //       name: "Smart TM Translation",
  //       sub: "AI-powered translation",
  //       status: "todo",
  //     },
  //     {
  //       id: "P3",
  //       name: "Cultural Intelligence",
  //       sub: "Cultural adaptation",
  //       status: "todo",
  //     },
  //     {
  //       id: "P4",
  //       name: "Regulatory Compliance",
  //       sub: "Compliance validation",
  //       status: "todo",
  //     },
  //     {
  //       id: "P5",
  //       name: "Quality Intelligence",
  //       sub: "Quality assurance",
  //       status: "todo",
  //     },
  //     {
  //       id: "P6",
  //       name: "DAM Integration",
  //       sub: "Asset packaging",
  //       status: "todo",
  //     },
  //     {
  //       id: "P7",
  //       name: "Integration Lineage",
  //       sub: "System integration",
  //       status: "todo",
  //     },
  //   ],
  //   [],
  // );

const availableAdditionalAudiences = [
  "Secondary care physicians",
  "Primary care physicians",
  "Nurses/Healthcare staff",
  "Patients/Caregivers",
  "Specialists",
  "Pharmacists",
  "Healthcare administrators",
  "Payers/Insurance providers",
];


const toggleAdditionalAudience = (aud) => {
  setAdditionalAudiences((prev) =>
    prev.includes(aud) ? prev.filter((x) => x !== aud) : [...prev, aud]
  );
};

  const handleSave = () => alert("Project changes saved successfully!");

  const openSegmentationPreview = async () => {
    setContentTab("preview");

    if (apiRawJson || isSegLoading) return;

    setIsSegLoading(true);
    setSegError("");

    try {
      // ADDED: timestamp cache-buster and cache: 'no-store' to force a fresh DB check every time
      const timestamp = new Date().getTime();
      const dbResponse = await fetch(
        `https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/segmented-content?t=${timestamp}`, 
        { cache: 'no-store' } 
      );
      if (!dbResponse.ok)
        throw new Error("Failed to check database for existing segments.");

      const allDbContent = await dbResponse.json();

      // ADDED: Safe string matching using .trim() to ignore accidental spaces
      const existingSegments = allDbContent.filter(
        (item) => item.document_name && item.document_name.trim() === projectName.trim()
      );

      if (existingSegments.length > 0) {
        console.log("Found existing segments in DB. Loading those instead of calling n8n.");
        const reconstructedJson = {
          output: existingSegments.reduce((acc, seg) => {
            const key = seg.segmented_no.toLowerCase();
            acc[key] = seg.description;
            return acc;
          }, {}),
        };

        setApiRawJson(reconstructedJson);
        setIsSegLoading(false);
        return; 
      }

      console.log("No segments found in DB. Triggering n8n workflow...");
      const n8nUrl =
        process.env.REACT_APP_N8N_SEGMENT_URL ||
        "http://172.16.4.237:8016/webhook/pdfUpload";

      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.REACT_APP_N8N_TOKEN
            ? { Authorization: `Bearer ${process.env.REACT_APP_N8N_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          projectName,
          content: contentText,
          lang: inboundLang,
        }),
      });

      if (!res.ok) throw new Error(`n8n responded with HTTP ${res.status}`);
      const json = await res.json();
      setApiRawJson(json);

      const segmentsToStore = GlobalAssetCapture(json, []);
      if (segmentsToStore && segmentsToStore.length > 0) {
        // PROPER ERROR CHECKING: We will now see exact database errors if they happen
        const savePromises = segmentsToStore.map(async (seg) => {
          const saveRes = await fetch(
            "https://9hrpycs3g5.execute-api.us-east-1.amazonaws.com/Prod/api/segmented-content",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                document_name: projectName,
                segmented_no: `Segment ${seg.index}`,
                description: seg.source,
              }),
            }
          );
          
          if (!saveRes.ok) {
             const errorText = await saveRes.text();
             console.error(`Failed to save segment ${seg.index}. Backend says:`, errorText);
          }
        });
        
        await Promise.all(savePromises);
        console.log("Finished attempting to save segments to DB.");
      }
    } catch (err) {
      setSegError(err?.message || "Error processing segmentation preview.");
    } finally {
      setIsSegLoading(false);
    }
  };

  // ===== Phase‑1 completion gate (like Phase‑3) =====
  // Build the exact list we will pass forward — but only from n8n (require user to open Preview)
  const previewSegmentsFromApi = useMemo(
    () => (apiRawJson ? GlobalAssetCapture(apiRawJson, [], inboundLang) : []),
    [apiRawJson, inboundLang]
  );

  const totalPreviewSegments = previewSegmentsFromApi.length;

  const emptyPreviewSegments = useMemo(
    () =>
      previewSegmentsFromApi.filter(
        (s) => !((s?.source || "").trim().length)
      ).length,
    [previewSegmentsFromApi]
  );

  // All conditions that must be true to enable "Complete Phase 1"
  const allSegmentsCaptured = totalPreviewSegments > 0 && emptyPreviewSegments === 0;

  // Final gate: require n8n data, segments present (none empty), no loading, no error
  const canCompleteP1 = !!apiRawJson && allSegmentsCaptured && !isSegLoading && !segError;

  // Tooltip message (like your Phase‑3 hint)
  const p1Tooltip = !apiRawJson
    ? "Open 'Segmentation Preview' to generate segments"
    : !allSegmentsCaptured
    ? `${emptyPreviewSegments} segment(s) still empty`
    : segError
    ? `Fix error before proceeding: ${segError}`
    : "Proceed to Phase 2";

  //Hari
//   const handleComplete = async() => {

//   if (!canCompleteP1) return;

//     // Calling the helper function from the bottom
//     const segmentsForNext = GlobalAssetCapture(apiRawJson, localSegments, inboundLang);
//     // ✅ Debug BEFORE marking complete
//   console.log('GAC: Completing P1 for projectId:', projectId, {
//     projectName,
//     hasApiJson: !!apiRawJson,
//     localSegmentsCount: localSegments.length
//   });

// // ✅ Persist any context you’ve collected here as REAL meta

// await updateProjectMeta(projectId, {
//        assetType,
//        therapeuticContext,
//        indication,
//        targetAudience,
//        additionalAudiences,
//        marketsCount,
//        marketCodes,
//        // 🆕 store edited source text so GAC can restore later
//        contentText,
//       // 🆕 store P1 produced segments so TM hub can restore later
//        segmentsP1: segmentsForNext,
//        segmentsP2: segmentsForNext,
//           // not strictly required here if you're calling resetP2DraftState below,
//    // but harmless if kept in one place:
//    p2DraftGenerated: false,
//    p2DraftGeneratedAt: null,
//    p2BannerDismissed: false,
//      });
  
//       await markPhaseComplete(projectId, "P1");
// // ✅ Explicitly reset P2 flags for this new asset
// await resetP2DraftState(projectId);


//        const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
//        console.log('GAC: store after P1:', db[projectId]); // should show completed: ['P1']

//     navigate("/smartTMTranslationHub", {
//       state: {  projectId, projectName, segments: segmentsForNext, lang: inboundLang, country },
//     });
//   };

  //Hari-25/3
//     const handleComplete = async () => {
//   if (!canCompleteP1) return;
 
//   const segmentsForNext = GlobalAssetCapture(apiRawJson, localSegments, inboundLang);
 
//   console.log('GAC: Completing P1 for projectId:', projectId, {
//     projectName,
//     hasApiJson: !!apiRawJson,
//     localSegmentsCount: localSegments.length
//   });
 
//   // 1. Update Metadata
//   await updateProjectMeta(projectId, {
//     assetType,
//     therapeuticContext,
//     indication,
//     targetAudience,
//     additionalAudiences,
//     marketsCount,
//     marketCodes,
//     contentText,
//     segmentsP1: segmentsForNext,
//     segmentsP2: segmentsForNext,
//     p2DraftGenerated: false,
//     p2DraftGeneratedAt: null,
//     p2BannerDismissed: false,
//   });
 
//   // 2. Mark Phase Complete
//   // This function in progressStore.js dispatches 'glocal_progress_updated'
//   await markPhaseComplete(projectId, "P1");
 
//   // 3. Reset P2 flags
//   await resetP2DraftState(projectId);
 
//   // ✅ FIX: Small micro-delay to ensure the Event Loop dispatches the
//   // 'glocal_progress_updated' event before the component unmounts.
//   await new Promise(resolve => setTimeout(resolve, 50));
 
//   const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
//   console.log('GAC: store after P1:', db[projectId]);
 
//   // 4. Navigate
//   navigate("/smartTMTranslationHub", {
//     state: {
//       projectId, // Ensure this is passed so the next page can use the sync fallback
//       projectName,
//       segments: segmentsForNext,
//       lang: inboundLang,
//       country,
//       forceRefresh: true // Hint to the next page to reload data
//     },
//   });
// };
  //Hari
    const handleComplete = async () => {
    if (!canCompleteP1) return;
   
    const segmentsForNext = GlobalAssetCapture(apiRawJson, localSegments, inboundLang);
   
    console.log('GAC: Completing P1 for projectId:', projectId, {
      projectName,
      hasApiJson: !!apiRawJson,
      localSegmentsCount: localSegments.length
    });
   
    // 1. Update Metadata (SAFE: Preserves your text and dropdowns without destroying P2)
    const safeMetaUpdate = {
      assetType,
      therapeuticContext,
      indication,
      targetAudience,
      additionalAudiences,
      marketsCount,
      marketCodes,
      contentText,
      segmentsP1: segmentsForNext,
    };
    await updateProjectMeta(projectId, safeMetaUpdate);
   
    // ✅ 2. THE SAFETY SHIELD: Only do destructive resets if P1 is NOT already done!
    if (!completedSet.has("P1")) {
      // It's the first time, so we safely push these segments to P2 and reset the draft flags
      await updateProjectMeta(projectId, {
        segmentsP2: segmentsForNext,
        p2DraftGenerated: false,
        p2DraftGeneratedAt: null,
        p2BannerDismissed: false,
      });

      // Mark Phase Complete (dispatches 'glocal_progress_updated')
      await markPhaseComplete(projectId, "P1");
     
      // Reset P2 flags
      await resetP2DraftState(projectId);
    }
   
    // 3. Micro-delay to ensure the Event Loop safely finishes
    await new Promise(resolve => setTimeout(resolve, 50));
   
    const db = JSON.parse(localStorage.getItem('glocal_progress_v1') || '{}');
    console.log('GAC: store after P1:', db[projectId]);
   
    // 4. Navigate forward safely
    navigate("/smartTMTranslationHub", {
      state: {
        projectId, 
        projectName,
        segments: segmentsForNext,
        lang: inboundLang,
        country,
        forceRefresh: true 
      },
    });
  };  
 
  return (
  //   <div className={`gac-page ${isFocusMode ? 'is-focus' : ''}`} data-page="gac">
  //     {/* Sidebar */}
  //     {/* Hari-24/3 */}
  //     {!isFocusMode && (<aside className="gac-sidebar">
  //       <div className="sidebar-header" style={{ opacity: isProgressLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
  //     <div className="progress-row">
  //       <span className="progress-label">Overall Progress</span>
  //       <span className="progress-value">{isProgressLoading ? "..." : `${overallPercent}%`}</span>
  //     </div>
     
  //     <div className="progress-bar-bg" style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '8px 0' }}>
  //       <div
  //         className="progress-bar-fill"
  //         style={{
  //           width: `${overallPercent}%`,
  //           height: '100%',
  //           background: '#007bff', 
  //           borderRadius: '2px',
  //           transition: 'width 0.3s ease'
  //         }}
  //       />
  //     </div>
 
  //     <div className="progress-sub">
  //       {isProgressLoading ? 'Loading...' : `${completedCount} of 4 phases completed`}
  //     </div>
  //   </div>
 
  //   <nav className="sidebar-phases">
  //     {phases.map((p) => (
  //       <button
  //         key={p.id}
  //         className={`phase-item ${p.status === "active" ? "is-active" : ""}`}
  //         onClick={() => gotoPhase(p.id)}
  //         aria-label={`Open ${p.name}`}
  //       >
  //         {/* Use the logic from PhaseProgressBar.jsx to decide if dot is green */}
  //         {/* <span className={`phase-icon ${p.iconClass}`} /> */}
  //         <span className={`phase-icon ${p.color || ''}`}>{p.icon}</span>
  //         {/* <span className={`phase-dot ${completedSet.has(p.id.toUpperCase()) ? 'is-done' : ''}`} /> */}
  //         <span className="phase-text">
  //           <span className="phase-title">{p.name}</span>
  //           <span className="phase-sub">{p.sub}</span>
  //         </span>
  //         {p.status === "active" && <span className="phase-active-ind" />}
  //       </button>
  //     ))}
  //   </nav>
  // </aside>
      
  //     )}

  //sanju_02_04

       <div className={`gac-page ${isFocusMode ? 'is-focus' : ''}`} data-page="gac">
  {/* Sidebar */}
  {!isFocusMode && (
    <aside className="gac-sidebar">
      {/* Match the SmartTM structure:
         1. Header (Overall Progress + Percent)
         2. Subtext (X of Y phases completed)
         3. Progress Bar
      */}
      <div className="sidebar-header" style={{ opacity: isProgressLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
       
        {/* Row 1: Label and Percentage */}
        <div className="progress-row">
          <span className="tm-progress-label">Overall Progress</span>
          <span className="tm-progress-value">{isProgressLoading ? "..." : `${overallPercent}%`}</span>
        </div>
     
        {/* Row 2: Subtext (Moved above the bar for consistency) */}
        <div className="progress-sub" style={{ marginBottom: '8px' }}>
          {isProgressLoading ? 'Loading...' : `${completedCount} of 4 phases completed`}
        </div>
 
        {/* Row 3: The Progress Bar (Using tm- classes for exact styling) */}
        <div className="tm-progress-bar">
          <div
            className="tm-progress-fill"
            style={{
              width: `${overallPercent}%`,
              transition: 'width 0.4s ease-out'
            }}
          />
        </div>
      </div>
 
      <nav className="sidebar-phases">
        {phases.map((p) => {
          const isDone = completedSet.has(p.id.toUpperCase());
 
          return (
            <button
              key={p.id}
              className={`phase-item ${isDone ? "done" : p.status || ""} ${p.status === "active" ? "is-active" : ""}`}
              onClick={() => gotoPhase(p.id)}
              aria-label={`Open ${p.name}`}
            >
              <span className={`phase-icon ${p.color || ''}`}>{p.icon}</span>
             
              <span className="phase-text">
                <span className="phase-title">{p.name}</span>
                <span className="phase-sub">{p.sub}</span>
              </span>
 
              {/* Checkmark for completed phases */}
              {isDone && !isProgressLoading && <span className="phase-check">✓</span>}
             
              {/* Active dot indicator */}
              {p.status === "active" && !isDone && !isProgressLoading && <span className="phase-active-ind" />}
            </button>
          );
        })}
      </nav>
    </aside>
  )}
 
 
 

      {/* Content Area */}
      <main className="gac-main">
      <div className="gac-content">
        {/* Header */}
        {/* <header className="gac-header">
          <div className="header-left">
            <div className="crumbs">
              <button className="crumb" onClick={() => navigate('/')}>Main Hub</button>
              <button className="crumb" onClick={() => navigate('/importContentPage')}>Glocalization Hub</button>
            </div>
            <div className="title-row">
              <h1 className="page-title">{projectName}</h1>
              <span className="title-sub">Respiratory · DE</span>
            </div>
          </div>
          <div className="header-right">
            <span className="saved-ind">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="#1F7AEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved
            </span>
            <button className="ghost-btn">Save</button>
            <button className="ghost-btn">Focus</button>
          </div>
        </header> */}
        
<header className="gac-header d-flex justify-content-between align-items-center px-4 mb-3">
  {/* Left Section */}
  <div className="d-flex align-items-center gap-3">
    {/* Breadcrumbs */}
    <button className="crumb d-flex align-items-center gap-1" onClick={() => navigate('/')}>
    <ArrowLeft size={14} className="h-1 w-1 mr-2" /> Main Hub
    </button>
    <span className="divider"></span>
   <button
  className="crumb"
  onClick={() =>
    navigate('/glocalizationHub', {
      state: { projectId, projectName, country },
    })
  }
>
      Glocalization Hub
    </button>
  </div>

  {/* Center Section */}
  <div className="title-section text-center">
    <h1 className="page-title1 fw-bold mb-0">
    {projectName}
    </h1>
    {/* <h2 className="page-subtitle fw-bold mb-0">(DE)</h2> */}
    {/* <span className="title-sub1 text-muted">HIV/AIDS · DE</span> */}
  </div>

  {/* Right Section */}
  <div className="d-flex align-items-center gap-3">
    <span className="saved-ind1 d-flex align-items-center gap-1 text-success">
    <CheckCircle2 size={12} className="h-1 w-1 text-green-600" />
      Saved
    </span>
    <button className="action-btn">
    <Save size={15} className="h-4 w-4 mr-2" onClick={handleSave}/> Save
    </button>
    {/* <button className="action-btn">
    <Maximize2 size={15} className="h-4 w-4 mr-2" /> Focus
    </button> */}
    
<button
      className="action-btn"
      onClick={toggleFocusMode}
      aria-pressed={isFocusMode}
      title={isFocusMode ? 'Exit focus (Esc)' : 'Enter focus (F)'}
    >
      {isFocusMode ? (
        <>
          <Minimize2 size={15} className="h-4 w-4 mr-2" /> Exit
        </>
      ) : (
        <>
          <Maximize2 size={15} className="h-4 w-4 mr-2" /> Focus
        </>
      )}
    </button>

  </div>
</header>


        {/* Phase Label */}
        <div className="phase-label">
          <span className="badge">Phase 1</span>
          <div className="phase-title-group">
            <h2 className="section-title">Global Asset Context Capture</h2>
            <p className="section-desc">
              Configure source content and context for global adaptation
            </p>
          </div>
        </div>

        {/* Source Asset Summary */}
        {/* <section className="card soft">
          <div className="card-header">
            <div className="header-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="#1F7AEC" strokeWidth="2" />
              </svg>
              <h3 className="card-title">Source Asset Summary</h3>
            </div>
            <button className="link-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 20h16M8 4h8v4H8V4zm0 8h8v4H8v-4z" stroke="#6B7178" strokeWidth="1.6" />
              </svg>
              Edit
            </button>
          </div>

          <p className="imported-from">Imported from “{projectName}”</p>

          <div className="info-grid four">
            <div className="info-item">
              <div className="info-label">Asset Type</div>
              <span className="chip chip-soft">{type}</span>
            </div>
            <div className="info-item">
              <div className="info-label">Indication</div>
              <span className="chip chip-soft muted">Not specified</span>
            </div>
            <div className="info-item">
              <div className="info-label">Therapy Area</div>
              <span className="chip chip-soft">Respiratory</span>
            </div>
            <div className="info-item">
              <div className="info-label">Primary Target Audience</div>
              <span className="chip chip-soft">Pulmonologists</span>
            </div>
          </div>

          <div className="audiences">
            <div className="aud-row">
              <div className="aud-left">
                <div className="info-label">Additional Audiences</div>
                <div className="aud-empty">No additional audiences selected</div>
              </div>
              <button className="add-aud-btn">+ Add audience</button>
            </div>
          </div>
        </section> */}
        

 {/* Source Asset Summary (Edit/Lock) */}
 <section className="card1 source-card">
            {/* Header */}
            <div className="card-header1 d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="#1F7AEC" strokeWidth="2" />
                  <path
                    d="M9.5 12.5l2 2 3.5-4"
                    stroke="#1F7AEC"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="card-title1 m-0">Source Asset Summary</h3>
              </div>

              {/* Edit/Lock toggle */}
              <button
                type="button"
                className="link-btn1 d-inline-flex align-items-center"
                onClick={() => setIsEditingContext((prev) => !prev)}
              >
                <Edit2 size={12} className="h-3 w-3 mr-1" />
                {isEditingContext ? "Lock" : "Edit"}
              </button>
            </div>

            {/* Imported from line */}
            <p className="imported-from">Imported from "{projectName}"</p>

            {/* Two-column info grid */}
            <div className="info-grid two">
              {/* Asset Type */}
              <div className="info-item1">
                <div className="info-label-line">
                  <FileText size={15} className="h-4 w-4 text-muted-foreground" />
                  <div className="info-label1">Asset Type</div>
                </div>
                {!isEditingContext ? (
                  <span className="chip1 chip-green">
                    {assetType === "email" && "Marketing Email"}
                    {assetType === "webpage" && "Web Page"}
                    {assetType === "brochure" && "Brochure"}
                    {assetType === "presentation" && "Presentation"}
                    {assetType === "social" && "Social Media"}
                    {!["email", "webpage", "brochure", "presentation", "social"].includes(assetType) && assetType}
                  </span>
                ) : (
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="form-select form-select-sm mt-1"
                  >
                    <option value="email">Marketing Email</option>
                    <option value="webpage">Web Page</option>
                    <option value="brochure">Brochure</option>
                    <option value="presentation">Presentation</option>
                    <option value="social">Social Media</option>
                  </select>
                )}
              </div>

              {/* Therapy Area */}
              <div className="info-item1">
                <div className="info-label-line">
                  <Stethoscope size={15} className="h-4 w-4 text-muted-foreground" />
                  <div className="info-label1">Therapy Area</div>
                </div>
                {!isEditingContext ? (
                  // <span className="chip2 chip-green">{therapeuticContext || "Not specified"}</span>
                  <span className="chip2 chip-green">{"Not specified"}</span>
                ) : (
                  <input
                    type="text"
                    value={therapeuticContext}
                    onChange={(e) => setTherapeuticContext(e.target.value)}
                    placeholder="e.g., Cardiovascular"
                    className="form-control form-control-sm mt-1"
                  />
                )}
              </div>

              {/* Indication */}
              <div className="info-item1">
                <div className="info-label-line">
                  <Pill size={15} className="h-4 w-4 text-muted-foreground" />
                  <div className="info-label1">Indication</div>
                </div>
                {!isEditingContext ? (
                  <span className="chip1 chip-green">{indication || "Not specified"}</span>
                ) : (
                  <input
                    type="text"
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    placeholder="e.g., Hypertension"
                    className="form-control form-control-sm mt-1"
                  />
                )}
              </div>

              {/* Primary Target Audience */}
              <div className="info-item1">
                <div className="info-label-line">
                  <Users size={15} className="h-4 w-4 text-muted-foreground" />
                  <div className="info-label1">Primary Target Audience</div>
                </div>
                {!isEditingContext ? (
                  <span className="chip2 chip-green">{targetAudience || "Not specified"}</span>
                ) : (
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Healthcare professionals"
                    className="form-control form-control-sm mt-1"
                  />
                )}
              </div>
            </div>

             {/* Divider */}
            <div className="soft-divider" />
 
            {/* Additional audiences */}
            {/* <div className="audiences">
              <div className="aud-row d-flex align-items-start justify-content-between">
                <div className="aud-left">
                  <div className="info-label">Additional Audiences</div>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {additionalAudiences.length === 0 ? (
                      <span className="aud-empty1">No additional audiences selected</span>
                    ) : (
                      additionalAudiences.map((aud) => (
                        <span key={aud} className="chip chip-green d-inline-flex align-items-center gap-1">
                          {aud}
                          <button
                            type="button"
                            className="btn btn-sm btn-link p-0 ms-1 text-danger text-decoration-none"
                            onClick={() => toggleAdditionalAudience(aud)}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
 
             
              <div className="d-flex align-items-center gap-2 mt-2">
                <select
                  className="form-select form-select-sm"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) toggleAdditionalAudience(v);
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    + Add audience
                  </option>
                  {availableAdditionalAudiences
                    .filter((a) => !additionalAudiences.includes(a))
                    .map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                </select>
              </div>
            </div> */}
          </section>



        {/* Source Content Card */}
        <section className="card card-source">
          <div className="card-header">
            <div className="header-left">
              <h3 className="card-title">Source Content</h3>
              <p className="card-sub">Imported content can be edited or replaced</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-bar content-tabs" role="tablist" aria-label="Source content tabs">
            <div className="tabs">
              <button
                role="tab"
                id="tab-editor"
                aria-controls="panel-editor"
                aria-selected={contentTab === "editor"}
                tabIndex={contentTab === "editor" ? 0 : -1}
                className={`tab ${contentTab === "editor" ? "is-active" : ""}`}
                onClick={() => setContentTab("editor")}
              >
                Content Editor
              </button>
              <button
                role="tab"
                id="tab-preview"
                aria-controls="panel-preview"
                aria-selected={contentTab === "preview"}
                tabIndex={contentTab === "preview" ? 0 : -1}
                className={`tab ${contentTab === "preview" ? "is-active" : ""}`}
                onClick={openSegmentationPreview}
              >
                Segmentation Preview
              </button>
            </div>
          </div>

          {/* Full-frame tab content area */}
          <div className="card-body">
            {/* Editor */}
            <div
              role="tabpanel"
              id="panel-editor"
              aria-labelledby="tab-editor"
              hidden={contentTab !== "editor"}
              className="tabpanel"
            >
              <div className="editor-wrap full-frame neutral">
                <textarea
                  className="content-editor"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Preview */}
            <div
              role="tabpanel"
              id="panel-preview"
              aria-labelledby="tab-preview"
              hidden={contentTab !== "preview"}
              className="tabpanel"
            >
              {isSegLoading && (
                <div className="seg-loading">
                  <div className="spinner" />
                  <span>Generating segments via n8n…</span>
                </div>
              )}

              {/* ERROR MODE: show ONLY the banner, no segments or fallback */}
              {!!segError && (
                <div className="error-banner" role="alert">
                  <strong>Couldn’t generate segments.</strong>
                  <div className="error-sub">{segError}</div>
                  {/* Intentionally no fallback rendering below */}
                </div>
              )}

              {/* SUCCESS MODE: n8n segments */}
              {!isSegLoading && !segError && apiRawJson && (
                <N8NStringSegments json={apiRawJson} />
              )}

{/* {!isSegLoading && apiRawJson && <N8NStringSegments json={apiRawJson} />} */}

              {/* NO DATA MODE: if no n8n data and no error, show fallback or empty message */}
              {!isSegLoading && !segError && !apiRawJson && (
                <div className="segments-wrap">
                  {localSegments.length > 0 ? (
                    localSegments.map((seg) => (
                      <article key={seg.id} className="segment-card">
                        <div className="segment-header">
                          <span className={`seg-label ${seg.kindClass}`}>{seg.label}</span>
                          <span className="seg-meta">
                            Segment {seg.index} · {seg.length} characters
                          </span>
                        </div>
                        <div className="segment-body">{seg.text}</div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-seg">No segment present to display.</div>
                  )}
                </div>
              )}
{/* 
{!isSegLoading && !apiRawJson && (
                   <div className="segments-wrap">
                     {localSegments.map(seg => (
                       <article key={seg.index} className="segment-card">
                         <div className="segment-header">{seg.label}</div>
                         <div className="segment-body">{seg.text}</div>
                       </article>
                     ))}
                   </div>
                )} */}
            </div>
          </div>
        </section>

        {/* Sticky Footer CTA */}
       <footer className="sticky-footer">

        
  <button
  className="primary-cta"
  onClick={handleComplete}
  aria-disabled={!isP1Completable}
>
  Complete Phase 1 →
</button>


</footer>
        </div>
      </main>
    </div>
  );
}

/**
 * RESTORED HELPER FUNCTIONS (Logic here)
 */

function N8NStringSegments({ json }) {
  const first = Array.isArray(json) ? json[0] : json;
  const output = first?.output;
  const entries = output && typeof output === "object" && !Array.isArray(output)
    ? Object.keys(output).filter((k) => /^segment\s*\d+/i.test(k)).map((k) => {
        const num = parseInt(k.replace(/\D+/g, ""), 10);
        return { num: isNaN(num) ? 0 : num, title: `Segment ${isNaN(num) ? k : num}`, text: String(output[k] ?? "") };
      }).filter((seg) => seg.text.trim().length > 0).sort((a, b) => a.num - b.num)
    : [];

  return (
    <div className="segments-wrap">
      {/* <h3 className="card-title">Segmentation Preview</h3> */}
      {entries.map((seg) => (
        <article key={seg.title} className="segment-card">
          <div className="segment-header">
            <span className="seg-label kind-paragraph">{seg.title}</span>
            <span className="seg-meta">{seg.text.length} characters</span>
          </div>
          <div className="segment-body">{seg.text}</div>
        </article>
      ))}
    </div>
  );
}

function segmentContent(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim());
  const segments = [];
  let idx = 1;
  const subjectLine = lines.find((l) => /^subject\b/i.test(l)) || lines[0] || "";
  if (subjectLine) {
    const txt = subjectLine.replace(/^subject:\s*/i, "");
    segments.push({ id: "subject", index: idx++, label: "Subject Line", kindClass: "kind-subject", text: txt, length: txt.length });
  }
  return segments;
}

function GlobalAssetCapture(apiRawJson, localSegments, langFromPrev = "EN") {
  const getIndexFromKey = (key, fallbackIdx) => {
    const m = String(key || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : fallbackIdx;
  };
  const first = Array.isArray(apiRawJson) ? apiRawJson[0] : apiRawJson;
  const output = first?.output;
  if (output && typeof output === "object" && !Array.isArray(output)) {
    return Object.keys(output).filter((k) => /^segment\b/i.test(k)).map((k, idx) => ({
      id: k, index: getIndexFromKey(k, idx + 1), source: String(output[k] ?? ""),
      words: String(output[k] || "").split(/\s+/).filter(Boolean).length, status: "Pending", lang: langFromPrev
    })).filter((s) => s.source.trim().length > 0).sort((a, b) => a.index - b.index);
  }
  return localSegments.map((seg, i) => ({
    id: seg.id || `seg-${i+1}`, index: seg.index || i+1, source: seg.text, 
    words: seg.text.split(/\s+/).filter(Boolean).length, status: "Pending", lang: langFromPrev
  }));
}