import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./app/providers";

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Missing #root");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
