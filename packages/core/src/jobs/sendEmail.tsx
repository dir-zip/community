import { createJob } from '../lib/jobs'
import { createMailer } from '@dir/mailer'
import ActivateAccount from "../mail_templates/activate-account"
import { renderAsync } from "@react-email/render"
import * as React from 'react'
import ForgotPassword from '../mail_templates/forgot-password'
import BroadcastTemplate from '~/mail_templates/broadcast'


export type SendEmailData = {
  email: string
  subject?: string
  template?: string
  url?: string
  html?: string
  type?: 'FORGOT_PASSWORD' | 'ACTIVATE_ACCOUNT' | 'BROADCAST'
}


const job = createJob<SendEmailData>("sendEmail", async (job) => {
  let email: {template: string, subject: string} = {template: '', subject:''}

  switch(job.data.type) {
    case "ACTIVATE_ACCOUNT": 
      email = {
        subject: "Activate Your Account",
        template: await renderAsync(<ActivateAccount email={job.data.email} url={job.data.url || ""} />)
      }
      break
    case "FORGOT_PASSWORD":
      email = {
        subject: "Reset Your Password",
        template: await renderAsync(<ForgotPassword email={job.data.email} url={job.data.url || ""} />)
      }
      break
    case "BROADCAST":
      email = {
        subject: job.data.subject || "",
        template: await renderAsync(<BroadcastTemplate html={job.data.html || ""} email={job.data.email || ""} />)
      }
      break
    default:
      email = {
        subject: job.data.subject || "",
        template: job.data.template || ""
      }    
      break
  }

  return await createMailer({
    to: job.data.email,
    data: { subject: email.subject},
    template: email.template,
  }).send()

})

export default job