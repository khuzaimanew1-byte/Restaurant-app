import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private _transporter: Transporter | null = null;

  private get transporter(): Transporter {
    if (!this._transporter) {
      const user = process.env["SENDING_GMAIL"] ?? process.env["GMAIL"];
      const rawPass = process.env["GMAIL_APP_PASSWORD"] ?? "";
      // Strip all whitespace & non-breaking spaces — Gmail App Passwords are
      // 16-char codes; spaces are cosmetic and must be removed before auth.
      const pass = rawPass.replace(/[\s\u00a0]/g, "");

      if (!user) {
        throw new HttpException(
          "Email service not configured: SENDING_GMAIL env var is missing.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (!pass) {
        throw new HttpException(
          "Email service not configured: GMAIL_APP_PASSWORD secret is missing.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      this.logger.log(`Creating SMTP transporter for ${user} (pass length: ${pass.length})`);

      this._transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { type: "LOGIN", user, pass },
      });
    }
    return this._transporter;
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const from = process.env["SENDING_GMAIL"] ?? process.env["GMAIL"];
    try {
      await this.transporter.sendMail({
        from: `"Staff Attendance" <${from}>`,
        to,
        subject: "Your verification code",
        html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#20242b;border-radius:12px;">
          <h2 style="color:#e8c98a;margin:0 0 8px">Staff Attendance</h2>
          <p style="color:#9aa3b0;margin:0 0 24px;font-size:14px">Admin verification code</p>
          <div style="background:#2b3038;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#f0f2f5;">${otp}</span>
          </div>
          <p style="color:#9aa3b0;font-size:13px;margin:0;">Valid for <strong style="color:#e8c98a;">8 minutes</strong>. Do not share this code.</p>
        </div>
      `,
      });
    } catch (err: unknown) {
      // Reset transporter so next call rebuilds it with fresh env vars
      this._transporter = null;
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`sendMail failed: ${msg}`);

      if (msg.includes("535") || msg.includes("BadCredentials") || msg.includes("Username and Password")) {
        throw new HttpException(
          "Email sending failed: Gmail App Password is incorrect or expired.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (msg.includes("Missing credentials")) {
        throw new HttpException(
          "Email service misconfigured: GMAIL or GMAIL_APP_PASSWORD env var is missing.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("ENOTFOUND")) {
        throw new HttpException(
          "Email sending failed: Cannot reach Gmail servers.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        `Email sending failed: ${msg}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
