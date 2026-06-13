import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env["GMAIL"],
      pass: process.env["GMAIL_APP_PASSWORD"],
    },
  });

  async sendOtp(to: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Staff Attendance" <${process.env["GMAIL"]}>`,
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
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("535") || msg.includes("Username and Password") || msg.includes("BadCredentials")) {
        throw new HttpException(
          "Email sending failed: Gmail credentials are invalid. Please update the GMAIL_APP_PASSWORD secret.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("ENOTFOUND")) {
        throw new HttpException(
          "Email sending failed: Could not reach Gmail servers. Check network/firewall settings.",
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
