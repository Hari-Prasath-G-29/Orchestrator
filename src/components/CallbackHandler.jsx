// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// const CallbackHandler = () => {
//   const [status, setStatus] = useState("Authenticating...");

//   const navigate = useNavigate();

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);

//     const code = urlParams.get("code");

//     if (code) {
//       const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/auth/token`;

//       fetch(apiUrl, {
//         method: "POST",

//         headers: { "Content-Type": "application/json" },

//         body: JSON.stringify({ code: code }),
//       })
//         .then((response) => {
//           if (!response.ok) throw new Error("Backend authentication failed");

//           return response.json();
//         })

//         .then((data) => {
//           if (data.access_token) {
//             localStorage.setItem("token", data.access_token);

//             // Login successful! Move the user to the main page

//             navigate("/dashboard");
//           } else {
//             setStatus("Authentication failed. Please try logging in again.");
//           }
//         })

//         .catch((error) => {
//           console.error("SSO Error:", error);

//           setStatus("A network error occurred during login.");
//         });
//     } else {
//       setStatus("Invalid callback URL. No authorization code found.");
//     }
//   }, [navigate]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         marginTop: "100px",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <h2>{status}</h2>
//     </div>
//   );
// };

// export default CallbackHandler;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CallbackHandler = () => {
  const [status, setStatus] = useState("Authenticating...");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      
      if (!baseUrl) {
        setStatus("Error: REACT_APP_API_BASE_URL is not defined in .env");
        return;
      }

      const apiUrl = `${baseUrl}/api/auth/token`;
      console.log("Attempting to exchange code at:", apiUrl);

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Backend Error: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            navigate("/dashboard");
          } else {
            setStatus("Authentication failed. No token received.");
          }
        })
        .catch((error) => {
          console.error("SSO Callback Error:", error);
          setStatus("A network error occurred. Is your Python backend running?");
        });
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h2>{status}</h2>
    </div>
  );
};

export default CallbackHandler;