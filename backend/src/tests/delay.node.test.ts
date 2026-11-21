import { DelayNode } from "../execution/nodes/delay.node";

jest.useFakeTimers();

test("Delay waits specified milliseconds", async () => {
  const node = new DelayNode({ ms: 1000 });

  const promise = node.execute({});
  jest.advanceTimersByTime(1000);

  const result = await promise;
  expect(result.success).toBe(true);
});
