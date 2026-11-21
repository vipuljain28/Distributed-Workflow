import { useState } from "react";
import { WorkflowAPI } from "../api/workflow";

type Props = {
    workflowId?: string;
    nodes: any[];
    conditions: any[];
    onCreated: () => void;
};

export default function EdgeForm({
    workflowId,
    nodes,
    conditions,
    onCreated,
}: Props) {
    const [fromNodeId, setFrom] = useState("");
    const [toNodeId, setTo] = useState("");
    const [conditionId, setConditionId] = useState("");

    const save = async () => {
        if (!workflowId || !fromNodeId || !toNodeId) return;

        await WorkflowAPI.createEdge(
            workflowId,
            fromNodeId,
            {
                toNodeId,
                conditionId: conditionId || undefined,
            }
        );

        setFrom("");
        setTo("");
        setConditionId("");
        onCreated();
    };

    return (
        <div className="border p-4 mb-4 bg-white rounded">
            <h3 className="font-bold mb-2">Add Edge</h3>

            <select
                className="border p-2 w-full mb-2"
                value={fromNodeId}
                onChange={(e) => setFrom(e.target.value)}
            >
                <option value="">From Node</option>
                {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                        {n.name}
                    </option>
                ))}
            </select>

            <select
                className="border p-2 w-full mb-2"
                value={toNodeId}
                onChange={(e) => setTo(e.target.value)}
            >
                <option value="">To Node</option>
                {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                        {n.name}
                    </option>
                ))}
            </select>

            <select
                className="border p-2 w-full mb-2"
                value={conditionId}
                onChange={(e) => setConditionId(e.target.value)}
            >
                <option value="">No Condition (Always)</option>
                {conditions.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            <button
                onClick={save}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Create Edge
            </button>
        </div>
    );
}
