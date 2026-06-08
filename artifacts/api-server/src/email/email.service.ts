import { Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transport: nodemailer.Transporter | null = null;

  private getTransport(): nodemailer.Transporter {
    if (!this.transport) {
      this.transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env["GMAIL"],
          pass: (process.env["GMAIL_APP_PASSWORD"] ?? "").replace(/\s/g, ""),
        },
      });
    }
    return this.transport;
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const t    = this.getTransport();
    const mins = 5;

    await t.sendMail({
      from:    `"Attendance App" <${process.env["GMAIL"]}>`,
      to,
      subject: "Your verification code",
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:480px;margin:0 auto;background:#06051C;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#6D28D9,#4F46E5);padding:32px 40px 24px;">
            <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.04em;">Attendance App</h1>
          </div>
          <div style="padding:32px 40px 40px;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;letter-spacing:-0.03em;">Verification Code</h2>
            <p style="margin:0 0 28px;color:rgba(200,197,245,0.6);font-size:14px;line-height:1.6;">
              Use the code below to complete your sign-in. It expires in ${mins} minutes.
            </p>
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
              <span style="font-size:38px;font-weight:800;letter-spacing:0.18em;color:#A78BFA;">${otp}</span>
            </div>
            <p style="margin:0;color:rgba(200,197,245,0.4);font-size:12px;line-height:1.6;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    this.logger.log(`OTP email sent to ${to}`);
  }
}
