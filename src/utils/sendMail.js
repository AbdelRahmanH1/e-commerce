import nodemailer from "nodemailer";
export const sendMail = async ({ to, subject, html, attachments }) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let sent;
  if (html) {
    sent = await transport.sendMail({
      from: `E-COMMERCE FINAL <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
  } else {
    sent = await transport.sendMail({
      from: `E-COMMERCE FINAL <${process.env.EMAIL}>`,
      to,
      subject,
      attachments,
    });
  }
  if (sent.accepted.length === 0) return false;
  return true;
};
