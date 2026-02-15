import { define, getUserById } from "../../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    if (!ctx.state.session) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const user = await getUserById(ctx.state.session.userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const children = user.children.map((c) => ({
      id: c.id,
      name: c.name,
      points: c.points,
      avatarIcon: c.avatarIcon || "",
      avatarUrl: c.avatarUrl || "",
    }));

    return new Response(
      JSON.stringify({ children }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
});
