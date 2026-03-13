 import React from "react";
  import "./IntelligenceCss/IntelligenceDashboard.css";
  
  export default function WebsiteIntelligence() {
   return (
 <div className="ihub-card ihub-intelCard">
    <div className="ihub-intelHead">
      <div className="ihub-intelTitle">
        <span className="ihub-dot pink"></span>
        <div>
          <div className="ihub-intelName">Social Intelligence</div>
          <div className="ihub-intelSubtitle">Social listening insights for all audiences</div>
        </div>
      </div>
    </div>

    {/* mini stats */}
    <div className="ihub-miniRow">
      <div className="ihub-mini violet">
        <div className="ihub-miniValue">1,000</div>
        <div className="ihub-miniLabel">Total Mentions</div>
      </div>
      <div className="ihub-mini green">
        <div className="ihub-miniValue">34%</div>
        <div className="ihub-miniLabel">Positive Sentiment</div>
      </div>
      <div className="ihub-mini blue">
        <div className="ihub-miniValue">3</div>
        <div className="ihub-miniLabel">Trending topics</div>
      </div>
      <div className="ihub-mini orange">
        <div className="ihub-miniValue">7</div>
        <div className="ihub-miniLabel">Platforms</div>
      </div>
    </div>

    {/* tabs */}
    <div className="ihub-tabs">
      <button className="ihub-tab active">Platforms</button>
      <button className="ihub-tab">Topics</button>
      <button className="ihub-tab">Top Mentions</button>
    </div>

    {/* Platform list */}
    <div className="ihub-platform">
      <div className="ihub-platformHead">
        <div className="ihub-platformName">Twitter/X</div>
        <span className="ihub-pillLite">146 mentions</span>
      </div>

      <div className="ihub-sentRow">
        <span className="ihub-sentLabel pos">Positive</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill pos" style={{ width: "34%" }}></span>
        </div>
        <span className="ihub-sentPct">34%</span>
      </div>
      <div className="ihub-sentRow">
        <span className="ihub-sentLabel neu">Neutral</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill neu" style={{ width: "36%" }}></span>
        </div>
        <span className="ihub-sentPct">36%</span>
      </div>
      <div className="ihub-sentRow">
        <span className="ihub-sentLabel neg">Negative</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill neg" style={{ width: "30%" }}></span>
        </div>
        <span className="ihub-sentPct neg">30%</span>
      </div>
    </div>

    <div className="ihub-platform">
      <div className="ihub-platformHead">
        <div className="ihub-platformName">TikTok</div>
        <span className="ihub-pillLite">144 mentions</span>
      </div>

      <div className="ihub-sentRow">
        <span className="ihub-sentLabel pos">Positive</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill pos" style={{ width: "35%" }}></span>
        </div>
        <span className="ihub-sentPct">35%</span>
      </div>
      <div className="ihub-sentRow">
        <span className="ihub-sentLabel neu">Neutral</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill neu" style={{ width: "30%" }}></span>
        </div>
        <span className="ihub-sentPct">30%</span>
      </div>
      <div className="ihub-sentRow">
        <span className="ihub-sentLabel neg">Negative</span>
        <div className="ihub-barTrack">
          <span className="ihub-barFill neg" style={{ width: "35%" }}></span>
        </div>
        <span className="ihub-sentPct neg">35%</span>
      </div>
    </div>
    {/* Instagram */}
<div className="ihub-platform">
  <div className="ihub-platformHead">
    <div className="ihub-platformName">Instagram</div>
    <span className="ihub-pillLite">144 mentions</span>
  </div>

  <div className="ihub-sentRow">
    <span className="ihub-sentLabel pos">Positive</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill pos" style={{ width: "35%" }}></span>
    </div>
    <span className="ihub-sentPct">35%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neu">Neutral</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neu" style={{ width: "30%" }}></span>
    </div>
    <span className="ihub-sentPct">30%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neg">Negative</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neg" style={{ width: "35%" }}></span>
    </div>
    <span className="ihub-sentPct neg">35%</span>
  </div>
</div>

{/* Reddit */}
<div className="ihub-platform">
  <div className="ihub-platformHead">
    <div className="ihub-platformName">Reddit</div>
    <span className="ihub-pillLite">143 mentions</span>
  </div>

  <div className="ihub-sentRow">
    <span className="ihub-sentLabel pos">Positive</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill pos" style={{ width: "29%" }}></span>
    </div>
    <span className="ihub-sentPct">29%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neu">Neutral</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neu" style={{ width: "36%" }}></span>
    </div>
    <span className="ihub-sentPct">36%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neg">Negative</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neg" style={{ width: "34%" }}></span>
    </div>
    <span className="ihub-sentPct neg">34%</span>
  </div>
</div>

{/* LinkedIn */}
<div className="ihub-platform">
  <div className="ihub-platformHead">
    <div className="ihub-platformName">LinkedIn</div>
    <span className="ihub-pillLite">142 mentions</span>
  </div>

  <div className="ihub-sentRow">
    <span className="ihub-sentLabel pos">Positive</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill pos" style={{ width: "36%" }}></span>
    </div>
    <span className="ihub-sentPct">36%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neu">Neutral</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neu" style={{ width: "35%" }}></span>
    </div>
    <span className="ihub-sentPct">35%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neg">Negative</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neg" style={{ width: "30%" }}></span>
    </div>
    <span className="ihub-sentPct neg">30%</span>
  </div>
</div>

{/* Facebook */}
<div className="ihub-platform">
  <div className="ihub-platformHead">
    <div className="ihub-platformName">Facebook</div>
    <span className="ihub-pillLite">142 mentions</span>
  </div>

  <div className="ihub-sentRow">
    <span className="ihub-sentLabel pos">Positive</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill pos" style={{ width: "30%" }}></span>
    </div>
    <span className="ihub-sentPct">30%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neu">Neutral</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neu" style={{ width: "35%" }}></span>
    </div>
    <span className="ihub-sentPct">35%</span>
  </div>
  <div className="ihub-sentRow">
    <span className="ihub-sentLabel neg">Negative</span>
    <div className="ihub-barTrack">
      <span className="ihub-barFill neg" style={{ width: "35%" }}></span>
    </div>
    <span className="ihub-sentPct neg">35%</span>
  </div>
</div>
</div>
   );
}