// api/utils/email.js  (Brevo SMTP via Nodemailer)
const nodemailer = require("nodemailer");
require("dotenv").config();

const { email_body, user_email_body } = require("./body");

const {
  APPSETTING_HOST,
  APPSETTING_ADMIN_EMAIL,
  APPSETTING_NOREPLY_EMAIL,
  BREVO_SMTP_USER,
  BREVO_SMTP_KEY,
  BREVO_SMTP_HOST,
  BREVO_SMTP_PORT,
  EMAIL_FROM_NAME,
  EMAIL_DEV_MODE
} = process.env;

const smtpHost = BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const smtpPort = Number(BREVO_SMTP_PORT || 587);
const fromEmail = APPSETTING_NOREPLY_EMAIL || "no-reply@greenconnect.nyc";
const fromName = EMAIL_FROM_NAME || "GreenConnect Entrepreneur Portal";
const devMode = String(EMAIL_DEV_MODE || "").toLowerCase() === "true";

const adminEmails = (APPSETTING_ADMIN_EMAIL || "")
  .replace(/\s/g, "")
  .split(",")
  .filter(Boolean);

function requireEnv(value, name) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
}

function buildResetUrl(token) {
  const base = (APPSETTING_HOST || "").replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

function resetEmailHtml(token) {
  const resetPasswordURL = buildResetUrl(token);
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

// create transporter lazily (no await at top-level)
let transporter;
function getTransporter() {
  if (devMode) return null;

  requireEnv(BREVO_SMTP_USER, "BREVO_SMTP_USER");
  requireEnv(BREVO_SMTP_KEY, "BREVO_SMTP_KEY");

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // STARTTLS on 587
      auth: { user: BREVO_SMTP_USER, pass: BREVO_SMTP_KEY }
    });
  }
  return transporter;
}

// ✅ await lives ONLY inside this async function
async function sendMail({ to, subject, html, text, replyTo }) {
  if (devMode) {
    console.log("📧 EMAIL_DEV_MODE=true — not sending email.");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Reset/HTML preview:", html?.slice?.(0, 200));
    return { devMode: true };
  }

  const tx = getTransporter();
  return await tx.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    text,
    replyTo
  });
}

// ---- Exported functions used by your app ----

exports.sendEmail = async ({ email, token, res }) => {
  try {
    requireEnv(APPSETTING_HOST, "APPSETTING_HOST");
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!token) return res.status(400).send({ message: "Token is required." });

    const html = resetEmailHtml(token);

    await sendMail({
      to: email,
      subject: "GreenConnect - reset your password!",
      html
    });

    return res.status(200).send({ message: "Reset email sent. Please check your inbox." });
  } catch (err) {
    console.error("sendEmail error:", err);
    return res.status(500).send({ message: err?.message || "Email failed." });
  }
};

exports.sendAdminEmail = async ({ content, subject, callback }) => {
  try {
    if (!adminEmails.length) {
      const msg = "APPSETTING_ADMIN_EMAIL not configured.";
      if (callback) callback(msg);
      return { ok: false, message: msg };
    }

    const html = email_body(content);
    const result = await sendMail({
      to: adminEmails,
      subject: subject || "GreenConnect - Notification",
      html
    });

    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendAdminEmail error:", err);
    if (callback) callback(err?.message || false);
    return err;
  }
};

exports.sendUserEmail = async ({ content, subject, callback }) => {
  try {
    if (!adminEmails.length) {
      const msg = "APPSETTING_ADMIN_EMAIL not configured.";
      if (callback) callback(msg);
      return { ok: false, message: msg };
    }

    const html = user_email_body(content);
    const result = await sendMail({
      to: adminEmails,
      subject: subject || "GreenConnect - User Message",
      html
    });

    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendUserEmail error:", err);
    if (callback) callback(err?.message || false);
    return err;
  }
};

exports.sendNotifyEmail = async ({ to, subject, content, callback }) => {
  try {
    const recipients = to || (adminEmails.length ? adminEmails : null);
    if (!recipients) {
      const msg = "No recipient configured (to or APPSETTING_ADMIN_EMAIL).";
      if (callback) callback(msg);
      return { ok: false, message: msg };
    }

    const result = await sendMail({
      to: recipients,
      subject: subject || "GreenConnect - Notification",
      html: content
    });

    if (callback) callback(true);
    return result;
  } catch (err) {
    console.error("sendNotifyEmail error:", err);
    if (callback) callback(err?.message || false);
    return err;
  }
};

exports.errorEmail = async (data) => {
  try {
    if (!adminEmails.length) return false;

    await sendMail({
      to: adminEmails,
      subject: "GreenConnect - Error",
      html: `<pre style="white-space:pre-wrap;font-family:monospace">${String(data)}</pre>`
    });

    return true;
  } catch (err) {
    console.error("errorEmail error:", err);
    return false;
  }
};
