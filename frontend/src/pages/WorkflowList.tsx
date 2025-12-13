import { useEffect, useState } from "react";
import { WorkflowAPI } from "../api/workflow";

export default function WorkflowList() {
    const [workflows, setWorkflows] = useState<any[]>([]);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            window.location.href = "/";
        }
    }, []);

    useEffect(() => {
        WorkflowAPI.list().then(res => setWorkflows(res.data));
    }, []);

    const create = async () => {
        const res = await WorkflowAPI.create({
            name: "New Workflow",
            description: "Draft workflow",
        });

        const workflowId = res.data.workflow.id;

        window.location.href = `/workflow/${workflowId}`;
    };


    return (
        <div className="p-6">

            <button onClick={create}
                className="bg-green-600 text-white px-4 py-2 rounded mb-4">
                + Create Workflow
            </button>
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                }}
                className="bg-red-500 text-white px-4 py-2 rounded mb-4 ml-2 float-right"
            >
                Logout
            </button>
            {workflows.map(w => (
                <div key={w.id}
                    className="border p-3 mb-2 cursor-pointer"
                    onClick={() => window.location.href = `/workflow/${w.id}`}>
                    {w.name}
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("Delete workflow?")) return;
                            await WorkflowAPI.delete(w.id);
                            setWorkflows(workflows.filter(x => x.id !== w.id));
                        }}
                        className="text-red-600 ml-4"
                    >
                        Delete
                    </button>

                </div>
            ))}
        </div>
    );
}
