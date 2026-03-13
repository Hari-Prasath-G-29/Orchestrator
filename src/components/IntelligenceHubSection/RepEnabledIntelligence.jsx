// import React from "react";
//   import "./IntelligenceCss/IntelligenceDashboard.css";
  
//   export default function WebsiteIntelligence() {
//    return ( 
//  <div className="ihub-card ihub-intelCard">
//     <div className="ihub-intelHead">
//       <div className="ihub-intelTitle">
//         <span className="ihub-dot indigo"></span>
//         <div>
//           <div className="ihub-intelName">Rep‑Enabled Intelligence</div>
//           <div className="ihub-intelSubtitle">Field activity and content effectiveness insights</div>
//         </div>
//       </div>
//     </div>

//     {/* mini stats */}
//     <div className="ihub-miniRow">
//       <div className="ihub-mini peach">
//         <div className="ihub-miniValue">1,000</div>
//         <div className="ihub-miniLabel">Total Calls</div>
//       </div>
//       <div className="ihub-mini sky">
//         <div className="ihub-miniValue">5.4</div>
//         <div className="ihub-miniLabel">Avg Engagement</div>
//       </div>
//       <div className="ihub-mini mint">
//         <div className="ihub-miniValue">0</div>
//         <div className="ihub-miniLabel">Content Pieces</div>
//       </div>
//       <div className="ihub-mini purple">
//         <div className="ihub-miniValue">4</div>
//         <div className="ihub-miniLabel">Active NBIAs</div>
//       </div>
//     </div>

//     {/* tabs */}
//     <div className="ihub-tabs">
//       <button className="ihub-tab active">Activity Heatmap</button>
//       <button className="ihub-tab">Content</button>
//       <button className="ihub-tab">Next Best Actions</button>
//       <button className="ihub-tab">Trends</button>
//     </div>

//     {/* Activity section */}
//     <div className="ihub-softHeader">Activity by Specialty &amp; Region</div>

//     <div className="ihub-activityList">
//       <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">HIV Specialist</div>
//           <div className="ihub-activitySub">Northeast</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">90 calls</span>
//           <span className="ihub-chip green">5.3 engagement</span>
//         </div>
//       </div>

//       <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Infectious Disease</div>
//           <div className="ihub-activitySub">Southeast</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">90 calls</span>
//           <span className="ihub-chip green">5.4 engagement</span>
//         </div>
//       </div>

//       <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Primary Care</div>
//           <div className="ihub-activitySub">Midwest</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">87 calls</span>
//           <span className="ihub-chip green">5.5 engagement</span>
//         </div>
//       </div>

//         <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Internal Medicine</div>
//           <div className="ihub-activitySub">West</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">85 calls</span>
//           <span className="ihub-chip green">5.2 engagement</span>
//         </div>
//       </div>

//         <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">HIV Specialist</div>
//           <div className="ihub-activitySub">Southwest</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">83 calls</span>
//           <span className="ihub-chip green">5.1 engagement</span>
//         </div>
//       </div>

//         <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Infectious Disease</div>
//           <div className="ihub-activitySub">Northwest</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">82 calls</span>
//           <span className="ihub-chip green">5.1 engagement</span>
//         </div>
//       </div>

//         <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Primary Care</div>
//           <div className="ihub-activitySub">Northeast</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">82 calls</span>
//           <span className="ihub-chip green">5.0 engagement</span>
//         </div>
//       </div>

//         <div className="ihub-activityRow">
//         <div className="ihub-activityMain">
//           <div className="ihub-activityName">Internal Medicine</div>
//           <div className="ihub-activitySub">Southeast</div>
//         </div>
//         <div className="ihub-activityRight">
//           <span className="ihub-qty">82 calls</span>
//           <span className="ihub-chip green">5.5 engagement</span>
//         </div>
//       </div>

//     </div>
//   </div>
//    );
// }

import React, { useState } from "react";
import "./IntelligenceCss/IntelligenceDashboard.css";
import "./IntelligenceCss/RepEnabled.css";
import { Users } from 'lucide-react';

