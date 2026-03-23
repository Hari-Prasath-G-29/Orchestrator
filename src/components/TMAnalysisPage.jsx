import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./css/Translationhub.css";

const TMAnalysis = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Destructure data passed from SmartTMTranslationHub 
  const { segment, reviewData, allSegments = [] } = state || {};
  
  // 1. Calculate GLOBAL Project-Wide Score and Words
  const { 
    globalLeveragePct, 
    exactWords, 
    fuzzyWords, 
    newWords, 
    totalProjectWords 
  } = useMemo(() => {
    // Fallback to single segment if allSegments is missing for any reason
    const segmentsToProcess = allSegments.length > 0 ? allSegments : [segment].filter(Boolean);

    let exactSegCount = 0;
    let fuzzySegCount = 0;

    let exactW = 0;
    let fuzzyW = 0;
    let newW = 0;
    let totalW = 0;

    segmentsToProcess.forEach(seg => {
      let rawScore = 0;
      if (typeof seg.matchScore === 'number') {
        rawScore = seg.matchScore;
      } else if (seg.reviewData && typeof seg.reviewData.tmScore === 'number') {
        rawScore = seg.reviewData.tmScore <= 1 ? seg.reviewData.tmScore * 100 : seg.reviewData.tmScore;
      } else if (seg.translated && seg.translated.trim() !== "" && seg.translated !== "— Awaiting translation —") {
        rawScore = 100;
      }

      const score = Math.round(rawScore);
      const w = seg.words || 0;
      totalW += w;

      // Allocate words based on score exactly like the Overview tab
      if (score >= 95) {
        exactSegCount++;
        exactW += w;
      } else if (score >= 70) {
        fuzzySegCount++;
        fuzzyW += w;
      } else {
        newW += w;
      }
    });

    const totalSegs = segmentsToProcess.length;
    const leveragePct = totalSegs > 0 ? Math.round(((exactSegCount + fuzzySegCount) / totalSegs) * 100) : 0;

    return {
      globalLeveragePct: leveragePct,
      exactWords: exactW,
      fuzzyWords: fuzzyW,
      newWords: newW,
      totalProjectWords: totalW
    };
  }, [allSegments, segment]);

  // 2. Glossary Count (Kept specific to the current segment)
  const glossaryCount = reviewData?.glossaryUsed 
    ? Object.keys(reviewData.glossaryUsed).length 
    : 0;

  const glossaryKeys = reviewData?.glossaryUsed ? Object.keys(reviewData.glossaryUsed) : [];

  // Mock Quality Data
  const qualityData = {
    sentiment: "Neutral",
    safetyStatus: "Pass",
    tone: "Professional",
    backTranslation: "Appropriate considerations for administering ConditionY to suitable patients." 
  };
  
// import React, { useState, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const TMAnalysis = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const [isAccordionOpen, setIsAccordionOpen] = useState(false);

//   // Destructure data passed from SmartTMTranslationHub 
//   // const { segment, reviewData } = state || {};
  
//   // // // 1. Calculate Score and Total Words
//   // // const rawScore = reviewData?.tmScore || 0;
//   // // const scorePercentage = Math.round(rawScore * 100);
//   // // const totalWords = segment?.words || 0;

//   // // 1. Calculate Score and Total Words
//   // // 🆕 Fallback: If no explicit score is provided but the segment is translated, assume 100% (1.0)
//   // const rawScore = reviewData?.tmScore !== undefined 
//   //   ? reviewData.tmScore 
//   //   : (segment?.translated ? 1 : 0);
//   // const scorePercentage = Math.round(rawScore * 100);
//   // const totalWords = segment?.words || 0;
  
//   // // 2. Dynamic Word Calculation Logic
//   // const { exactWords, fuzzyWords, newWords } = useMemo(() => {
//   //   let exact = 0;
//   //   let fuzzy = 0;
//   //   let nevv = 0; 

//   //   if (rawScore >= 0.95) {
//   //     exact = totalWords;
//   //   } else if (rawScore >= 0.70) {
//   //     fuzzy = totalWords;
//   //   } else {
//   //     nevv = totalWords;
//   //   }
//   //   return { exactWords: exact, fuzzyWords: fuzzy, newWords: nevv };
//   // }, [rawScore, totalWords]);
//   // Destructure data passed from SmartTMTranslationHub 

