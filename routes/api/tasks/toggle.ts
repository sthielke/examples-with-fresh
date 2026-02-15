import {
  define,
  getChildById,
  toggleTask,
  verifyChildOwnership,
} from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      if (!ctx.state.session) {
        return new Response(
          JSON.stringify({ error: "Not authenticated" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const body = await ctx.req.json();
      const { childId, taskId } = body;

      if (!childId || !taskId) {
        return new Response(
          JSON.stringify({ error: "childId and taskId are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Verify the authenticated user owns this child
      const owns = await verifyChildOwnership(
        ctx.state.session.userId,
        childId,
      );
      if (!owns) {
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const task = await toggleTask(childId, taskId);
      if (!task) {
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const child = await getChildById(childId);

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
