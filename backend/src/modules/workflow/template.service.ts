// src/modules/workflow/template.service.ts
import { prisma } from "../../db/client";

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  tags: string[];
  nodes: Array<{
    name: string;
    type: string;
    position: number;
    config?: any;
  }>;
  edges: Array<{
    fromIndex: number;
    toIndex: number;
  }>;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "viral-reel-studio",
    name: "Viral Reel Studio (4-Beat Dynamic Video)",
    category: "Video & Reels",
    badge: "Most Popular",
    description: "4-Beat high-retention video pipeline: Hook -> Reality Check -> The Breakthrough -> Outro CTA. Supports custom prompts, voiceover tone, 9:16 rendering, human-in-the-loop review, and multi-app publishing.",
    tags: ["Viral Reel Studio", "4-Beat Storyboard", "Instagram Reels", "YouTube Shorts", "Human Approval"],
    nodes: [
      {
        name: "Trigger / Prompt Input",
        type: "START",
        position: 1,
        config: { defaultTopic: "Building 10x Scalable Distributed Systems" },
      },
      {
        name: "4-Beat AI Video Director",
        type: "REEL_RENDER",
        position: 2,
        config: {
          template: "4-beat",
          aspectRatio: "9:16",
          targetDurationSec: 30,
          voiceoverTone: "energetic",
          customPrompt: "Explain how to decouple backend architectures using event-driven queues.",
        },
      },
      {
        name: "Human-in-the-Loop Review Gate",
        type: "APPROVAL_GATE",
        position: 3,
        config: {
          requireManualApproval: true,
          notifyEmail: "admin@workflow.local",
        },
      },
      {
        name: "Meta / Instagram & YouTube Dispatch",
        type: "SOCIAL_PUBLISH",
        position: 4,
        config: {
          igUserId: "",
          metaAccessToken: "",
          youtubeApiKey: "",
          targetFeed: "REELS",
        },
      },
      {
        name: "Completed",
        type: "END",
        position: 5,
        config: {},
      },
    ],
    edges: [
      { fromIndex: 0, toIndex: 1 },
      { fromIndex: 1, toIndex: 2 },
      { fromIndex: 2, toIndex: 3 },
      { fromIndex: 3, toIndex: 4 },
    ],
  },
  {
    id: "social-media-cron",
    name: "Daily Multi-Channel Content Automation (Cron)",
    category: "Social Media Automation",
    badge: "Scheduled",
    description: "Automated recurring daily cron trigger generating parallel 9:16 vertical videos and 5-slide educational carousels. Includes automated SEO captions, human review checkpoint, and auto-publishing.",
    tags: ["Cron Trigger", "Daily Automation", "Dual-Track", "Carousels", "Reels", "Multi-Channel"],
    nodes: [
      {
        name: "Daily 9:00 AM Cron Trigger",
        type: "START",
        position: 1,
        config: { cronSchedule: "0 9 * * *" },
      },
      {
        name: "Concept & Script Generator",
        type: "ACTION",
        position: 2,
        config: {
          prompt: "Generate today's trending high-impact software architecture topic with hooks and takeaways.",
        },
      },
      {
        name: "9:16 Vertical Video Renderer",
        type: "REEL_RENDER",
        position: 3,
        config: {
          template: "4-beat",
          aspectRatio: "9:16",
          targetDurationSec: 30,
        },
      },
      {
        name: "5-Slide Carousel Deck Generator",
        type: "IMAGE_SERIES",
        position: 4,
        config: {
          slideCount: 5,
          format: "1080x1350",
          theme: "dark",
        },
      },
      {
        name: "Approval Gate (Review & Edit)",
        type: "APPROVAL_GATE",
        position: 5,
        config: { requireManualApproval: true },
      },
      {
        name: "Social Media Multi-App Publisher",
        type: "SOCIAL_PUBLISH",
        position: 6,
        config: {
          igUserId: "",
          metaAccessToken: "",
          youtubeApiKey: "",
        },
      },
      {
        name: "End",
        type: "END",
        position: 7,
        config: {},
      },
    ],
    edges: [
      { fromIndex: 0, toIndex: 1 },
      { fromIndex: 1, toIndex: 2 },
      { fromIndex: 1, toIndex: 3 },
      { fromIndex: 2, toIndex: 4 },
      { fromIndex: 3, toIndex: 4 },
      { fromIndex: 4, toIndex: 5 },
      { fromIndex: 5, toIndex: 6 },
    ],
  },
  {
    id: "educational-carousel",
    name: "Educational 5-Slide Carousel Studio",
    category: "Carousels & LinkedIn",
    badge: "High Engagement",
    description: "Deep-dive 5-slide visual slide deck generator: Hook -> Problem -> Architecture -> Production Code/Walkthrough -> Summary Takeaways. Ready for Instagram and LinkedIn.",
    tags: ["Carousel", "LinkedIn", "Instagram", "Dark Aesthetic", "Slide Deck"],
    nodes: [
      {
        name: "Topic / Article Input",
        type: "START",
        position: 1,
        config: { topic: "How Database Connection Pools Prevent Exhaustion" },
      },
      {
        name: "5-Slide Visual Slide Deck",
        type: "IMAGE_SERIES",
        position: 2,
        config: {
          slideCount: 5,
          format: "1080x1350",
          theme: "cyber",
        },
      },
      {
        name: "Human Approval Checkpoint",
        type: "APPROVAL_GATE",
        position: 3,
        config: { requireManualApproval: true },
      },
      {
        name: "Webhook / Social Dispatch",
        type: "WEBHOOK_DISPATCH",
        position: 4,
        config: {
          webhookUrl: "",
          method: "POST",
        },
      },
      {
        name: "End",
        type: "END",
        position: 5,
        config: {},
      },
    ],
    edges: [
      { fromIndex: 0, toIndex: 1 },
      { fromIndex: 1, toIndex: 2 },
      { fromIndex: 2, toIndex: 3 },
      { fromIndex: 3, toIndex: 4 },
    ],
  },
  {
    id: "custom-automation",
    name: "Custom Blank Workflow (Build From Scratch)",
    category: "Custom",
    badge: "Flexible",
    description: "Completely open visual DAG canvas. Connect triggers, HTTP requests, conditions, webhooks, or custom logic freely.",
    tags: ["Custom Flow", "Blank Canvas", "Any API"],
    nodes: [
      {
        name: "Start Trigger",
        type: "START",
        position: 1,
        config: {},
      },
      {
        name: "End",
        type: "END",
        position: 2,
        config: {},
      },
    ],
    edges: [{ fromIndex: 0, toIndex: 1 }],
  },
];

export async function instantiateTemplate(templateId: string, userId: string, customName?: string) {
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template with id '${templateId}' not found.`);
  }

  // 1. Create Workflow in DB
  const workflow = await prisma.workflow.create({
    data: {
      name: customName || template.name,
      description: template.description,
      ownerId: userId,
    },
  });

  // 2. Create Nodes
  const createdNodes: any[] = [];
  for (const n of template.nodes) {
    const node = await prisma.node.create({
      data: {
        workflowId: workflow.id,
        name: n.name,
        type: n.type as any,
        position: n.position,
        config: n.config || {},
      },
    });
    createdNodes.push(node);
  }

  // 3. Create Edges
  for (const e of template.edges) {
    const fromNode = createdNodes[e.fromIndex];
    const toNode = createdNodes[e.toIndex];
    if (fromNode && toNode) {
      await prisma.edge.create({
        data: {
          workflowId: workflow.id,
          fromNodeId: fromNode.id,
          toNodeId: toNode.id,
        },
      });
    }
  }

  // Return hydrated workflow
  return prisma.workflow.findUnique({
    where: { id: workflow.id },
    include: {
      nodes: true,
      edges: true,
    },
  });
}
