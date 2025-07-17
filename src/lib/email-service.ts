interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<void> {
  // For now, we'll just log the email data
  // In production, you would integrate with a service like SendGrid, Resend, or Nodemailer
  
  console.log('Email would be sent:', {
    to: data.to,
    subject: data.subject,
    html: data.html,
  })

  // If you want to use a real email service, uncomment and configure one of these:

  // Option 1: Using Resend (recommended for Next.js)
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'noreply@yourdomain.com',
  //   to: data.to,
  //   subject: data.subject,
  //   html: data.html,
  // })

  // Option 2: Using SendGrid
  // import sgMail from '@sendgrid/mail'
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  // await sgMail.send({
  //   to: data.to,
  //   from: 'noreply@yourdomain.com',
  //   subject: data.subject,
  //   html: data.html,
  // })

  // Option 3: Using Nodemailer with Gmail
  // import nodemailer from 'nodemailer'
  // const transporter = nodemailer.createTransporter({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.GMAIL_USER,
  //     pass: process.env.GMAIL_APP_PASSWORD,
  //   },
  // })
  // await transporter.sendMail({
  //   from: process.env.GMAIL_USER,
  //   to: data.to,
  //   subject: data.subject,
  //   html: data.html,
  // })
} 