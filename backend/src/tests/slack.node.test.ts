import { SlackNode } from "../execution/nodes/slack.node";
import axios from "axios";

describe("SlackNode", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("sends message via webhook", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    const node = new SlackNode({
      webhookUrl: "https://hooks.test/slack",
      message: "hello"
    });

    const result = await node.execute({});

    expect(result.success).toBe(true);
    expect(axios.post).toHaveBeenCalled();
  });

  it("sends message via bot token", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { ok: true } });

    const node = new SlackNode({
      channel: "#demo",
      message: "test-msg",
      botToken: "xoxb-123"
    });

    const res = await node.execute({});
    expect(res.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      "https://slack.com/api/chat.postMessage",
      expect.anything(),
      expect.objectContaining({
        headers: expect.anything()
      })
    );
  });
});
