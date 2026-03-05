import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER_SMTP_USER,
    pass: process.env.EMAIL_SENDER_SMTP_PASS,
  },
  port: Number(process.env.EMAIL_SENDER_SMTP_PORT!),
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER_SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email send to: ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log("Email send error:", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
