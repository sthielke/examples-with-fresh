import { addChildToUser, define } from "../../../utils.ts";

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

      let name: string;
      let avatarIcon: string | undefined;
      let avatarUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        // Handle file upload case
        const formData = await ctx.req.formData();
        name = formData.get("name") as string;
        avatarIcon = (formData.get("avatarIcon") as string) || undefined;

        const file = formData.get("avatarFile") as File | null;
        if (file && file.size > 0) {
          // Validate file size (max 2MB)
          const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
          if (file.size > MAX_AVATAR_SIZE) {
            return new Response(
              JSON.stringify({ error: "Avatar image must be under 2MB" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          // Validate MIME type (images only)
          const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
          if (!ALLOWED_TYPES.includes(file.type)) {
            return new Response(
              JSON.stringify({ error: "Avatar must be a PNG, JPEG, GIF, or WebP image" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(buffer)),
          );
          avatarUrl = `data:${file.type};base64,${base64}`;
        }
      } else {
        // JSON body
        const body = await ctx.req.json();
        name = body.name;
        avatarIcon = body.avatarIcon || undefined;
        avatarUrl = body.avatarUrl || undefined;
      }

      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Child name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const child = await addChildToUser(
        ctx.state.session.userId,
        name.trim(),
        avatarIcon,
        avatarUrl,
      );

      if (!child) {
        return new Response(
          JSON.stringify({ error: "Could not add child. User not found." }),
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
