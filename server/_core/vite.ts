import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";

export async function setupVite(app: Express, server: Server) {
  // Dynamic import of Vite only in development mode
  const { createServer: createViteServer } = await import("vite");
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Load the vite config file using Vite's config resolution
  // This way, the config file is only loaded in dev mode and its imports
  // won't be bundled into production
  const vite = await createViteServer({
    configFile: path.resolve(import.meta.dirname, "../..", "vite.config.ts"),
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the server runs from dist/index.js
  // Try multiple possible paths for static files
  let distPath: string;
  
  if (process.env.NODE_ENV === "development") {
    distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  } else {
    // Try different possible locations in production
    const possiblePaths = [
      path.resolve(process.cwd(), "dist", "public"),
      path.join(process.cwd(), "dist", "public"),
      path.resolve(process.cwd(), "public"),
    ];
    
    console.log("[Static Files] Searching for static files...");
    console.log("[Static Files] Current working directory:", process.cwd());
    
    distPath = possiblePaths.find(p => {
      const exists = fs.existsSync(p);
      console.log(`[Static Files] Checking ${p}: ${exists ? '✓ FOUND' : '✗ not found'}`);
      return exists;
    }) || possiblePaths[0];
  }
  
  console.log(`[Static Files] Using path: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static Files] ERROR: Could not find the build directory: ${distPath}`
    );
    console.error("[Static Files] Available files in current directory:");
    try {
      const files = fs.readdirSync(process.cwd());
      console.error(files);
    } catch (e) {
      console.error("Could not list files:", e);
    }
  } else {
    console.log("[Static Files] ✓ Static files directory found");
    const files = fs.readdirSync(distPath);
    console.log("[Static Files] Files in directory:", files);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`[Static Files] ERROR: index.html not found at ${indexPath}`);
      res.status(500).send("Application files not found. Please check server logs.");
    }
  });
}