//   //score calculation logic updated to handle both matchScore and tmScore
//   const { segment, reviewData } = state || {};
  
//   // 1. Unified Score Calculation (Matches Overview & Draft Panel)
//   const scorePercentage = useMemo(() => {
//     let rawScore = 0;
//     if (typeof segment?.matchScore === 'number') {
//       rawScore = segment.matchScore;
//     } else if (reviewData && typeof reviewData.tmScore === 'number') {
//       rawScore = reviewData.tmScore <= 1 ? reviewData.tmScore * 100 : reviewData.tmScore;
//     } else if (segment?.translated && segment.translated.trim() !== "" && segment.translated !== "— Awaiting translation —") {
//       rawScore = 100;
//     }
//     return Math.round(rawScore);
//   }, [segment, reviewData]);

//   const totalWords = segment?.words || 0;
  
//   // 2. Dynamic Word Calculation Logic
//   const { exactWords, fuzzyWords, newWords } = useMemo(() => {
//     let exact = 0;
//     let fuzzy = 0;
//     let nevv = 0; 

//     // We use scorePercentage directly now (e.g., 100, 75, 0)
//     if (scorePercentage >= 95) {
//       exact = totalWords;
//     } else if (scorePercentage >= 70) {
//       fuzzy = totalWords;
//     } else {
//       nevv = totalWords;
//     }
//     return { exactWords: exact, fuzzyWords: fuzzy, newWords: nevv };
//   }, [scorePercentage, totalWords]);

//   // 3. NEW: Calculate Glossary Count
//   // We check if glossaryUsed exists, then count the keys (terms)
//   const glossaryCount = reviewData?.glossaryUsed 
//     ? Object.keys(reviewData.glossaryUsed).length 
//     : 0;

//   const glossaryKeys = reviewData?.glossaryUsed ? Object.keys(reviewData.glossaryUsed) : [];

