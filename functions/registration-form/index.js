import nodemailer from "nodemailer";
import { Client, Databases, ID } from "node-appwrite";

const logoUrl = process.env.LOGO_URL || "https://mongilodge.com/src/logo.png";

function toBoolFromYesNo(value) {
    const v = String(value || "").trim().toLowerCase();
    if (v === "yes" || v === "true" || v === "1") return true;
    if (v === "no" || v === "false" || v === "0") return false;
    return null; // unknown / not provided
}

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default async ({ req, res, log, error }) => {
    try {
        log("Registration function started");

        // ---- Parse request body ----
        let data;
        try {
            data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

            // If body is wrapped (front-end sends { body: "..." })
            if (data.body && typeof data.body === "string") {
                data = JSON.parse(data.body);
            }

            log("Data parsed: " + JSON.stringify(data));
        } catch (e) {
            error("Failed to parse body: " + e.message);
            return res.json({ success: false, message: "Invalid request data" }, 400);
        }

        // ---- Honeypot check ----
        if (data._gotcha || data._honeypot) {
            log("Spam detected (honeypot)");
            return res.json({ success: false, message: "Spam detected" }, 400);
        }

        // ---- Normalize payload (match your HTML name="" keys) ----
        // IMPORTANT: termsAccepted checkbox (name="termsAccepted" value="true" or "on")
        // promoOptIn radio can be yes/no
        const firstName = (data.firstName || "").trim();
        const surname = (data.surname || "").trim();
        const email = (data.email || "").trim().toLowerCase();
        const countryCode = (data.countryCode || "").trim();
        const phone = (data.phone || "").trim();
        const idNumber = (data.idNumber || "").trim();
        const heardFrom = (data.heardFrom || "").trim();
        const heardOther = (data.heardOther || "").trim();
        const signature = (data.signature || "").trim();

        const promoOptIn = toBoolFromYesNo(data.promoOptIn);

        // termsAccepted boolean: checkbox usually sends "on" or your provided value
        // We'll treat presence as true; or accept explicit true/false strings too.
        let termsAccepted = false;
        if (typeof data.termsAccepted === "boolean") termsAccepted = data.termsAccepted;
        else if (data.termsAccepted) {
            const tv = String(data.termsAccepted).trim().toLowerCase();
            termsAccepted = tv === "true" || tv === "yes" || tv === "1" || tv === "on";
        }

        const websiteUrl =
            (data._origin || req.headers["origin"] || req.headers["referer"] || "Website").toString();

        // ---- Validate required fields ----
        const missing = [];
        if (!firstName) missing.push("First Name");
        if (!surname) missing.push("Surname");
        if (!email) missing.push("Email");
        if (!idNumber) missing.push("Passport/ID No.");
        if (promoOptIn === null) missing.push("Promotions (Yes/No)");
        if (!heardFrom) missing.push("How did you hear about us");
        if (!termsAccepted) missing.push("Terms and Conditions");
        if (!signature) missing.push("Signature");

        if (missing.length) {
            log("Missing required fields: " + missing.join(", "));
            return res.json(
                { success: false, message: `Missing required fields: ${missing.join(", ")}` },
                400
            );
        }

        // Email format check (Appwrite email type will reject invalid too, but nice to message user)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            log("Invalid email format");
            return res.json({ success: false, message: "Invalid email address" }, 400);
        }

        // heardFrom Other requires heardOther
        if (heardFrom === "Other" && !heardOther) {
            return res.json(
                { success: false, message: "Please specify how you heard about us" },
                400
            );
        }

        // ---- Appwrite client ----
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const db = new Databases(client);

        // ---- Save to DB (types must match collection schema) ----
        const payload = {
            firstName,
            surname,
            email, // email type
            countryCode: countryCode || null,
            phone: phone || null,
            idNumber,
            promoOptIn, // boolean
            heardFrom,
            heardOther: heardFrom === "Other" ? heardOther : null,
            termsAccepted, // boolean
            signature,
            origin: websiteUrl,
        };

        const doc = await db.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_REGISTRATIONS_COLLECTION_ID,
            ID.unique(),
            payload
        );

        log("Saved registration doc: " + doc.$id);

        // ---- Email (after DB save) ----
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const recipients = (process.env.RECIPIENT_EMAIL || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
            .join(",");

        if (!recipients) {
            log("RECIPIENT_EMAIL not set; skipping email");
        } else {
            const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; }
          .header { background-color: #166534; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #374151; }
          .logo { max-width: 80px; height: auto; margin-bottom: 15px; }
          .header h2 { margin: 0; }
          .from-section { background-color: #f3f4f6; padding: 12px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          .from-section strong { color: #1f2937; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .field { margin-bottom: 14px; }
          .label { font-weight: bold; color: #1f2937; }
          .value { margin-top: 6px; }
          .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; background: #e5e7eb; color: #111827; }
          .docid { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Logo" class="logo">
            <h2>New Registration Submission</h2>
          </div>
          <div class="from-section">
            <strong>From:</strong> ${escapeHtml(websiteUrl)}
          </div>

          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${escapeHtml(firstName)} ${escapeHtml(surname)}</div>
            </div>

            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
            </div>

            ${
                phone || countryCode
                    ? `<div class="field">
                     <div class="label">Phone:</div>
                     <div class="value">${escapeHtml(countryCode)} ${escapeHtml(phone)}</div>
                   </div>`
                    : ""
            }

            <div class="field">
              <div class="label">Passport / ID No.:</div>
              <div class="value">${escapeHtml(idNumber)}</div>
            </div>

            <div class="field">
              <div class="label">Promotions:</div>
              <div class="value"><span class="pill">${promoOptIn ? "Yes" : "No"}</span></div>
            </div>

            <div class="field">
              <div class="label">How they heard:</div>
              <div class="value">
                ${escapeHtml(heardFrom)}
                ${heardFrom === "Other" ? ` — ${escapeHtml(heardOther)}` : ""}
              </div>
            </div>

            <div class="field">
              <div class="label">Terms accepted:</div>
              <div class="value"><span class="pill">${termsAccepted ? "Yes" : "No"}</span></div>
            </div>

            <div class="field">
              <div class="label">Signature:</div>
              <div class="value">${escapeHtml(signature)}</div>
            </div>

            <div class="field">
              <div class="label">Submitted:</div>
              <div class="value">${new Date().toLocaleString("en-US", {
                timeZone: "America/Chicago",
                dateStyle: "short",
                timeStyle: "short",
            })}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

            const emailText = `
New Registration Submission
From: ${websiteUrl}

Name: ${firstName} ${surname}
Email: ${email}
${phone || countryCode ? `Phone: ${countryCode} ${phone}\n` : ""}
Passport/ID No.: ${idNumber}
Promotions: ${promoOptIn ? "Yes" : "No"}
How they heard: ${heardFrom}${heardFrom === "Other" ? ` - ${heardOther}` : ""}
Terms accepted: ${termsAccepted ? "Yes" : "No"}
Signature: ${signature}

Submitted: ${new Date().toLocaleString()}
      `.trim();

            await transporter.sendMail({
                from: `"Mongi Registration" <${process.env.GMAIL_USER}>`,
                to: recipients,
                replyTo: email,
                subject: `New Registration: ${firstName} ${surname}`,
                text: emailText,
                html: emailHtml,
            });

            log("Email sent successfully");
        }

        return res.json({ success: true, message: "Registration submitted successfully" }, 200);
    } catch (err) {
        error("Error: " + err.message);
        error("Stack: " + err.stack);
        return res.json({ success: false, message: "Server error: " + err.message }, 500);
    }
};
