import React, { useState } from "react";
import { WorkflowAPI } from "../api/workflow";

type Props = {
  workflowId?: string;
  onCreated: () => void;
};

const NODE_DEFINITIONS: Record<string, { label: string; defaultCfg: any }> = {
  START: {
    label: "Trigger / Start",
    defaultCfg: { topic: "Distributed Systems Architecture", cronSchedule: "" },
  },
  REEL_RENDER: {
    label: "Viral Reel Studio (9:16 Video)",
    defaultCfg: {
      template: "4-beat",
      aspectRatio: "9:16",
      targetDurationSec: 30,
      voiceoverTone: "energetic",
      customPrompt: "",
      geminiApiKey: "",
    },
  },
  IMAGE_SERIES: {
    label: "Visual Carousel Studio (5-Slides)",
    defaultCfg: {
      slideCount: 5,
      format: "1080x1350",
      theme: "dark",
      customPrompt: "",
      geminiApiKey: "",
    },
  },
  APPROVAL_GATE: {
    label: "Human Approval Gate",
    defaultCfg: {
      requireManualApproval: true,
      notifyEmail: "",
    },
  },
  SOCIAL_PUBLISH: {
    label: "Social Multi-App Publish",
    defaultCfg: {
      igUserId: "",
      metaAccessToken: "",
      fbPageId: "",
      youtubeApiKey: "",
      targetFeed: "REELS",
      webhookUrl: "",
    },
  },
  WEBHOOK_DISPATCH: {
    label: "Webhook Dispatch",
    defaultCfg: {
      webhookUrl: "https://httpbin.org/post",
      method: "POST",
      secret: "",
    },
  },
  ACTION: {
    label: "AI Prompt / Action",
    defaultCfg: { prompt: "Transform input data into structured copy" },
  },
  HTTP: {
    label: "HTTP Request",
    defaultCfg: {
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      timeoutMs: 5000,
    },
  },
  CONDITION: {
    label: "Condition / Branch",
    defaultCfg: { expression: "output.status == 200" },
  },
  DELAY: {
    label: "Delay / Wait",
    defaultCfg: { seconds: 5 },
  },
  EMAIL: {
    label: "Email Dispatch",
    defaultCfg: {
      to: "creator@domain.com",
      subject: "Workflow Alert",
      text: "Pipeline execution completed successfully.",
    },
  },
  SLACK: {
    label: "Slack Notification",
    defaultCfg: {
      channel: "#general",
      message: "Workflow finished.",
    },
  },
  SHEETS: {
    label: "Google Sheets",
    defaultCfg: { sheetId: "", range: "Sheet1!A1" },
  },
  END: {
    label: "End / Terminal",
    defaultCfg: {},
  },
};

