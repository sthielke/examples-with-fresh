import { define, removeChild } from "../../../utils.ts";

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
      const { childId } = body;

      if (!childId) {
        return new Response(
          JSON.stringify({ error: "childId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const success = removeChild(ctx.state.session.userId, childId);

      if (!success) {
        return new Response(
          JSON.stringify({ error: "Child not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
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
