
import { engine } from "../execution/engine";
import { prismaMock } from "./__mocks__/prismaMock";

jest.mock("../db/client", () => ({
  prisma: require("./__mocks__/prismaMock").prismaMock
}));

describe("Engine", () => {
  it("executes start node and creates next nodeRun", async () => {
    prismaMock.nodeRun.findUnique.mockResolvedValue({
      id: "n1",
      input: {},
      node: { id: "start1", type: "START", config: {} },
      workflowRun: {
        id: "run1",
        workflow: {
          edges: [{ fromNodeId: "start1", toNodeId: "next" }],
          nodes: [],
          conditions: []
        }
      }
    });

    prismaMock.nodeRun.update.mockResolvedValue({});
    prismaMock.nodeRun.create.mockResolvedValue({ id: "n2" });

    await engine.executeNodeRun("n1");

    expect(prismaMock.nodeRun.create).toHaveBeenCalled();
  });
});
