import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
const queryClient = new QueryClient();
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}
const root = createRoot(rootElement);
root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </BrowserRouter>
);
