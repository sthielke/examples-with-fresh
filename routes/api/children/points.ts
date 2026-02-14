import { adjustPoints, define } from "../../../utils.ts";

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
      const { childId, delta } = body;

      if (!childId || typeof delta !== "number") {
        return new Response(
          JSON.stringify({ error: "childId and delta (number) are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const newPoints = adjustPoints(childId, delta);

      if (newPoints === null) {
        return new Response(
          JSON.stringify({ error: "Child not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, points: newPoints }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