export default function WebsiteIntelligence() {
  const [activeTab, setActiveTab] = useState("Activity Heatmap");

  return (
    <div className="ihub-card ihub-intelCard">
     <div className="ihub-intelHead">
  <div className="ihub-intelTitle">
    <Users className="ihub-header-icon rep-orange" size={24} />
    <div>
      <div className="ihub-intelName">Rep‑Enabled Intelligence</div>
      <div className="ihub-intelSubtitle">Field activity and content effectiveness insights</div>
    </div>
  </div>
</div>

      {/* mini stats */}
      <div className="ihub-miniRow">
        <div className="ihub-mini peach">
          <div className="ihub-miniIcon">👤</div>
          <div className="ihub-miniValue">1,000</div>
          <div className="ihub-miniLabel">Total Calls</div>
        </div>
        <div className="ihub-mini sky">
          <div className="ihub-miniIcon">📊</div>
          <div className="ihub-miniValue">5.4</div>
          <div className="ihub-miniLabel">Avg Engagement</div>
        </div>
        <div className="ihub-mini mint">
          <div className="ihub-miniIcon">📄</div>
          <div className="ihub-miniValue">0</div>
          <div className="ihub-miniLabel">Content Pieces</div>
        </div>
        <div className="ihub-mini purple">
          <div className="ihub-miniIcon">🎯</div>
          <div className="ihub-miniValue">4</div>
          <div className="ihub-miniLabel">Active NBAs</div>
        </div>
      </div>

      {/* tabs */}
      <div className="ihub-tabs-container">
        <div className="ihub-tabs">
          {["Activity Heatmap", "Content", "Next Best Actions", "Trends"].map((tab) => (
            <button
              key={tab}
              className={`ihub-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Routing */}
      <div className="ihub-tab-content">
        
        {/* --- ACTIVITY HEATMAP TAB --- */}
        {activeTab === "Activity Heatmap" && (
          <>
            <div className="ihub-softHeader">
              <span className="ihub-loc-icon">📍</span> Activity by Specialty &amp; Region
            </div>
            <div className="ihub-activityList">
              {[
                { name: "HIV Specialist", sub: "Northeast", calls: "90", eng: "5.3" },
                { name: "Infectious Disease", sub: "Southeast", calls: "90", eng: "5.4" },
                { name: "Primary Care", sub: "Midwest", calls: "87", eng: "5.5" },
                { name: "Internal Medicine", sub: "West", calls: "85", eng: "5.2" },
                { name: "HIV Specialist", sub: "Southwest", calls: "83", eng: "5.1" },
                { name: "Infectious Disease", sub: "Northwest", calls: "82", eng: "5.1" },
                { name: "Primary Care", sub: "Northeast", calls: "82", eng: "5.0" },
                { name: "Internal Medicine", sub: "Southeast", calls: "82", eng: "5.5" },
              ].map((item, idx) => (
                <div className="ihub-activityRow" key={idx}>
                  <div className="ihub-activityMain">
                    <div className="ihub-activityName">{item.name}</div>
                    <div className="ihub-activitySub">{item.sub}</div>
                  </div>
                  <div className="ihub-activityRight">
                    <span className="ihub-qty">{item.calls} calls</span>
                    <span className="ihub-chip green">{item.eng} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- CONTENT TAB --- */}
        {activeTab === "Content" && (
          <>
            <div className="ihub-banner mint-banner">
              <div className="ihub-banner-title">
                <span className="ihub-banner-icon">📄</span> Content Effectiveness
              </div>
              <div className="ihub-banner-sub">See which content pieces drive the highest HCP engagement.</div>
            </div>
            <button className="ihub-action-bar">
               <span className="ihub-magic-icon">✨</span> Generate Sales Aid
            </button>
          </>
        )}

        {/* --- NEXT BEST ACTIONS TAB --- */}
        {activeTab === "Next Best Actions" && (
          <>
            <div className="ihub-banner purple-banner">
              <div className="ihub-banner-title">
                <span className="ihub-banner-icon">🎯</span> Next Best Actions
              </div>
              <div className="ihub-banner-sub">Most effective follow-up actions from field visits.</div>
            </div>
            <div className="ihub-activityList">
              {[
                { name: "Follow-up", sub: "Recommended 254 times", conv: "30%" },
                { name: "Sample Request", sub: "Recommended 253 times", conv: "35%" },
                { name: "Educational Material", sub: "Recommended 248 times", conv: "40%" },
                { name: "Clinical Discussion", sub: "Recommended 245 times", conv: "36%" },
              ].map((item, idx) => (
                <div className="ihub-activityRow" key={idx}>
                  <div className="ihub-activityMain">
                    <div className="ihub-activityName">{item.name}</div>
                    <div className="ihub-activitySub">{item.sub}</div>
                  </div>
                  <div className="ihub-activityRight">
                    <span className="ihub-conversion-chip">{item.conv} conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- TRENDS TAB --- */}
        {activeTab === "Trends" && (
          <>
            <div className="ihub-banner sky-banner">
              <div className="ihub-banner-title">
                <span className="ihub-banner-icon">📈</span> Engagement Trends
              </div>
            </div>
            <div className="ihub-activityList">
              {[
                { name: "Aug 2024", calls: "268", eng: "7.5" },
                { name: "Sep 2024", calls: "289", eng: "7.8" },
                { name: "Oct 2024", calls: "256", eng: "7.4" },
                { name: "Nov 2024", calls: "312", eng: "8.1" },
              ].map((item, idx) => (
                <div className="ihub-activityRow" key={idx}>
                  <div className="ihub-activityMain">
                    <div className="ihub-activityName">{item.name}</div>
                  </div>
                  <div className="ihub-activityRight">
                    <span className="ihub-qty">{item.calls} calls</span>
                    <span className="ihub-chip green">{item.eng} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}