import { useEffect, useState } from "react";
import { WorkflowAPI } from "../api/workflow";

type Props = {
    workflowId?: string;
};

export default function RunWorkflow({ workflowId }: Props) {
    const [input, setInput] = useState("{ }");
    const [runId, setRunId] = useState("");
    const [status, setStatus] = useState<any>(null);

    const run = async () => {
        if (!workflowId) return;

        const parsed = input ? JSON.parse(input) : {};
        const res = await WorkflowAPI.run(workflowId, parsed);
        setRunId(res.data.id);
    };

    useEffect(() => {
        if (!runId) return;

        const interval = setInterval(async () => {
            const res = await WorkflowAPI.runStatus(runId);
            setStatus(res.data);
        }, 2000);

        return () => clearInterval(interval);
    }, [runId]);

    return (
        <div className="border p-4 bg-white rounded">
            <h3 className="font-bold mb-2">Run Workflow</h3>

            <textarea
                className="border p-2 w-full h-24 mb-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button
                onClick={run}
                className="bg-purple-600 text-white px-4 py-2 rounded"
            >
                Run
            </button>

            {runId && (
                <div className="mt-2 text-sm">
                    <div>Run ID: {runId}</div>
                    <div>Status: {status?.status}</div>
                </div>
            )}
        </div>
    );
}
