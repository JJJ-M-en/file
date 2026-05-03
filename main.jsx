import { StrictMode }  from "react";
import { createRoot }  from "react-dom/client";
import { globalStyles } from "./styles";
import App from "./App";

// Inject global keyframes + resets (fonts are already in index.html)
const styleEl = document.createElement("style");
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
