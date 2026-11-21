// frontend/src/pages/WorkflowBuilder.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkflowAPI } from "../api/workflow";
import NodeForm from "./NodeForm";
import EdgeForm from "./EdgeForm";
import RunWorkflow from "./RunWorkflow";
import ConditionForm from "./ConditionForm";

export default function WorkflowBuilder() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  const load = async () => {
    try {
      const res = await WorkflowAPI.get(id!);
      setWorkflow(res.data);
    } catch (e: any) {
      console.error("Error loading workflow:", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-400">Loading workflow canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <a href="/workflows" className="text-slate-400 hover:text-white text-sm transition">
            ← Workflows
          </a>
          <span className="text-slate-600">/</span>
          <div>
            <h1 className="font-bold text-base text-white flex items-center gap-2">
              {workflow.name}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                DAG ID: {workflow.id.slice(0, 8)}
              </span>
            </h1>
            <p className="text-xs text-slate-400">{workflow.description || "Interactive Visual DAG Studio"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/guides"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-semibold transition"
          >
            📖 Configuration Guides
          </a>
          <a
            href="/approvals"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold transition"
          >
            🛡️ Approval Queue
          </a>
        </div>
      </header>

      {/* Main Studio Canvas */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Tools */}
        <div className="space-y-4">
          <NodeForm workflowId={id} onCreated={load} />
          <ConditionForm workflowId={id!} onCreated={load} />
          <EdgeForm
            workflowId={id}
            nodes={workflow.nodes || []}
            conditions={workflow.conditions || []}
            onCreated={load}
          />
        </div>

        {/* Right Columns: Canvas Nodes, Graph & Runner */}
        <div className="lg:col-span-2 space-y-6">
          {/* Execution Runner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>▶️</span> Execute Workflow DAG
            </h2>
            <RunWorkflow workflowId={id} />
          </div>

          {/* Nodes Section */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📦</span> Workflow Nodes ({workflow.nodes?.length || 0})
              </h2>
              <span className="text-xs text-slate-500">Order by DAG topology</span>
            </div>

            {(!workflow.nodes || workflow.nodes.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No nodes added yet. Use the tool on the left to add your first node.</p>
            ) : (
              <div className="space-y-2">
                {workflow.nodes.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                        {n.position || 1}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-white">{n.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {n.type}
                          </span>
                          {n.config && Object.keys(n.config).length > 0 && (
                            <span className="text-[10px] text-slate-500">
                              Configured ({Object.keys(n.config).length} keys)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      onClick={async () => {
                        if (!confirm(`Delete node "${n.name}"?`)) return;
                        await WorkflowAPI.deleteNode(id!, n.id);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edges Section */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span>🔗</span> Directed Edges ({workflow.edges?.length || 0})
            </h2>

            {(!workflow.edges || workflow.edges.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No edges connected. Connect from-node to to-node to define the DAG flow.</p>
            ) : (
              <div className="space-y-2">
                {workflow.edges.map((e: any) => {
                  const fromNode = workflow.nodes?.find((n: any) => n.id === e.fromNodeId);
                  const toNode = workflow.nodes?.find((n: any) => n.id === e.toNodeId);
                  return (
                    <div
                      key={e.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-indigo-400 font-semibold">{fromNode?.name || e.fromNodeId.slice(0, 8)}</span>
                        <span className="text-slate-500">───▶</span>
                        <span className="text-emerald-400 font-semibold">{toNode?.name || e.toNodeId.slice(0, 8)}</span>
                        {e.condition && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px]">
                            {e.condition.name}
                          </span>
                        )}
                      </div>

                      <button
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition"
                        onClick={async () => {
                          await WorkflowAPI.deleteEdge(id!, e.fromNodeId, e.id);
                          load();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