export default function NodeForm({ workflowId, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("REEL_RENDER");
  const [position, setPosition] = useState(1);
  const [cfg, setCfg] = useState<any>(NODE_DEFINITIONS["REEL_RENDER"].defaultCfg);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonStr, setRawJsonStr] = useState(JSON.stringify(NODE_DEFINITIONS["REEL_RENDER"].defaultCfg, null, 2));

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const def = NODE_DEFINITIONS[newType]?.defaultCfg || {};
    setCfg(def);
    setRawJsonStr(JSON.stringify(def, null, 2));
    if (!name) {
      setName(NODE_DEFINITIONS[newType]?.label || newType);
    }
  };

  const updateCfgField = (field: string, val: any) => {
    const updated = { ...cfg, [field]: val };
    setCfg(updated);
    setRawJsonStr(JSON.stringify(updated, null, 2));
  };

  const save = async () => {
    if (!workflowId) return;

    try {
      const finalConfig = showRawJson ? JSON.parse(rawJsonStr) : cfg;
      await WorkflowAPI.createNode(workflowId, {
        name: name || NODE_DEFINITIONS[type]?.label || type,
        type,
        position,
        config: finalConfig,
      });
      setName("");
      onCreated();
    } catch (e: any) {
      alert("Invalid configuration or API error: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="border border-slate-800 p-4 mb-4 bg-slate-900/60 rounded-2xl backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-white">Add Workflow Node</h3>
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
        >
          {showRawJson ? "Visual Form" : "Raw JSON"}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Node Type
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {Object.keys(NODE_DEFINITIONS).map((k) => (
              <option key={k} value={k}>
                {NODE_DEFINITIONS[k].label} ({k})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Node Name
          </label>
          <input
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="e.g. 4-Beat AI Video Director"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Node-specific visual fields */}
        {!showRawJson ? (
          <div className="space-y-2 border-t border-slate-800/80 pt-2 text-xs">
            {type === "REEL_RENDER" && (
              <>
                <div>
                  <label className="block text-slate-400 text-[10px]">Storyboard Template</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                    value={cfg.template || "4-beat"}
                    onChange={(e) => updateCfgField("template", e.target.value)}
                  >
                    <option value="4-beat">Viral 4-Beat (Hook → Reality → Solution → Outro)</option>
                    <option value="educational">Educational 30s Breakdown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Custom Prompt / Topic</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                    placeholder="e.g. Distributed Database Consistency Models"
                    value={cfg.customPrompt || ""}
                    onChange={(e) => updateCfgField("customPrompt", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Gemini API Key (BYOK)</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="AIzaSy... (optional, uses server default if empty)"
                    value={cfg.geminiApiKey || ""}
                    onChange={(e) => updateCfgField("geminiApiKey", e.target.value)}
                  />
                </div>
              </>
            )}

            {type === "IMAGE_SERIES" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">Slide Count</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                      value={cfg.slideCount || 5}
                      onChange={(e) => updateCfgField("slideCount", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Theme Style</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                      value={cfg.theme || "dark"}
                      onChange={(e) => updateCfgField("theme", e.target.value)}
                    >
                      <option value="dark">Dark Slate</option>
                      <option value="cyber">Cyber Neon</option>
                      <option value="minimal">Minimal Clean</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Carousel Topic / Prompt</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                    placeholder="e.g. 5 Common System Design Bottlenecks"
                    value={cfg.customPrompt || ""}
                    onChange={(e) => updateCfgField("customPrompt", e.target.value)}
                  />
                </div>
              </>
            )}

            {type === "SOCIAL_PUBLISH" && (
              <>
                <div>
                  <label className="block text-slate-400 text-[10px]">Instagram User ID (igUserId)</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="17841400000000000"
                    value={cfg.igUserId || ""}
                    onChange={(e) => updateCfgField("igUserId", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Meta Long-Lived Access Token</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="EAAB..."
                    value={cfg.metaAccessToken || ""}
                    onChange={(e) => updateCfgField("metaAccessToken", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">YouTube API Key / OAuth Token</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="AIzaSy... or ya29..."
                    value={cfg.youtubeApiKey || ""}
                    onChange={(e) => updateCfgField("youtubeApiKey", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Custom Dispatch Webhook (Optional)</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="https://hook.make.com/..."
                    value={cfg.webhookUrl || ""}
                    onChange={(e) => updateCfgField("webhookUrl", e.target.value)}
                  />
                </div>
              </>
            )}

            {type === "WEBHOOK_DISPATCH" && (
              <>
                <div>
                  <label className="block text-slate-400 text-[10px]">Webhook URL</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="https://api.yourdomain.com/v1/events"
                    value={cfg.webhookUrl || ""}
                    onChange={(e) => updateCfgField("webhookUrl", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">HMAC Signature Secret (Optional)</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                    placeholder="secret-token-key"
                    value={cfg.secret || ""}
                    onChange={(e) => updateCfgField("secret", e.target.value)}
                  />
                </div>
              </>
            )}

            {type === "APPROVAL_GATE" && (
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="approvalCheck"
                  checked={cfg.requireManualApproval ?? true}
                  onChange={(e) => updateCfgField("requireManualApproval", e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800"
                />
                <label htmlFor="approvalCheck" className="text-slate-300 text-xs">
                  Require manual click approval before continuing DAG
                </label>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Configuration JSON
            </label>
            <textarea
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              value={rawJsonStr}
              onChange={(e) => setRawJsonStr(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="w-20">
            <label className="block text-[10px] text-slate-400">Position</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200"
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            />
          </div>

          <button
            onClick={save}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            + Create Node
          </button>
        </div>
      </div>
    </div>
  );
}
