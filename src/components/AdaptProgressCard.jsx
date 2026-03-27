
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhaseProgressBar from './PhaseProgressBar';
import { computeProgress, deleteProject } from '../lib/progressStore';
import { PHASES } from '../lib/progressStore';
import { Trash2 } from 'lucide-react';
import {
  Brain,
  Shield,
  Zap,
} from 'lucide-react';

export default function AdaptProgressCard({ record }) {
  const navigate = useNavigate();
  const { completedSet, doneCount, total, nextPhase } = computeProgress(record);

  //Hari - 24/03
// ✅ NEW: Dynamically build the title using the market code (e.g., "JP" or "CN")
  // const baseTitle = record.meta?.title || '(Untitled)';
  // const marketCode = Array.isArray(record.meta?.marketCodes) && record.meta.marketCodes.length > 0 
  //   ? record.meta.marketCodes[0] 
  //   : null;
    
  // // Strip out any accidental old suffixes so we don't get double "- JP - JP Adaptation"
  // const cleanTitle = baseTitle.replace(/\s*-\s*[A-Z]{2}\s*Adaptation/i, '');
  // const displayTitle = marketCode ? `${cleanTitle} - ${marketCode} Adaptation` : cleanTitle;

  // ✅ 1. Get the base title safely
  const baseTitle = record.meta?.title || '(Untitled)';

  // ✅ 2. Aggressively clean ANY trailing hyphens or old adaptation suffixes
  const cleanTitle = baseTitle
    .replace(/\s*-\s*[A-Za-z]{2,10}\s*Adaptation/i, '')
    .replace(/\s*-\s*Adaptation/i, '')
    .replace(/\s*-\s*$/, '')
    .trim();

  // ✅ NEW: Map full country/language names to clean 2-letter codes
  const mapToCode = (val) => {
    if (!val) return null;
    const codeMap = {
      "Japan": "JP", "Japanese": "JP",
      "China": "CN", "Chinese": "CN",
      "Germany": "DE", "German": "DE"
    };
    return codeMap[val.trim()] || val.trim();
  };

  // ✅ 3. Robust Multi-Tier Market Extraction
  let rawMarketCode = null;

  if (Array.isArray(record.meta?.marketCodes) && record.meta.marketCodes.length > 0) {
    rawMarketCode = record.meta.marketCodes[0];
  } else if (record.meta?.targetLang) {
    rawMarketCode = record.meta.targetLang;
  } else if (typeof record.meta?.therapyArea === 'string') {
    const match = record.meta.therapyArea.match(/·\s*([A-Za-z-]+)/);
    if (match) rawMarketCode = match[1];
  }

  // Run the extracted code through our new dictionary!
  const marketCode = mapToCode(rawMarketCode);

  // ✅ 4. Safely construct the final beautiful title
  const displayTitle = marketCode ? `${cleanTitle} - ${marketCode} Adaptation` : cleanTitle;

  // Hari-25/3 - NEW: Check if the 4 target phases are completed
  const targetPhases = 4;
  const isCardComplete = doneCount >= targetPhases;
  
console.debug('AdaptProgressCard progress:', {
  projectId: record.id,
  completed: Array.from(completedSet),
  doneCount,
  total,
  nextPhase
});

  const onResume = () => {
    if (!nextPhase) return; // all complete
    const route = nextPhase.route || '/';
    //Hari - 24/03
    navigate(route, { state: { projectId: record.id, projectName: displayTitle } });
  };

  const onDelete = () => {
    deleteProject(record.id);
  };

  return (
    <article className="ap-card">
      <header className="ap-header">
        <div>
          {/*Hari - 24/03*/}
          <h4 className="ap-title">{displayTitle}</h4>
          <div className="ap-sub">
            <span className="chip small">Content</span>
            <span className="sep">·</span>
            <span>{record.meta?.therapeuticContext || record.meta?.domain || '—'}</span>
          </div>
        </div>
        {/* <span className="ap-status chip chip-blue">In Progress</span> */}
        {/* Hari-25/3 : FIXED: Badge now changes color and text dynamically */}
        <span className={`ap-status chip ${isCardComplete ? "chip-green" : "chip-blue"}`}>
          {isCardComplete ? "Completed" : "In Progress"}
        </span>
      </header>

      <div className="ap-section">
        <PhaseProgressBar completedSet={completedSet} nextPhase={nextPhase} />
      </div>
      <div className="ap-divider" />
      <div className="ap-grid">
          <div className="ap-row">
          <div className="ap-label">Target Markets</div>
          <div className="ap-value">
            {/* ✅ FIXED: Safely map arrays (like ['Japan']) OR use the fallback marketCode */}
            {Array.isArray(record.meta?.marketCodes) && record.meta.marketCodes.length > 0
              ? record.meta.marketCodes.map(mapToCode).join(', ')
              : (marketCode || '—')}
          </div>
        </div>
        <div className="ap-row">
          <div className="ap-label">Languages</div>
          <div className="ap-value">{record.meta?.marketsCount ?? 0}</div>
        </div>
      </div>
      <div className="ap-divider" />
      
<div className="ap-metrics">
  <Metric
    icon={Brain}
    label="Cultural"
    value={completedSet.has('P3') ? '100%' : '0%'}
  />
  <Metric
    icon={Shield}
    label="Regulatory"
    value={completedSet.has('P4') ? '100%' : '0%'}
  />
  <Metric
    icon={Zap}
    label="TM Leverage"
    value={completedSet.has('P2') ? '100%' : '0%'}
  />
</div>


      <footer className="ap-footer">
        <button className="ap-btn ap-btn--primary" onClick={onResume}>Resume Work</button>
        <button className="ap-btn ap-btn--ghost" onClick={onDelete}><Trash2 size={16} /> Delete</button>
      </footer>
    </article>
  );
}


function Metric({ icon: Icon, label, value }) {
  return (
    <div className="ap-metric">
      <div className="ap-metric-top">
        {Icon && <Icon size={18} className="ap-metric-icon" aria-hidden="true" />}
       
      </div>
      <div> <span className="ap-metric-label">{label}</span></div>
      <div className="ap-metric-value">{value}</div>
    </div>
  );
}


