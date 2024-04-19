import nodemailer from 'nodemailer'

export const createMailer = ({to, data, template}: {to: string, data: Partial<{[key: string]: string}>, template: string}) => {
  
  const msg = {
    from: process.env.APP_EMAIL || "admin@dir.zip",
    to,
    subject: data.subject,
    html: template
  }

  return {
    async send() {
      if(!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) throw new Error("SMTP credentials not set")

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        },
        headers: {
          'X-PM-Message-Stream': 'outbound'
        }
      })

      await transporter.sendMail(msg)
    }
  }
}