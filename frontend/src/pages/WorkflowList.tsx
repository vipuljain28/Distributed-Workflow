// frontend/src/pages/WorkflowList.tsx
import React, { useEffect, useState } from "react";
import { WorkflowAPI } from "../api/workflow";

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"workflows" | "templates">("workflows");
  const [loading, setLoading] = useState(true);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wfRes, tmplRes] = await Promise.all([
        WorkflowAPI.list(),
        WorkflowAPI.listTemplates().catch(() => ({ data: { templates: [] } })),
      ]);
      setWorkflows(wfRes.data || []);
      setTemplates(tmplRes.data?.templates || []);
    } catch (e) {
      console.error("Failed to load workflows or templates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createBlank = async () => {
    try {
      const res = await WorkflowAPI.create({
        name: "Custom Workflow",
        description: "Custom user DAG workflow",
      });
      const workflowId = res.data.workflow.id;
      window.location.href = `/workflow/${workflowId}`;
    } catch (e: any) {
      alert("Error creating workflow: " + (e.response?.data?.error || e.message));
    }
  };

  const useTemplate = async (templateId: string) => {
    setCreatingTemplateId(templateId);
    try {
      const res = await WorkflowAPI.instantiateTemplate(templateId);
      const newWf = res.data?.workflow;
      if (newWf?.id) {
        window.location.href = `/workflow/${newWf.id}`;
      } else {
        loadData();
        setActiveTab("workflows");
      }
    } catch (e: any) {
      alert("Error instantiating template: " + (e.response?.data?.error || e.message));
    } finally {
      setCreatingTemplateId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 text-white">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Distributed Workflow Engine</h1>
            <p className="text-xs text-slate-400">BYOK Orchestration, AI Video Pipelines & Multi-Channel Dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/guides"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>📖</span> Configuration Guides
          </a>
          <a
            href="/approvals"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>🛡️</span> Approval Queue
          </a>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "workflows"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              My Workflows ({workflows.length})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "templates"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span>✨</span> Pre-Built Templates ({templates.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={createBlank}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <span>+</span> Blank Custom Flow
            </button>
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Pre-Built Automation Blueprints</h2>
              <p className="text-sm text-slate-400">
                Clone a battle-tested workflow pipeline in one click. Fully customizable with your own AI prompts and app credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {t.category}
                      </span>
                      {t.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{t.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {t.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/80 text-slate-400 border border-slate-750"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {t.nodes?.length || 0} Nodes • {t.edges?.length || 0} Edges
                    </span>
                    <button
                      onClick={() => useTemplate(t.id)}
                      disabled={creatingTemplateId === t.id}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                    >
                      {creatingTemplateId === t.id ? "Instantiating..." : "Use Template →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Workflows Tab */}
        {activeTab === "workflows" && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/30">
                Loading workflows...
              </div>
            ) : workflows.length === 0 ? (
              <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/30 space-y-4">
                <span className="text-4xl block">🚀</span>
                <div>
                  <h3 className="text-base font-semibold text-white">No Workflows Created Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Start by cloning one of our pre-built automation templates or create a blank workflow from scratch.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("templates")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Browse Templates
                  </button>
                  <button
                    onClick={createBlank}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    + Blank Flow
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => (window.location.href = `/workflow/${w.id}`)}
                    className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/70 transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          DAG Flow
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm(`Delete workflow "${w.name}"?`)) return;
                            await WorkflowAPI.delete(w.id);
                            loadData();
                          }}
                          className="text-slate-500 hover:text-red-400 text-xs p-1 transition"
                        >
                          ✕
                        </button>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
                        {w.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {w.description || "Configured workflow with custom nodes"}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                      <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition">
                        Open Studio →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
