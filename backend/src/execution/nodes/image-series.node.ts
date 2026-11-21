// src/execution/nodes/image-series.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";
import axios from "axios";

export interface ImageSeriesConfig {
  slideCount?: number; // default 5
  format?: "1080x1350" | "1080x1080";
  theme?: "dark" | "minimal" | "cyber" | "corporate";
  geminiApiKey?: string;
  customPrompt?: string;
}

export class ImageSeriesNode {
  private config: ImageSeriesConfig;

  constructor(config: any) {
    this.config = {
      slideCount: config?.slideCount || 5,
      format: config?.format || "1080x1350",
      theme: config?.theme || "dark",
      geminiApiKey: config?.geminiApiKey,
      customPrompt: config?.customPrompt,
    };
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      const concept = input.prompt || input.concept || input.topic || this.config.customPrompt || "Production Architecture Blueprint";
      const apiKey = input.geminiApiKey || this.config.geminiApiKey || process.env.GEMINI_API_KEY;
      const slideCount = this.config.slideCount || 5;

      let slides = [
        {
          slideIndex: 1,
          type: "HOOK",
          heading: `How does ${concept} really scale?`,
          subtext: "Stop overcomplicating your stack. Here is the 10x architect breakdown.",
          badge: "Slide 1/5",
        },
        {
          slideIndex: 2,
          type: "PROBLEM",
          heading: "The Synchronous Chokepoint",
          subtext: "Heavy tasks running directly inside HTTP handlers will crash your server under peak traffic.",
          badge: "Slide 2/5",
        },
        {
          slideIndex: 3,
          type: "ARCHITECTURE",
          heading: "The Decoupled Pattern",
          subtext: "API Gateway pushes jobs to BullMQ Redis. Stateless workers process jobs asynchronously.",
          badge: "Slide 3/5",
        },
        {
          slideIndex: 4,
          type: "IMPLEMENTATION",
          heading: "Production Flow & Edge Cases",
          subtext: "Implement idempotent execution, dead-letter queues, and atomic database state transitions.",
          badge: "Slide 4/5",
        },
        {
          slideIndex: 5,
          type: "SUMMARY",
          heading: "Architect Blueprint",
          subtext: "Decouple orchestration from execution. Save this slide deck for reference!",
          badge: "Slide 5/5",
        },
      ];

      if (apiKey) {
        try {
          const prompt = `You are a Principal Technical Content Architect.
Create a ${slideCount}-slide educational carousel on: "${concept}".
Style: ${this.config.theme} aesthetic, highly actionable, concise.
Output valid JSON array with ${slideCount} items: [{ "slideIndex": number, "type": string, "heading": string, "subtext": string, "badge": string }]`;

          const aiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            },
            { timeout: 30000 }
          );

          slides = JSON.parse(aiRes.data.candidates[0].content.parts[0].text);
        } catch (e: any) {
          console.warn("[ImageSeries] Gemini prompt fallback to template:", e?.message);
        }
      }

      return {
        success: true,
        output: {
          concept,
          mediaType: "IMAGE_SERIES",
          format: this.config.format,
          slideCount: slides.length,
          slides: slides.map((s, idx) => ({
            ...s,
            previewUrl: `https://placehold.co/1080x1350/0f172a/38bdf8.png?text=Slide+${idx + 1}:+${encodeURIComponent(s.heading || concept)}`,
          })),
          status: "GENERATED",
        },
      };
    } catch (err: any) {
      return {
        success: false,
        errorMessage: err.message,
      };
    }
  }
}
