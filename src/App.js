
// src/App.jsx
import CallbackHandler from './components/CallbackHandler';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

 import GlocalizationFactory from './components/GlocalizationFactory';
 import GlocalizationPage from './components/GlocalizationFactory';// this is the destination page

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Pre_App from './Pre_App';
import ProtectedRoute from './components/ProtectedRoute';
import QuickActions from './components/GlocalizationHub';
import GlocalizationHub from './components/GlocalizationHub';
import ImportContentPage from './components/ImportContentPage';
import AssetImportContext from './components/AssetImportContext';
import GlobalAssetCapture from './components/GlobalAssetCapture';
import SmartTMTranslationHub from './components/SmartTMTranslationHub';
import CulturalAdaptationWorkspace from './components/CulturalAdaptationWorkspace';
import RegulatoryComplianceHub from './components/RegulatoryComplianceHub';
import DraftTranslationPage from './components/DraftTranslationPage';
import TMLeverageOverview from './components/TMLeverageOverview';
import TMAnalysis from './components/TMAnalysisPage';
import IntelligenceDashboard from './components/IntelligenceHubSection/IntelligenceDashboard';

function Auth() {
  // Example login: store a token then navigate to home
  const handleLogin = () => {
    localStorage.setItem('token', 'demo-token');
    window.location.href = '/';
  };

  return (
    <div className="container py-5">
      <h2 className="mb-3">Sign in</h2>
      <p className="text-muted">Demo login — replace with your real auth flow.</p>
      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default function App() {
  return (
    
      <Routes>
        <Route path="/auth" element={<Auth />} />
        {/* The specific route Azure looks for */}
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/" element={<ProtectedRoute><Pre_App /></ProtectedRoute>} />
        {<Route path="/glocalizationFactory" element={<ProtectedRoute><GlocalizationFactory /></ProtectedRoute>} />}
          { <Route path="/glocalizationHub" element={<ProtectedRoute><GlocalizationHub /></ProtectedRoute>} />}
           { <Route path="/importContentPage" element={<ProtectedRoute><ImportContentPage /></ProtectedRoute>} />}
           {<Route path="/adapt/confirm" element={<ProtectedRoute><AssetImportContext /></ProtectedRoute>} />}
            {<Route path="/globalAssetCapture" element={<ProtectedRoute><GlobalAssetCapture /></ProtectedRoute>} />}
             {<Route path="/smartTMTranslationHub" element={<ProtectedRoute><SmartTMTranslationHub /></ProtectedRoute>} />}
              {<Route path="/culturalAdaptationWorkspace" element={<ProtectedRoute><CulturalAdaptationWorkspace /></ProtectedRoute>} />}
 {<Route path="/regulatoryCompliance" element={<ProtectedRoute><RegulatoryComplianceHub /></ProtectedRoute>} />}
 {<Route path="/draftTranslationPage" element={<ProtectedRoute><DraftTranslationPage /></ProtectedRoute>} />}
 <Route path="/tm-analysis" element={<TMAnalysis />} />
{<Route path="/intelligenceDashboard" element={<ProtectedRoute><IntelligenceDashboard /></ProtectedRoute>} />}

      </Routes>
    
  );
}

// // src/App.jsx
// import CallbackHandler from './components/CallbackHandler';
// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './components/LoginPage';
// import IntelligenceDashboard from './components/IntelligenceHubSection/IntelligenceDashboard';
 
 
 
// import GlocalizationFactory from './components/GlocalizationFactory';
// import GlocalizationPage from './components/GlocalizationFactory';// this is the destination page
 
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.css';
 
// import Pre_App from './Pre_App';
// // import ProtectedRoute from './components/ProtectedRoute'; // Removed for testing
// import QuickActions from './components/GlocalizationHub';
// import GlocalizationHub from './components/GlocalizationHub';
// import ImportContentPage from './components/ImportContentPage';
// import AssetImportContext from './components/AssetImportContext';
// import GlobalAssetCapture from './components/GlobalAssetCapture';
// import SmartTMTranslationHub from './components/SmartTMTranslationHub';
// import CulturalAdaptationWorkspace from './components/CulturalAdaptationWorkspace';
// import RegulatoryComplianceHub from './components/RegulatoryComplianceHub';
// import DraftTranslationPage from './components/DraftTranslationPage';
// import TMLeverageOverview from './components/TMLeverageOverview';
// import TMAnalysis from './components/TMAnalysisPage';
 
// function Auth() {
//   // Example login: store a token then navigate to home
//   const handleLogin = () => {
//     localStorage.setItem('token', 'demo-token');
//     window.location.href = '/';
//   };
 
//   return (
// <div className="container py-5">
// <h2 className="mb-3">Sign in</h2>
// <p className="text-muted">Demo login — replace with your real auth flow.</p>
// <button className="btn btn-primary" onClick={handleLogin}>
//         Login
// </button>
// </div>
//   );
// }
 
// export default function App() {
//   return (
// <Routes>
// <Route path="/" element={<LoginPage />} />
// <Route path="/intelligenceDashboard" element={<IntelligenceDashboard />} />
// <Route path="/callback" element={<CallbackHandler />} />
// <Route path="/dashboard" element={<Pre_App />} />
// <Route path="/glocalizationFactory" element={<GlocalizationFactory />} />
// <Route path="/glocalizationHub" element={<GlocalizationHub />} />
// <Route path="/importContentPage" element={<ImportContentPage />} />
// <Route path="/adapt/confirm" element={<AssetImportContext />} />
// <Route path="/globalAssetCapture" element={<GlobalAssetCapture />} />
// <Route path="/smartTMTranslationHub" element={<SmartTMTranslationHub />} />
// <Route path="/culturalAdaptationWorkspace" element={<CulturalAdaptationWorkspace />} />
// <Route path="/regulatoryCompliance" element={<RegulatoryComplianceHub />} />
// <Route path="/draftTranslationPage" element={<DraftTranslationPage />} />
// <Route path="/tm-analysis" element={<TMAnalysis />} />
// </Routes>
//   );
// }
 
