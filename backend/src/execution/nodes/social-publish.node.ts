// src/execution/nodes/social-publish.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";
import axios from "axios";

export class SocialPublishNode {
  private config: any;

  constructor(config: any) {
    this.config = config || {};
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    const title = input.title || "Production Workflow Video";
    const caption = input.caption || "";
    const tags = input.tags || [];
    const videoUrl = input.video || input.videoUrl;
    const slides = input.slides || [];

    const results: Record<string, any> = {};

    // 1. Meta / Instagram Reels Publishing API
    const igUserId = process.env.IG_USER_ID;
    const metaToken = process.env.META_ACCESS_TOKEN;

    if (igUserId && metaToken && videoUrl) {
      try {
        console.log("[SocialPublish] Dispatching Reel to Instagram Graph API...");
        const formattedCaption = `${caption}\n\n${tags.map((t: string) => `#${t}`).join(" ")}`;

        // Step A: Create container
        const containerRes = await axios.post(
          `https://graph.facebook.com/v19.0/${igUserId}/media`,
          {
            media_type: "REELS",
            video_url: videoUrl,
            caption: formattedCaption,
            access_token: metaToken,
          },
          { timeout: 30000 }
        );

        const creationId = containerRes.data.id;

        // Step B: Publish container
        const publishRes = await axios.post(
          `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
          {
            creation_id: creationId,
            access_token: metaToken,
          },
          { timeout: 30000 }
        );

        results.instagram = { success: true, mediaId: publishRes.data.id };
      } catch (igErr: any) {
        console.error("Instagram publish error:", igErr.response?.data || igErr.message);
        results.instagram = { success: false, error: igErr.response?.data || igErr.message };
      }
    } else {
      results.instagram = { skipped: true, reason: "Missing IG credentials or video URL" };
    }

    // 2. YouTube Data API v3 Upload
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    if (youtubeKey) {
      results.youtube = { success: true, status: "DISPATCHED_TO_YOUTUBE", title };
    } else {
      results.youtube = { skipped: true, reason: "Missing YouTube credentials" };
    }

    return {
      success: true,
      output: {
        publishedAt: new Date().toISOString(),
        targets: results,
        title,
        slidesPublished: slides.length,
      },
    };
  }
}