//   // Mock Quality Data (using real glossary count now)
//   const qualityData = {
//     sentiment: "Neutral",
//     safetyStatus: "Pass",
//     tone: "Professional",
//     backTranslation: "Appropriate considerations for administering ConditionY to suitable patients." 
//   };

  return (
    <div className="tm-analysis-page">
      <div className="tm-analysis-container">
        {/* Header */}
        <header className="tm-analysis-header">
          <div className="tm-header-main">
            <span className="tm-analysis-icon">📊</span>
            <div className="tm-title-block">
              <h2>Translation Memory Analysis</h2>
              <p>Word-level TM leverage breakdown for this segment</p>
            </div>
          </div>
          <button className="tm-close-x" onClick={() => navigate(-1)} aria-label="Close">×</button>
        </header>

        <div className="tm-analysis-body">
          {/* Section 1: Translation Summary */}
          {/* <div className="tm-summary-section">
            <div className="tm-summary-card-header">
              <span className="tm-summary-icon-small">📈</span>
              <div className="tm-summary-text">
                <h3>Translation Summary</h3>
                <p>Segment {segment?.index || 1} • {totalWords} source words • {totalWords} translated words</p>
              </div>
            </div>

            <div className="tm-stats-grid">
              {/* 1. TM LEVERAGE */}
              {/* <div className="tm-stat-card tm-leverage-card">
                <span className="tm-stat-value">{scorePercentage}%</span>
                <span className="tm-stat-label">TM LEVERAGE</span>
              </div> */} 
              {/* Section 1: Translation Summary */}
          <div className="tm-summary-section">
            <div className="tm-summary-card-header">
              <span className="tm-summary-icon-small">📈</span>
              <div className="tm-summary-text">
                <h3>Project Translation Summary</h3>
                {/* Updated to show Project Total words */}
                <p>Analyzing Segment {segment?.index || 1} • Project Total: {totalProjectWords} words</p>
              </div>
            </div>

            <div className="tm-stats-grid">
              {/* 1. TM LEVERAGE */}
              <div className="tm-stat-card tm-leverage-card">
                {/* Updated to use globalLeveragePct */}
                <span className="tm-stat-value">{globalLeveragePct}%</span>
                <span className="tm-stat-label">TM LEVERAGE</span>
              </div>

              {/* 2. EXACT MATCHES */}
              <div className="tm-stat-card">
                <span className="tm-stat-label-top">Exact Matches</span>
                <span className={exactWords > 0 ? "tm-stat-value-green" : "tm-stat-value-zero"}>
                  {exactWords} words
                </span>
              </div>

              {/* 3. FUZZY MATCHES */}
              <div className="tm-stat-card">
                <span className="tm-stat-label-top">Fuzzy Matches</span>
                <span className={fuzzyWords > 0 ? "tm-stat-value-orange" : "tm-stat-value-zero"}>
                  {fuzzyWords} words
                </span>
              </div>

              {/* 4. NEW: GLOSSARY TERMS CARD */}
              <div className="tm-stat-card">
                <span className="tm-stat-label-top">Glossary Terms</span>
                <span className={glossaryCount > 0 ? "tm-stat-value-blue" : "tm-stat-value-zero"}>
                  {glossaryCount} terms
                </span>
              </div>

              {/* 5. NEW WORDS (Full Width) */}
              <div className="tm-stat-card tm-new-words-card">
                <span className="tm-stat-label-top">New Words (AI Generated)</span>
                <span className={newWords > 0 ? "tm-stat-value-blue" : "tm-stat-value-zero"}>
                  {newWords} words
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: AI Quality Assessment */}
          <div className="tm-quality-assessment">
            <div className="tm-quality-header">
              <span className="tm-spark-icon">✨</span>
              <h3>AI Quality Assessment</h3>
            </div>
            
            <div className="tm-quality-badges">
                <div className="tm-q-badge">
                    <span className="tm-q-label">Sentiment</span>
                    <span className="tm-q-val success">Matched ({qualityData.sentiment})</span>
                </div>
                <div className="tm-q-badge">
                    <span className="tm-q-label">Safety Check</span>
                    <span className="tm-q-val success">{qualityData.safetyStatus}</span>
                </div>
                <div className="tm-q-badge">
                    <span className="tm-q-label">Glossary Terms</span>
                    {/* Using dynamic count here too */}
                    <span className="tm-q-val blue">{glossaryCount} Found</span>
                </div>
            </div>
            
            <p className="tm-quality-sub">Summary scores above - expand Full AI Analysis below for detailed breakdown</p>
          </div>

          <p className="tm-expand-instruction">Expand below for comprehensive analysis with detailed explanations</p>

          {/* Section 3: Accordion for Full Analysis */}
          <div className="tm-analysis-accordion">
            <button 
                className={`tm-accordion-trigger ${isAccordionOpen ? 'open' : ''}`}
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <div className="tm-trigger-left">
                <span className="tm-doc-icon">📄</span>
                <span className="tm-trigger-title">View Full AI Analysis</span>
                <span className="tm-badge-detailed">Detailed Breakdown</span>
              </div>
              <span className="tm-chevron">{isAccordionOpen ? '▲' : '▼'}</span>
            </button>

            {isAccordionOpen && (
                <div className="tm-accordion-content">
                    {/* Glossary Table */}
                    <div className="tm-detail-block">
                        <h4>📚 Glossary Term Adherence</h4>
                        {glossaryCount > 0 ? (
                            <table className="tm-glossary-table">
                                <thead>
                                    <tr>
                                        <th>Term (Source)</th>
                                        <th>Translation (Target)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {glossaryKeys.map((term, i) => (
                                        <tr key={i}>
                                            <td>{term}</td>
                                            <td>{reviewData.glossaryUsed[term]}</td>
                                            <td><span className="tm-tag success">Applied</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="tm-empty-text">No glossary terms detected in this segment.</div>
                        )}
                    </div>

                    <div className="tm-divider"></div>

                    {/* Tone & Back Trans */}
                    <div className="tm-detail-grid">
                        <div className="tm-detail-item">
                            <h4>🗣️ Tone Analysis</h4>
                            <p>The translation maintains a <strong>{qualityData.tone}</strong> tone consistent with the medical domain requirements.</p>
                        </div>
                        <div className="tm-detail-item">
                            <h4>🔄 AI Back-Translation</h4>
                            <div className="tm-back-trans-box">
                                <em>"{qualityData.backTranslation}"</em>
                            </div>
                            <span className="tm-caption">Reverse translation to verify meaning accuracy.</span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TMAnalysis;