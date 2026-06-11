import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const server =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://hireu-careerassistant.onrender.com"
    : "http://localhost:5000");
const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "394558418883-hc26qlpp0cnc37ud5i60mremkqm946qk.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </AppProvider>
  </StrictMode>
);
