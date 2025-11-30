import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { registerServiceWorker } from "./lib/pwa";
import { initializeOneSignal } from "./lib/onesignal";
import ErrorBoundary from "./components/ErrorBoundary";

// Global error handler to catch and display errors
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; max-width: 600px; margin: 40px auto;">
        <h1 style="color: #dc2626;">⚠️ Application Error</h1>
        <p style="color: #666;">The application failed to start. Error details:</p>
        <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px;">${event.error?.stack || event.error?.message || 'Unknown error'}</pre>
        <p style="color: #666; margin-top: 20px;">Please contact support or try refreshing the page.</p>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Clear auth token and redirect to login
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Get JWT token from localStorage
        const token = localStorage.getItem("authToken");
        
        // Add Authorization header if token exists
        const headers = {
          ...(init?.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>
);

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Initialize OneSignal for push notifications (non-blocking)
if (import.meta.env.PROD) {
  initializeOneSignal().catch(err => {
    console.error('[OneSignal] Failed to initialize:', err);
    // Don't let OneSignal errors break the app
  });
}
