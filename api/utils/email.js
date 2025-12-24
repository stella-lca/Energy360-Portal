// api/utils/email.js
const sgMail = require("@sendgrid/mail");
const { email_body, user_email_body } = require("./body");

require("dotenv").config();

const {
  APPSETTING_HOST,
  APPSETTING_ADMIN_EMAIL,
  APPSETTING_NOREPLY_EMAIL,
  APPSETTING_SENDGRID_API_KEY
} = process.env;

// --- Validate required env vars (do NOT hardcode keys in code) ---
if (!APPSETTING_SENDGRID_API_KEY) {
  console.warn("⚠️ Missing APPSETTING_SENDGRID_API_KEY in environment.");
} else {
  sgMail.setApiKey(APPSETTING_SENDGRID_API_KEY);
}

// Admin emails can be comma-separated
const adminEmails = (APPSETTING_ADMIN_EMAIL || "")
  .replace(/\s/g, "")
  .split(",")
  .filter(Boolean);

// Fallback "from" address
const noReplyEmail = APPSETTING_NOREPLY_EMAIL || "no-reply@cutone.org";

// --- Helpers ---
function generateResetEmailHtml(token) {
  const base = (APPSETTING_HOST || "").replace(/\/$/, "");
  const resetPasswordURL = `${base}/reset-password?token=${encodeURIComponent(token)}`;

  return `
    <div style="max-width:560px;margin:0 auto;padding:24px;font-family:Arial,sans-serif">
      <div style="text-align:center;margin-bottom:20px">
        <img src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
             alt="GreenConnect"
             style="max-width:180px;height:auto" />
      </div>

      <h2 style="color:#1b7f3a;margin:0 0 16px">Reset your password</h2>

      <p style="margin:0 0 16px;line-height:1.5">
        You requested a password reset. Click the link below to set a new password:
      </p>

      <p style="margin:0 0 20px">
        <a href="${resetPasswordURL}" style="color:#0b5ed7;text-decoration:underline">
          Reset Password
        </a>
      </p>

      <p style="margin:0;line-height:1.5">
        If you did not request this, you can ignore this email.
      </p>

      <p style="margin-top:24px">
        Very truly yours,<br/>
        GreenConnect Entrepreneur Portal
      </p>
    </div>
  `;
}

async function sendViaSendgrid(msg) {
  if (!APPSETTING_SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured (APPSETTING_SENDGRID_API_KEY).");
  }
  return sgMail.send(msg);
}

// --- Exports used by controllers ---
exports.sendEmail = async ({ email, token, res }) => {
  try {
    const html = generateResetEmailHtml(token);

    const msg = {
      to: email,
      from: noReplyEmail,
      subject: "GreenConnect - reset your password!",
      html
    };

    await sendViaSendgrid(msg);

    // IMPORTANT: your frontend expects data.message (see auth.js)
    return res.status(200).send({ message: "Reset email sent. Please check your inbox." });
  } catch (err) {
    console.error("sendEmail error:", err?.response?.body || err);
    return res.status(500).send({ message: "Failed to send reset email." });
  }
};

exports.sendAdminEmail = async ({ content, subject, callback }) => {
  try {
    const html = email_body(content);

    const msg = {
      to: adminEmails.length ? adminEmails : undefined,
      from: noReplyEmail,
      subject: subject || "Greenconnect - Notification",
      html
    };

    if (!msg.to) {
      const e = new Error("APPSETTING_ADMIN_EMAIL not configured.");
      if (callback) callback(e.message);
      return e;
    }

    const result = await sendViaSendgrid(msg);
    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendAdminEmail error:", err?.response?.body || err);
    if (callback) callback(err?.response?.body || err.message || false);
    return err;
  }
};

exports.sendUserEmail = async ({ content, subject, callback }) => {
  try {
    const html = user_email_body(content);

    const msg = {
      to: adminEmails.length ? adminEmails : undefined,
      from: noReplyEmail,
      subject: subject || "Greenconnect - User Message",
      html
    };

    if (!msg.to) {
      const e = new Error("APPSETTING_ADMIN_EMAIL not configured.");
      if (callback) callback(e.message);
      return e;
    }

    const result = await sendViaSendgrid(msg);
    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendUserEmail error:", err?.response?.body || err);
    if (callback) callback(err?.response?.body || err.message || false);
    return err;
  }
};

exports.sendNotifyEmail = async ({ to, subject, content, callback }) => {
  try {
    const msg = {
      to: to || (adminEmails.length ? adminEmails : undefined),
      from: noReplyEmail,
      subject: subject || "Greenconnect - Notification",
      html: content
    };

    if (!msg.to) {
      const e = new Error("No recipient configured (to or APPSETTING_ADMIN_EMAIL).");
      if (callback) callback(e.message);
      return e;
    }

    const result = await sendViaSendgrid(msg);
    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendNotifyEmail error:", err?.response?.body || err);
    if (callback) callback(err?.response?.body || err.message || false);
    return err;
  }
};

// Optional: keep an error email helper if other code calls it
exports.errorEmail = async (data) => {
  try {
    const msg = {
      to: adminEmails.length ? adminEmails : undefined,
      from: noReplyEmail,
      subject: "Greenconnect - Error",
      html: `<pre style="white-space:pre-wrap">${String(data)}</pre>`
    };

    if (!msg.to) return false;
    await sendViaSendgrid(msg);
    return true;
  } catch (err) {
    console.error("errorEmail error:", err?.response?.body || err);
    return false;
  }
};
