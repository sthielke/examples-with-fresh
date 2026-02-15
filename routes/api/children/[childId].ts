import { define, getChildById, verifyChildOwnership } from "../../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    if (!ctx.state.session) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const childId = ctx.params.childId;

    if (!childId) {
      return new Response(
        JSON.stringify({ error: "childId is required" }),
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
        JSON.stringify({ error: "Child not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const child = await getChildById(childId);

    if (!child) {
      return new Response(
        JSON.stringify({ error: "Child not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: child.id,
        name: child.name,
        points: child.points,
        avatarIcon: child.avatarIcon || "",
        avatarUrl: child.avatarUrl || "",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
});
