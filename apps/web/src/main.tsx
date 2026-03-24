import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { makeRouter } from "./app/router";

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Missing #root");
}

const router = makeRouter();

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
