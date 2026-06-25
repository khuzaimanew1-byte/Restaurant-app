import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Purp } from "../core/dto.js";

@Injectable()
export class MailSvc {
  private readonly log = new Logger(MailSvc.name);
  private smtp: Transporter | null = null;

  private get tx(): Transporter {
    if (!this.smtp) {
      const user = process.env["SENDING_GMAIL"] ?? process.env["GMAIL"];
      const pass = (process.env["GMAIL_APP_PASSWORD"] ?? "").replace(/[\s\u00a0]/g, "");

      if (!user) {
        throw new HttpException(
          "Email service not configured.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (!pass) {
        throw new HttpException(
          "Email service not configured.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      this.smtp = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        auth: { type: "LOGIN", user, pass },
      });
    }
    return this.smtp;
  }

  async sendOtp(to: string, otp: string, purp: Purp): Promise<void> {
    const from = process.env["SENDING_GMAIL"] ?? process.env["GMAIL"];
    const reset = purp === "reset";
    const subject = reset
      ? "MyRestaurant - your password reset code"
      : "MyRestaurant - your login code";
    const title = reset ? "Password reset code" : "Admin login code";

    try {
      await this.tx.sendMail({
        from: `"MyRestaurant" <${from}>`,
        to,
        subject,
        headers: {
          "X-Mailer": "MyRestaurant-Auth/1.0",
          "X-Priority": "1",
          Importance: "high",
        },
        text: [
          `MyRestaurant - ${title}`,
          "",
          `Your one-time code is: ${otp}`,
          "",
          "This code is valid for 10 minutes. Do not share it with anyone.",
          "",
          "If you did not request this code, you can safely ignore this email.",
        ].join("\n"),
        html: [
          "<main>",
          "<h1>MyRestaurant</h1>",
          `<p>${title}</p>`,
          `<p><strong>${otp}</strong></p>`,
          "<p>Valid for 10 minutes. Do not share this code.</p>",
          "<p>If you did not request this, you can safely ignore this email.</p>",
          "</main>",
        ].join(""),
      });
    } catch (err: unknown) {
      this.smtp = null;
      this.log.error("SMTP send failed");
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("535") || msg.includes("BadCredentials")) {
        throw new HttpException(
          "Email sending failed: credentials rejected.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (msg.includes("Missing credentials")) {
        throw new HttpException(
          "Email service misconfigured.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("ENOTFOUND")) {
        throw new HttpException(
          "Email sending failed: provider unavailable.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException("Email sending failed.", HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

