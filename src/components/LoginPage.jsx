// import React from "react";

// const LoginPage = () => {
//   const handleLoginClick = () => {
//     const clientId = process.env.REACT_APP_AZURE_CLIENT_ID;

//     const tenantId = process.env.REACT_APP_AZURE_TENANT_ID;

//     const redirectUri = encodeURIComponent(
//       process.env.REACT_APP_AZURE_REDIRECT_URI,
//     );

//     // Delegated scopes required for login

//     const scope = encodeURIComponent("openid profile email User.Read");

//     const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_…`;

//     window.location.href = authUrl;
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <h1>Content Orchestrator</h1>
//       <p>Please sign in to access your workspace.</p>
//       <button
//         onClick={handleLoginClick}
//         style={{
//           padding: "12px 24px",
//           fontSize: "16px",
//           cursor: "pointer",
//           backgroundColor: "#0033A0",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//         }}
//       >
//         Sign In with Cognizant SSO
//       </button>
//     </div>
//   );
// };

// export default LoginPage;

import React from "react";

const LoginPage = () => {
  const handleLoginClick = () => {
    const clientId = process.env.REACT_APP_AZURE_CLIENT_ID;
    const tenantId = process.env.REACT_APP_AZURE_TENANT_ID;
    const redirectUriRaw = process.env.REACT_APP_AZURE_REDIRECT_URI;

    // DIAGNOSTIC LOGS: Press F12 in your browser to check these
    console.log("Checking .env variables...");
    console.log("Client ID:", clientId);
    console.log("Tenant ID:", tenantId);
    console.log("Redirect URI:", redirectUriRaw);

    if (!clientId || !tenantId || !redirectUriRaw) {
      alert("STOP: Your .env variables are still 'undefined'. You MUST restart your npm server terminal (Ctrl+C then npm start).");
      return;
    }

    const redirectUri = encodeURIComponent(redirectUriRaw);
    const scope = encodeURIComponent("openid profile email User.Read");

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;

    window.location.href = authUrl;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <h1>Content Orchestrator</h1>
      <p>Please sign in to access your workspace.</p>
      <button
        onClick={handleLoginClick}
        style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer", backgroundColor: "#0033A0", color: "white", border: "none", borderRadius: "4px" }}
      >
        Sign In with Cognizant SSO
      </button>
    </div>
  );
};

export default LoginPage;