// ─── HTML Escaping ───────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Configuration ───────────────────────────────────────────────────────────
// Uses Resend's REST API directly (no npm SDK needed -- works on Deno Deploy)

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ||
  "Pointy <onboarding@resend.dev>";

function getApiKey(): string {
  const key = Deno.env.get("RESEND_API_KEY") || "";
  if (!key) {
    throw new Error(
      "RESEND_API_KEY environment variable is not set. " +
        "Set it to your Resend API key to enable email sending.",
    );
  }
  return key;
}

// ─── Send via Resend REST API ────────────────────────────────────────────────

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const apiKey = getApiKey();

    console.log(`[Email] Sending to: ${to}, subject: "${subject}", from: ${FROM_EMAIL}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Email] Resend API error (${res.status}): ${body}`);
      return false;
    }

    const result = await res.json();
    console.log(`[Email] Sent successfully, id: ${result.id}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

// ─── Shared HTML wrapper ─────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background: #F4F2FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4F2FF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(108, 92, 231, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%); padding: 28px 32px; text-align: center;">
              <span style="font-size: 28px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Pointy</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; text-align: center; border-top: 1px solid #F0EDFF;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                This email was sent by Pointy. If you didn't expect this, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Password Reset Email ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<boolean> {
  const safeUrl = escapeHtml(resetUrl);
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #2D3436;">
      Reset Your Password
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #636E72; line-height: 1.6;">
      We received a request to reset the password for your Pointy account.
      Click the button below to choose a new password. This link expires in 1 hour.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 4px 0 24px;">
          <a href="${safeUrl}"
             style="display: inline-block; background: #6C5CE7; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
      If you didn't request a password reset, no action is needed. Your password will remain unchanged.
    </p>
    <p style="margin: 16px 0 0; font-size: 12px; color: #BBB; word-break: break-all;">
      Or copy this link: ${safeUrl}
    </p>
  `);

  return await sendEmail(to, "Reset your Pointy password", html);
}

// ─── Invite Email ────────────────────────────────────────────────────────────

export async function sendInviteEmail(
  to: string,
  inviteUrl: string,
  inviterName: string,
): Promise<boolean> {
  const safeName = escapeHtml(inviterName);
  const safeUrl = escapeHtml(inviteUrl);
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #2D3436;">
      You're Invited to Pointy!
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #636E72; line-height: 1.6;">
      <strong>${safeName}</strong> has invited you to join their Pointy account
      as an authorized user. You'll be able to add and remove points for their children.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 4px 0 24px;">
          <a href="${safeUrl}"
             style="display: inline-block; background: #6C5CE7; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px;">
            Create Your Account
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
    <p style="margin: 16px 0 0; font-size: 12px; color: #BBB; word-break: break-all;">
      Or copy this link: ${safeUrl}
    </p>
  `);

  return await sendEmail(
    to,
    `${safeName} invited you to Pointy`,
    html,
  );
}
