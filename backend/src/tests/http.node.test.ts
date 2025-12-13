import axios from "axios";
import { HttpNode } from "../execution/nodes/http.node";

describe("HTTP Node", () => {
  beforeEach(() => jest.resetAllMocks());

  it("performs GET request", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { ok: true } });

    const node = new HttpNode({
      method: "GET",
      url: "https://api.test"
    });

    const res = await node.execute({});
    expect(res.success).toBe(true);
  });
});
