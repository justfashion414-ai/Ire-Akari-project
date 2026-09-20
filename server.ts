import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const IMAGES_FILE = path.join(process.cwd(), "src", "custom-images.json");

// Helper to load custom images safely
function loadCustomImages() {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading custom images:", error);
  }
  return {};
}

// Helper to save custom images safely
function saveCustomImages(images: Record<string, string>) {
  try {
    const dir = path.dirname(IMAGES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving custom images:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits high to safely handle base64 image strings
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fetch all persistent custom images
  app.get("/api/images", (req, res) => {
    res.json(loadCustomImages());
  });

  // Save/Upload a persistent custom image
  app.post("/api/images", (req, res) => {
    const { key, base64 } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    const images = loadCustomImages();
    if (base64) {
      images[key] = base64;
    } else {
      delete images[key];
    }
    saveCustomImages(images);
    res.json({ success: true });
  });

  // Vite development middleware vs production static builds
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
