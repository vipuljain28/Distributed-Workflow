// frontend/src/pages/Approvals.tsx
import React, { useEffect, useState } from "react";
import { WorkflowAPI } from "../api/workflow";

export default function Approvals() {
  const [pendingRuns, setPendingRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [captionEdit, setCaptionEdit] = useState("");
  const [titleEdit, setTitleEdit] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await WorkflowAPI.listPendingApprovals();
      const list = res.data?.runs || [];
      setPendingRuns(list);
      if (list.length > 0 && !selectedRun) {
        selectRun(list[0]);
      }
    } catch (e: any) {
      console.error("Failed to fetch approvals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const selectRun = (run: any) => {
    setSelectedRun(run);
    const mediaOutput = run.output?.media || run.output || {};
    setTitleEdit(mediaOutput.title || mediaOutput.concept || run.workflow?.name || "Content Reel");
    setCaptionEdit(mediaOutput.narration || mediaOutput.caption || "Check out this breakdown!");
  };

  const handleApprove = async () => {
    if (!selectedRun) return;
    setActionLoading(true);
    try {
      await WorkflowAPI.approveRun(selectedRun.id, {
        editedCaption: captionEdit,
        editedTitle: titleEdit,
      });
      alert("Workflow Run Approved! Dispatching downstream nodes...");
      setSelectedRun(null);
      fetchApprovals();
    } catch (err: any) {
      alert("Approval error: " + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRun) return;
    const reason = prompt("Enter rejection reason:", "Content needs revision");
    if (!reason) return;

    setActionLoading(true);
    try {
      await WorkflowAPI.rejectRun(selectedRun.id, reason);
      alert("Workflow Run rejected.");
      setSelectedRun(null);
      fetchApprovals();
    } catch (err: any) {
      alert("Rejection error: " + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Human-in-the-Loop Approval Queue</h1>
            <p className="text-xs text-slate-400">Review, edit, and approve content before publishing to social channels</p>
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

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Left: Pending Runs List */}
        <div className="w-full md:w-80 shrink-0 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Items ({pendingRuns.length})
            </h2>
            <button
              onClick={fetchApprovals}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
              Loading pending runs...
            </div>
          ) : pendingRuns.length === 0 ? (
            <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/40">
              <span className="text-2xl block mb-2">✨</span>
              <p className="text-sm font-semibold text-slate-300">Queue is Clear</p>
              <p className="text-xs text-slate-500 mt-1">No workflows are currently awaiting manual approval.</p>
            </div>
          ) : (
            pendingRuns.map((r) => {
              const isSelected = selectedRun?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => selectRun(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white truncate">
                      {r.workflow?.name || "Workflow Run"}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PAUSED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Run ID: {r.id.slice(0, 12)}...</div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Inspection & Action Pane */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col">
          {selectedRun ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Reviewing Workflow Execution</h3>
                  <p className="text-xs text-slate-400">Workflow: {selectedRun.workflow?.name} (ID: {selectedRun.id})</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve & Publish"}
                  </button>
                </div>
              </div>

              {/* Title & Caption Edit */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Post Caption / Copy (Editable)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    value={captionEdit}
                    onChange={(e) => setCaptionEdit(e.target.value)}
                  />
                </div>
              </div>

              {/* Media Preview Section */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/60">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Generated Output Preview
                </h4>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 font-mono text-xs overflow-x-auto max-h-60 text-slate-300">
                  <pre>{JSON.stringify(selectedRun.output, null, 2)}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-base font-medium text-slate-400">Select an item from the left queue to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
