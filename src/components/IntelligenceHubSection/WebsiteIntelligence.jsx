//  import React from "react";
//  import "./IntelligenceCss/IntelligenceDashboard.css";
 
//  export default function WebsiteIntelligence() {
//   return (
//  <div className="ihub-ciCard">
//       <div className="ihub-ciHead">
//         <div className="ihub-ciTitle">
//           <span className="ihub-ciIcon globe">🌐</span>
//           <div>
//             <div className="ihub-ciName">Website Intelligence</div>
//             <div className="ihub-ciSubtitle">Performance insights for all visitors</div>
//           </div>
//         </div>
//       </div>

//       <div className="ihub-kpiRow">
//         <div className="ihub-kpi">
//           <div className="ihub-kpiValue primary">186s</div>
//           <div className="ihub-kpiLabel">Avg Session</div>
//         </div>
//         <div className="ihub-kpi">
//           <div className="ihub-kpiValue">0</div>
//           <div className="ihub-kpiLabel">Pages/Session</div>
//         </div>
//         <div className="ihub-kpi">
//           <div className="ihub-kpiValue">0%</div>
//           <div className="ihub-kpiLabel">Return Rate</div>
//         </div>
//         <div className="ihub-kpi">
//           <div className="ihub-kpiValue">0</div>
//           <div className="ihub-kpiLabel">Active Pages</div>
//         </div>
//       </div>
//        <div className="ihub-card ihub-panel">
//     <div className="ihub-tabs">
//       <button className="ihub-tab active">Top Pages</button>
//       <button className="ihub-tab">Downloads</button>
//       <button className="ihub-tab">Search Terms</button>
//       <button className="ihub-tab">CTAs</button>
//       <button className="ihub-tab">Journey</button>
//     </div>

//     <div className="ihub-panelBody empty">
//       {/* Intentionally blank to match screenshot placeholder area */}
//     </div>
//   </div>
//     </div>
//   );
//     }

import React from "react";
import "./IntelligenceCss/IntelligenceDashboard.css";
import "./IntelligenceCss/WebsiteIntelligence.css";

export default function WebsiteIntelligence() {
  return (
    <div className="ihub-ciCard-exact">
      {/* Header */}
      <div className="ihub-header-exact">
        <div className="ihub-title-row">
          <svg className="ihub-globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <h2>Website Intelligence</h2>
        </div>
        <p className="ihub-subtitle-exact">Performance insights for all visitors</p>
      </div>

      {/* KPI Row */}
      <div className="ihub-kpi-grid">
        {/* Blue Card */}
        <div className="ihub-kpi-box box-blue">
          <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div className="kpi-val">186s</div>
          <div className="kpi-label">Avg Session</div>
        </div>

        {/* Green Card */}
        <div className="ihub-kpi-box box-green">
          <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <div className="kpi-val">0</div>
          <div className="kpi-label">Pages/Session</div>
        </div>

        {/* Purple Card */}
        <div className="ihub-kpi-box box-purple">
          <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <div className="kpi-val">0%</div>
          <div className="kpi-label">Return Rate</div>
        </div>

        {/* Orange Card */}
        <div className="ihub-kpi-box box-orange">
          <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          <div className="kpi-val">0</div>
          <div className="kpi-label">Active Pages</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ihub-tabs-wrapper">
        <button className="ihub-tab-btn active">Top Pages</button>
        <button className="ihub-tab-btn">Downloads</button>
        <button className="ihub-tab-btn">Search Terms</button>
        <button className="ihub-tab-btn">CTAs</button>
        <button className="ihub-tab-btn">Journey</button>
      </div>
    </div>
  );
}
