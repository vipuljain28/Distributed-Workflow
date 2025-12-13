import { api } from "./client";

export const WorkflowAPI = {
    list: () => api.get("/workflow"),
    create: (data: any) => api.post("/workflow", data),
    get: (id: string) => api.get(`/workflow/${id}`),
    delete: (id: string) => api.delete(`/workflow/${id}`),

    createNode: (workflowId: string, data: any) =>
        api.post(`/workflow/${workflowId}/nodes`, data),
    deleteNode: (workflowId: string, nodeId: string) =>
        api.delete(`/workflow/${workflowId}/nodes/${nodeId}`),

    createEdge: (workflowId: string, fromNodeId: string, data: any) =>
        api.post(`/workflow/${workflowId}/nodes/${fromNodeId}/edges`, data),
    deleteEdge: (workflowId: string, fromNodeId: string, edgeId: string) =>
        api.delete(`/workflow/${workflowId}/nodes/${fromNodeId}/edges/${edgeId}`),

    run: (id: string, input: any) =>
        api.post(`/workflow/${id}/run`, input),

    runStatus: (id: string) =>
        api.get(`/workflowRun/${id}`),


};