import { useState } from "react";
import { api } from "../api/client";

export default function ConditionForm({
    workflowId,
    onCreated,
}: {
    workflowId: string;
    onCreated: () => void;
}) {
    const [name, setName] = useState("");
    const [expression, setExpression] = useState("output.status == 200");

    const save = async () => {
        await api.post(`/workflow/${workflowId}/conditions`, {
            name,
            type: "EXPRESSION",
            params: { expression },
        });
        setName("");
        onCreated();
    };

    return (
        <div className="border p-4 mb-4 bg-white rounded">
            <h3 className="font-bold mb-2">Add Condition</h3>

            <input
                className="border p-2 w-full mb-2"
                placeholder="Condition name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <textarea
                className="border p-2 w-full mb-2"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
            />

            <button
                onClick={save}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
                Create Condition
            </button>
        </div>
    );
}
