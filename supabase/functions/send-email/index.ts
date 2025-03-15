import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const SMTP_HOST = Deno.env.get("SMTP_HOST");
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT"));
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    const { to, subject, text } = await req.json();

    if (!to || !subject || !text) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Configure SMTP
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // Use SSL for 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    let info = await transporter.sendMail({
      from: `"Your App" <${SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return new Response(JSON.stringify({ message: "Email sent!" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Email send error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});