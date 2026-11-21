// frontend/src/pages/Guides.tsx
import React, { useState } from "react";

export default function Guides() {
  const [activeTab, setActiveTab] = useState<"meta" | "youtube" | "ai" | "crons">("meta");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Platform Setup & Integration Guides</h1>
            <p className="text-xs text-slate-400">BYOK: Bring Your Own Keys, Meta Apps, YouTube OAuth & Custom Prompts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/workflows"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition"
          >
            ← Back to Workflows
          </a>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Integration Guides
          </div>
          <button
            onClick={() => setActiveTab("meta")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
              activeTab === "meta"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span className="text-lg">📸</span>
            <div>
              <div className="font-semibold">Instagram & Facebook</div>
              <div className="text-xs text-slate-400">Meta Graph API & Reels</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
              activeTab === "youtube"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span className="text-lg">▶️</span>
            <div>
              <div className="font-semibold">YouTube Data API v3</div>
              <div className="text-xs text-slate-400">OAuth & Shorts Uploads</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
              activeTab === "ai"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span className="text-lg">🧠</span>
            <div>
              <div className="font-semibold">AI Models & Prompts</div>
              <div className="text-xs text-slate-400">Gemini, OpenAI, 4-Beat Storyboard</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("crons")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
              activeTab === "crons"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span className="text-lg">⏰</span>
            <div>
              <div className="font-semibold">Crons & Webhooks</div>
              <div className="text-xs text-slate-400">Schedules & Event Triggers</div>
            </div>
          </button>

          <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">🔐 Privacy & Security:</span>
            Your API keys and OAuth tokens can be configured directly inside your workflow nodes. They are never shared across workflows or tenants.
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur">
          {activeTab === "meta" && (
            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-semibold">
                  Meta Developers & Instagram Graph API
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">How to Configure Instagram Reels & Facebook Posting</h2>
                <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                  Follow this guide to get your <code className="text-pink-400">igUserId</code> and long-lived{" "}
                  <code className="text-pink-400">metaAccessToken</code> to publish vertical videos and carousels directly to your accounts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    Convert Instagram to a Professional / Creator Account
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Open Instagram on your phone → <strong>Settings</strong> → <strong>Account Type & Tools</strong> → Switch to <strong>Professional Account</strong> (Creator or Business). Connect it to a Facebook Page that you own or create.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    Create an App on Meta Developer Portal
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Visit <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-indigo-400 underline">developers.facebook.com</a> → Click <strong>Create App</strong> → Select <strong>Other</strong> → Select <strong>Business</strong>.
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Add the <strong>Instagram Graph API</strong> product to your new application.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    Generate User & Page Access Tokens
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Open the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Graph API Explorer</a>. Select your App and request the following permissions:
                  </p>
                  <div className="my-3 flex flex-wrap gap-2">
                    {["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement", "pages_manage_posts"].map((perm) => (
                      <span key={perm} className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-indigo-300 border border-slate-700">
                        {perm}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300">
                    Click <strong>Generate Access Token</strong>, then exchange it for a 60-day long-lived token via the Access Token Debugger.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                    Find your Instagram Business Account ID (igUserId)
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Run this query in Graph API Explorer to find your linked Instagram Business ID:
                  </p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 flex justify-between items-center mt-2 border border-slate-800">
                    <span>GET /v19.0/me/accounts?fields=name,id,instagram_business_account</span>
                    <button
                      onClick={() => copyToClipboard("me/accounts?fields=name,id,instagram_business_account", "metaQuery")}
                      className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 text-xs"
                    >
                      {copiedKey === "metaQuery" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Copy the numeric <code className="text-pink-400">instagram_business_account.id</code> (e.g. <code>17841400000000000</code>).
                  </p>
                </div>

                <div className="border border-indigo-900/50 rounded-xl p-4 bg-indigo-950/20">
                  <h3 className="font-semibold text-indigo-300">Where to Configure in Distributed-Workflow:</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Open your workflow → Click on the <strong>SOCIAL_PUBLISH</strong> node → Enter:
                  </p>
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-200 mt-2 border border-slate-800">
{`{
  "igUserId": "17841400000000000",
  "metaAccessToken": "EAAB...",
  "targetFeed": "REELS"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "youtube" && (
            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                  Google Cloud Console & YouTube Data API v3
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">How to Configure Automated YouTube Shorts Publishing</h2>
                <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                  Upload vertical videos directly as YouTube Shorts to your YouTube channel using Google Cloud OAuth credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    Create a Project in Google Cloud Console
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">console.cloud.google.com</a> → Create a new project (e.g. <code>Workflow Automation</code>).
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    Enable the YouTube Data API v3
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Navigate to <strong>APIs & Services</strong> → <strong>Library</strong> → Search for <strong>YouTube Data API v3</strong> → Click <strong>Enable</strong>.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    Configure OAuth Consent Screen & Scopes
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Go to <strong>OAuth Consent Screen</strong> → Select <strong>External</strong> → Enter your app name and email.
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Add the following scope:
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-amber-300 mt-2 border border-slate-800">
                    https://www.googleapis.com/auth/youtube.upload
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                    Create OAuth Client ID & Refresh Token
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Under <strong>Credentials</strong> → <strong>Create Credentials</strong> → Select <strong>OAuth client ID</strong> (Application type: <em>Web application</em> or <em>Desktop app</em>).
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Generate your long-lived refresh token using <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google OAuth Playground</a> with your Client ID and Client Secret.
                  </p>
                </div>

                <div className="border border-indigo-900/50 rounded-xl p-4 bg-indigo-950/20">
                  <h3 className="font-semibold text-indigo-300">Where to Configure in Distributed-Workflow:</h3>
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-200 mt-2 border border-slate-800">
{`{
  "youtubeApiKey": "AIzaSy...",
  "youtubeAccessToken": "ya29.a0A...",
  "privacyStatus": "public"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
                  Custom AI Prompts & Video Storyboards
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">Configuring Viral Reel Studio & Carousel Prompts</h2>
                <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                  Bring your own Gemini API Key or OpenAI API Key and customize prompt templates, pacing, and 4-beat retention formulas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    Get Your Google Gemini API Key
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 underline">aistudio.google.com</a> → Click <strong>Create API Key</strong>. Gemini 1.5 Flash provides fast script generation and visual prompt outputs.
                  </p>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    The 4-Beat Viral Storyboard Formula
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    The <code className="text-purple-400">REEL_RENDER</code> node implements the Viral Reel Studio four-beat blueprint:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2 mt-3 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <li><strong className="text-indigo-400">Beat 1 (0:00 - 0:03): HOOK</strong> — High-contrast pattern interrupt & visual motion.</li>
                    <li><strong className="text-indigo-400">Beat 2 (0:03 - 0:10): REALITY CHECK</strong> — Highlight the hidden pitfall or architecture flaw.</li>
                    <li><strong className="text-indigo-400">Beat 3 (0:10 - 0:24): THE BREAKTHROUGH</strong> — Decoupled scalable design with step-by-step visual animation.</li>
                    <li><strong className="text-indigo-400">Beat 4 (0:24 - 0:30): OUTRO CTA</strong> — Bookmark prompt and creator branding.</li>
                  </ul>
                </div>

                <div className="border border-indigo-900/50 rounded-xl p-4 bg-indigo-950/20">
                  <h3 className="font-semibold text-indigo-300">Custom Node Configuration:</h3>
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-200 mt-2 border border-slate-800">
{`{
  "geminiApiKey": "AIzaSy...",
  "template": "4-beat",
  "aspectRatio": "9:16",
  "voiceoverTone": "authoritative",
  "customPrompt": "Create a viral video explaining why cache stampedes crash Redis under 100k QPS."
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "crons" && (
            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  Recurring Crons & Webhook Integrations
                </span>
                <h2 className="text-2xl font-bold mt-2 text-white">Automated Schedules & Event-Driven Triggers</h2>
                <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                  Trigger workflows automatically using standard Cron syntax or incoming HTTP webhooks from external tools (Make, Zapier, n8n, GitHub).
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white">Cron Schedule Cheatsheet</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2">Expression</th>
                          <th className="py-2">Frequency</th>
                          <th className="py-2">Use Case</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr>
                          <td className="py-2 text-amber-400">0 9 * * *</td>
                          <td>Every day at 9:00 AM UTC</td>
                          <td>Daily Morning Social Reel</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-amber-400">0 14 * * 1-5</td>
                          <td>Mon-Fri at 2:00 PM UTC</td>
                          <td>Weekday Tech Carousel</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-amber-400">0 */6 * * *</td>
                          <td>Every 6 hours</td>
                          <td>Trending News Automation</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <h3 className="font-semibold text-white">Human-in-the-Loop Review Safety</h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Even when running on an autonomous cron, including an <code className="text-indigo-400">APPROVAL_GATE</code> node pauses the workflow run in <code className="text-amber-400">WAITING_APPROVAL</code> status.
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    You can inspect the generated storyboard, video preview, or carousel slides in the <strong>Pending Approvals</strong> tab and make on-the-fly caption edits before clicking <strong>Approve & Dispatch</strong>!
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
