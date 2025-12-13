import { useState } from "react";
import { WorkflowAPI } from "../api/workflow";

type Props = {
    workflowId?: string;
    onCreated: () => void;
};
const DEFAULT_CONFIG: Record<string, any> = {
    START: {},
    END: {},
    ACTION: {},
    HTTP: {
        url: "https://jsonplaceholder.typicode.com/todos/1",
        method: "GET",
        timeoutMs: 5000
    },
    CONDITION: {
        expression: "output.status == 200"
    },
    DELAY: {
        seconds: 5
    },
    SLACK: {
        mode: "webhook",
        webhookUrl: "",
        token: "",
        channel: "#general",
        message: "Hello from workflow",
        blocks: [],
        threadTs: null
    },
    EMAIL: {
        to: "",
        subject: "Workflow Notification",
        text: "Workflow executed"
    },
    SHEETS: {
        mode: "append/Read/Sheety",
        sheetId: "",
        range: "Sheet1!A1",
        row: {},
        fallbackUrl: ""
    }
};

export default function NodeForm({ workflowId, onCreated }: Props) {
    const [name, setName] = useState("");
    const [type, setType] = useState("ACTION");
    const [position, setPosition] = useState(1);
    const [config, setConfig] = useState("{}");

    const save = async () => {
        if (!workflowId) return;

        try {
            const parsedConfig = config ? JSON.parse(config) : {};
            await WorkflowAPI.createNode(workflowId, {
                name,
                type,
                position,
                config: parsedConfig,
            });
            setName("");
            setConfig("{}");
            onCreated();
        } catch (e) {
            alert("Invalid JSON or API error");
        }
    };

    return (
        <div className="border p-4 mb-4 bg-white rounded">
            <h3 className="font-bold mb-2">Add Node</h3>

            <input
                className="border p-2 w-full mb-2"
                placeholder="Node name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <select
                className="border p-2 w-full mb-2"
                value={type}
                onChange={(e) => {
                    const t = e.target.value;
                    setType(t);
                    setConfig(JSON.stringify(DEFAULT_CONFIG[t], null, 2));
                }}

            >
                {[
                    "START",
                    "ACTION",
                    "HTTP",
                    "CONDITION",
                    "DELAY",
                    "SLACK",
                    "SHEETS",
                    "EMAIL",
                    "END",
                ].map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                ))}
            </select>

            <input
                className="border p-2 w-full mb-2"
                type="number"
                placeholder="Position"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
            />

            <textarea
                className="border p-2 w-full h-24 mb-2"
                placeholder="Config JSON"
                value={config}
                onChange={(e) => setConfig(e.target.value)}
            />

            <button
                onClick={save}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Create Node
            </button>
        </div>
    );
}
