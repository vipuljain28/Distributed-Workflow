import { useEffect, useState } from "react";
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
        const res = await WorkflowAPI.get(id!);
        setWorkflow(res.data);
    };

    useEffect(() => { load(); }, []);

    if (!workflow) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-bold">Initializing workflow…</h2>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-3 gap-4">
            <div>
                <NodeForm workflowId={id} onCreated={load} />
                <ConditionForm workflowId={id!} onCreated={load} />

                <EdgeForm
                    workflowId={id}
                    nodes={workflow.nodes || []}
                    conditions={workflow.conditions || []}
                    onCreated={load}
                />
            </div>

            <div className="col-span-2">
                <h2 className="font-bold mb-2">Nodes</h2>
                {workflow.nodes.map((n: any) => (
                    <div key={n.id} className="border p-2 mb-1">
                        {n.name}
                        <button
                            className="text-red-600 ml-2"
                            onClick={async () => {
                                await WorkflowAPI.deleteNode(id!, n.id);
                                load();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))}


                <h2 className="font-bold mt-4 mb-2">Edges</h2>

                {workflow.edges.map((e: any) => (
                    <div key={e.id} className="border p-2 mb-1">
                        {e.name}
                        <button
                            className="text-red-600 ml-2"
                            onClick={async () => {
                                await WorkflowAPI.deleteEdge(id!, e.fromNodeId, e.id);
                                load();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))}


                <RunWorkflow workflowId={id} />
            </div>
        </div>
    );
}
