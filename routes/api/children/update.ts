import { define, updateChild } from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      if (!ctx.state.session) {
        return new Response(
          JSON.stringify({ error: "Not authenticated" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const contentType = ctx.req.headers.get("content-type") || "";

      let childId: string;
      let name: string;
      let avatarIcon: string | undefined;
      let avatarUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await ctx.req.formData();
        childId = formData.get("childId") as string;
        name = formData.get("name") as string;
        avatarIcon = (formData.get("avatarIcon") as string) || undefined;

        const file = formData.get("avatarFile") as File | null;
        if (file && file.size > 0) {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(buffer)),
          );
          const mimeType = file.type || "image/png";
          avatarUrl = `data:${mimeType};base64,${base64}`;
        }
      } else {
        const body = await ctx.req.json();
        childId = body.childId;
        name = body.name;
        avatarIcon = body.avatarIcon;
        avatarUrl = body.avatarUrl;
      }

      if (!childId || !name?.trim()) {
        return new Response(
          JSON.stringify({ error: "childId and name are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const child = updateChild(childId, name.trim(), avatarIcon, avatarUrl);

      if (!child) {
        return new Response(
          JSON.stringify({ error: "Child not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, child }),
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
