// src/execution/nodes/image-series.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";
import axios from "axios";

interface ImageSeriesConfig {
  slideCount?: number; // default 5
  format?: string; // "1080x1080" | "1080x1350"
  theme?: string; // "dark" | "minimal" | "cyber"
}

export class ImageSeriesNode {
  private config: ImageSeriesConfig;

  constructor(config: any) {
    this.config = {
      slideCount: config.slideCount || 5,
      format: config.format || "1080x1350",
      theme: config.theme || "dark",
    };
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      const concept = input.concept || input.topic || "Distributed Systems Design";
      const apiKey = process.env.GEMINI_API_KEY;

      let slides = [
        {
          slideIndex: 1,
          type: "HOOK",
          heading: `How does ${concept} really work?`,
          subtext: "Stop overcomplicating it. Here is the 10x architect breakdown.",
          badge: "Slide 1/5",
        },
        {
          slideIndex: 2,
          type: "PROBLEM",
          heading: "The Monolithic Bottleneck",
          subtext: "Synchronous workflows and tight coupling cause cascade failures.",
          badge: "Slide 2/5",
        },
        {
          slideIndex: 3,
          type: "MECHANISM",
          heading: "The Decoupled Architecture",
          subtext: "Queues buffer the load. Workers scale horizontally on demand.",
          badge: "Slide 3/5",
        },
        {
          slideIndex: 4,
          type: "EXAMPLE",
          heading: "Production Flow",
          subtext: "Client -> API Gateway -> BullMQ Queue -> Worker Nodes -> Database.",
          badge: "Slide 4/5",
        },
        {
          slideIndex: 5,
          type: "SUMMARY",
          heading: "Core Takeaway",
          subtext: "Decouple orchestration from execution. Save for later!",
          badge: "Slide 5/5",
        },
      ];

      if (apiKey) {
        try {
          const prompt = `You are a Principal Tech Educator. Create a ${this.config.slideCount}-slide educational carousel on: "${concept}".
Output valid JSON array with ${this.config.slideCount} items: [{ "slideIndex": number, "type": string, "heading": string, "subtext": string, "badge": string }]`;

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
          console.warn("Gemini image-series fallback to template:", e?.message);
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
            previewUrl: `https://placehold.co/1080x1350/1e1e2e/ffffff.png?text=Slide+${idx + 1}:+${encodeURIComponent(s.heading || 'Concept')}`,
          })),
          status: "GENERATED",
        },
      };
    } catch (err: any) {
      return {
        success: false,
        errorMessage: `ImageSeriesNode failed: ${err?.message || err}`,
      };
    }
  }
}
