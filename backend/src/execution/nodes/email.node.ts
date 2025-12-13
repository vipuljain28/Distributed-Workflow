// src/execution/nodes/email.node.ts
import nodemailer from "nodemailer";
import { NodeExecutionResult } from "../types";

export class EmailNode {
  private config: any;
  constructor(config: any) { this.config = config ?? {}; }

  async execute(input: any): Promise<NodeExecutionResult> {
    const smtp = this.config.smtp ?? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    };
    const tls={
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

    if (!smtp) return { success: false, errorMessage: "Email node missing SMTP config" };

    const transporter = nodemailer.createTransport(tls);

    const mail = {
      from: this.config.from ?? smtp.auth?.user,
      to: this.config.to,
      subject: this.config.subject ?? "Workflow Notification",
      text: this.config.text ?? JSON.stringify(input),
      html: this.config.html,
    };

    if (!mail.to) return { success: false, errorMessage: "Email node requires 'to' address" };

    try {
      await transporter.sendMail(mail);
      return { success: true, output: { email_sent: true } };
    } catch (err: any) {
      return { success: false, errorMessage: String(err?.message ?? err) };
    }
  }
}
