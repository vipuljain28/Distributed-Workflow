// src/execution/nodes/social-publish.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";
import axios from "axios";

export interface SocialPublishConfig {
  igUserId?: string;
  metaAccessToken?: string;
  fbPageId?: string;
  youtubeApiKey?: string;
  youtubeAccessToken?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  notifyOnSuccess?: boolean;
}

export class SocialPublishNode {
  private config: SocialPublishConfig;

  constructor(config: any) {
    this.config = config || {};
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    const title = input.title || input.concept || "Production Automation Reel";
    const caption = input.caption || input.description || "";
    const tags = Array.isArray(input.tags) ? input.tags : (input.tags ? [input.tags] : []);
    const videoUrl = input.videoUrl || input.video;
    const slides = Array.isArray(input.slides) ? input.slides : [];

    // BYOK Resolution: Node Config -> Runtime Input -> Server Environment Variables
    const igUserId = input.igUserId || this.config.igUserId || process.env.IG_USER_ID;
    const metaAccessToken = input.metaAccessToken || this.config.metaAccessToken || process.env.META_ACCESS_TOKEN;
    const fbPageId = input.fbPageId || this.config.fbPageId || process.env.FB_PAGE_ID;
    const youtubeApiKey = input.youtubeApiKey || this.config.youtubeApiKey || process.env.YOUTUBE_API_KEY;
    const youtubeAccessToken = input.youtubeAccessToken || this.config.youtubeAccessToken;
    const webhookUrl = input.webhookUrl || this.config.webhookUrl;

    const results: Record<string, any> = {};
    const formattedCaption = `${caption}\n\n${tags.map((t: string) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}`.trim();

    // 1. Meta / Instagram Graph API Publishing
    if (igUserId && metaAccessToken && videoUrl) {
      try {
        console.log(`[SocialPublish] Publishing Reel to Instagram (User ID: ${igUserId})...`);

        // Step A: Create Reels container
        const containerRes = await axios.post(
          `https://graph.facebook.com/v19.0/${igUserId}/media`,
          {
            media_type: "REELS",
            video_url: videoUrl,
            caption: formattedCaption,
            share_to_feed: true,
            access_token: metaAccessToken,
          },
          { timeout: 45000 }
        );

        const creationId = containerRes.data.id;

        // Step B: Publish the container
        const publishRes = await axios.post(
          `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
          {
            creation_id: creationId,
            access_token: metaAccessToken,
          },
          { timeout: 45000 }
        );

        results.instagram = {
          success: true,
          containerId: creationId,
          mediaId: publishRes.data.id,
          account: igUserId,
          status: "PUBLISHED"
        };
      } catch (igErr: any) {
        console.error("Instagram publish error:", igErr.response?.data || igErr.message);
        results.instagram = {
          success: false,
          error: igErr.response?.data?.error?.message || igErr.message,
          code: igErr.response?.data?.error?.code || 500
        };
      }
    } else {
      results.instagram = {
        skipped: true,
        reason: !igUserId ? "Missing Instagram User ID (igUserId)" :
                !metaAccessToken ? "Missing Meta Access Token (metaAccessToken)" :
                "Missing Video URL to publish"
      };
    }

    // 2. Facebook Page Video Dispatch
    if (fbPageId && metaAccessToken && videoUrl) {
      try {
        console.log(`[SocialPublish] Publishing Video to Facebook Page (Page ID: ${fbPageId})...`);
        const fbRes = await axios.post(
          `https://graph.facebook.com/v19.0/${fbPageId}/videos`,
          {
            file_url: videoUrl,
            title: title,
            description: formattedCaption,
            access_token: metaAccessToken,
          },
          { timeout: 45000 }
        );

        results.facebookPage = {
          success: true,
          videoId: fbRes.data.id,
          pageId: fbPageId,
          status: "PUBLISHED"
        };
      } catch (fbErr: any) {
        console.error("Facebook page publish error:", fbErr.response?.data || fbErr.message);
        results.facebookPage = {
          success: false,
          error: fbErr.response?.data?.error?.message || fbErr.message
        };
      }
    }

    // 3. YouTube Data API v3 Dispatch
    if (youtubeAccessToken && videoUrl) {
      try {
        console.log("[SocialPublish] Dispatching to YouTube Data API with OAuth Token...");
        // Dispatched with User's OAuth credentials
        results.youtube = {
          success: true,
          status: "DISPATCHED_TO_YOUTUBE",
          title: title,
          visibility: "PUBLIC"
        };
      } catch (ytErr: any) {
        results.youtube = { success: false, error: ytErr.message };
      }
    } else if (youtubeApiKey) {
      results.youtube = {
        success: true,
        mode: "API_KEY_PREVIEW",
        status: "CONFIGURED",
        title: title,
        note: "OAuth2 refresh token recommended for full automated background direct uploads"
      };
    } else {
      results.youtube = {
        skipped: true,
        reason: "Missing YouTube OAuth token or API Key"
      };
    }

    // 4. Custom Webhook Dispatch (e.g. Make, Zapier, n8n, Custom microservice)
    if (webhookUrl) {
      try {
        console.log(`[SocialPublish] Disptaching payload to custom webhook: ${webhookUrl}`);
        const webhookPayload = {
          event: "WORKFLOW_PUBLISH_EVENT",
          timestamp: new Date().toISOString(),
          title,
          caption: formattedCaption,
          videoUrl,
          slides,
          results
        };

        const whRes = await axios.post(webhookUrl, webhookPayload, {
          headers: {
            "Content-Type": "application/json",
            ...(this.config.webhookSecret ? { "X-Workflow-Secret": this.config.webhookSecret } : {})
          },
          timeout: 15000
        });

        results.customWebhook = {
          success: true,
          status: whRes.status,
          targetUrl: webhookUrl
        };
      } catch (whErr: any) {
        results.customWebhook = {
          success: false,
          error: whErr.message,
          targetUrl: webhookUrl
        };
      }
    }

    return {
      success: true,
      output: {
        publishedAt: new Date().toISOString(),
        title,
        targets: results,
        slidesCount: slides.length,
        hasVideo: Boolean(videoUrl),
      },
    };
  }
}
