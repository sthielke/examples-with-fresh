import { define, getChildById } from "../../../utils.ts";

export const handler = define.handlers({
  GET(ctx) {
    const childId = ctx.params.childId;

    if (!childId) {
      return new Response(
        JSON.stringify({ error: "childId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const child = getChildById(childId);

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
