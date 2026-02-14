import { define, getChildById, toggleTask } from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { childId, taskId } = body;

      if (!childId || !taskId) {
        return new Response(
          JSON.stringify({ error: "childId and taskId are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const task = toggleTask(childId, taskId);
      if (!task) {
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const child = getChildById(childId);

      return new Response(
        JSON.stringify({
          success: true,
          task,
          points: child?.points ?? 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
