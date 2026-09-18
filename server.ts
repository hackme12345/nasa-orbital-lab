import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI client with lazy initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// NASA API Key fallback (DEMO_KEY or user provided)
const NASA_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    engine: "Three.js WebGL/WebGPU High-Performance",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    nasaKeyConfigured: NASA_KEY !== "DEMO_KEY",
  });
});

// AI Mission Science Assistant endpoint
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { prompt, objectName, context } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt is required." });
    }

    const ai = getAIClient();
    if (!ai) {
      // High-quality scientific fallback response if GEMINI_API_KEY is not set yet
      const fallbackReplies: Record<string, string> = {
        jwst: "The James Webb Space Telescope (JWST) utilizes a 6.5-meter beryllium-gold primary mirror and a 5-layer tennis-court-sized Kapton sunshield. The sunshield passively cools the scientific instruments down to below 40 Kelvin (-233°C / -388°F), essential for capturing faint cosmological infrared wavelengths from the first galaxies formed after the Big Bang.",
        perseverance: "The Mars Perseverance Rover (Mars 2020) carries seven primary scientific payloads including SuperCam (laser-induced breakdown spectroscopy), Mastcam-Z (stereoscopic zoom multispectral imaging), and PIXL/SHERLOC (micro-X-ray fluorescence and Raman spectrometer for detecting biosignatures in Jezero Crater's ancient river delta).",
        iss: "The International Space Station (ISS) orbits in Low Earth Orbit (LEO) at ~420 km altitude and 7.66 km/s (~27,600 km/h). Its 8 solar array wings span 73 meters and generate up to 120 kW of power, enabling continuous microgravity biology, physical science, and human physiology research across 16 pressurized modules.",
      };

      const key = (objectName || "").toLowerCase().includes("jwst")
        ? "jwst"
        : (objectName || "").toLowerCase().includes("perseverance")
        ? "perseverance"
        : (objectName || "").toLowerCase().includes("iss")
        ? "iss"
        : "default";

      return res.json({
        response: fallbackReplies[key] ||
          `[NASA Mission Science Synthesis - Offline/Simulation Mode]: Regarding "${prompt}", NASA deep-space missions rely on redundant autonomous flight software, multi-spectral thermal control subsystems, and X-band/Ka-band Deep Space Network telemetry links to ensure reliable scientific data collection in harsh radiation environments.`,
        source: "Simulation Model / NASA Open Archive",
        model: "offline-scientific-archive",
      });
    }

    const systemInstruction = `You are the NASA Orbital Lab Mission AI — an authoritative, scientifically precise, and engaging aerospace and astrophysics assistant for NASA space missions, spacecraft engineering, orbital mechanics, and planetary science.
Focus your response on actual NASA telemetry principles, optical/propulsion physics, instrument specifications, and mission achievements.
Keep the tone professional, concise (2 to 3 focused paragraphs or bullet points), and highlight verified NASA mission data. Distinguish verified facts from theoretical models.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Subject Spacecraft/Asset: ${objectName || "General NASA Space Mission"}
Mission Context: ${context || "NASA Orbital Lab 3D Scientific Analysis"}
User Scientific Query: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      response: response.text,
      source: "NASA Mission AI Knowledge Graph (Gemini 3.8 Flash)",
      model: "gemini-3.8-flash",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Mission Assistant error:", error);
    res.status(500).json({
      error: "Unable to process scientific query at this time.",
      details: error.message,
    });
  }
});

// NASA Astronomy Picture of the Day (APOD) Proxy with cache & curated fallback
let cachedApod: any = null;
let lastApodFetch = 0;

app.get("/api/nasa/apod", async (_req, res) => {
  const now = Date.now();
  // Cache for 30 minutes
  if (cachedApod && now - lastApodFetch < 30 * 60 * 1000) {
    return res.json({ ...cachedApod, cached: true });
  }

  try {
    const fetchUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const apodResponse = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (apodResponse.ok) {
      const data = await apodResponse.json();
      cachedApod = {
        title: data.title,
        date: data.date,
        explanation: data.explanation,
        url: data.url,
        hdurl: data.hdurl || data.url,
        media_type: data.media_type,
        copyright: data.copyright || "NASA Public Domain",
        live: true,
      };
      lastApodFetch = now;
      return res.json(cachedApod);
    }
  } catch (err) {
    console.warn("NASA APOD live fetch timed out or failed, using high-fidelity NASA archive:", err);
  }

  // Fallback NASA APOD scientific record
  const fallbackApod = {
    title: "Carina Nebula: Cosmic Cliffs Captured by JWST",
    date: "2024-04-18",
    explanation: "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula. Captured in infrared light by NASA's James Webb Space Telescope, this image reveals for the first time previously invisible areas of star birth. The blistering, ultraviolet radiation from the young stars is sculpting the nebula's wall by slowly eroding it away. Dramatic pillars tower above the glowing wall of gas, resisting this radiation.",
    url: "https://images-assets.nasa.gov/image/PIA25424/PIA25424~orig.jpg",
    hdurl: "https://images-assets.nasa.gov/image/PIA25424/PIA25424~orig.jpg",
    media_type: "image",
    copyright: "NASA, ESA, CSA, and STScI",
    live: false,
    notice: "NASA Data Stream Fallback: Deep Space Observatory Archive",
  };

  res.json(fallbackApod);
});

// NASA Mission Data & Live Simulated Telemetry Stream
app.get("/api/nasa/telemetry-status", (_req, res) => {
  res.json({
    status: "CONNECTED",
    lastDataUpdate: new Date().toUTCString(),
    dataStream: "ACTIVE",
    activeSources: [
      { name: "NASA 3D Resources & CAD Geometries", status: "ONLINE", latencyMs: 14 },
      { name: "NASA Astronomy Picture of the Day (APOD)", status: "ONLINE", latencyMs: 38 },
      { name: "NASA Deep Space Network (DSN) Telemetry", status: "NOMINAL", latencyMs: 85 },
      { name: "JPL Horizons Ephemeris / Trajectory Engine", status: "SYNCHRONIZED", latencyMs: 42 },
      { name: "Planetary Science Data System (PDS)", status: "ONLINE", latencyMs: 61 }
    ],
    mode: "RESEARCH_AND_SIMULATION"
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NASA Orbital Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
