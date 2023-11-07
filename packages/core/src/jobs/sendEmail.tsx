import { createJob } from '../lib/jobs'
import {createMailer} from '@1upsaas/mailer'
import ActivateAccount from "../mail_templates/activate-account"
import {render} from "@react-email/render"
import * as React from 'react'
import ForgotPassword from '../mail_templates/forgot-password'


export type SendEmailData = {
  email: string
  subject?: string
  template?: string
  url?: string
  type?: 'FORGOT_PASSWORD' | 'ACTIVATE_ACCOUNT'
}


const job = createJob<SendEmailData>("sendEmail", async (job) => {
  let email: {template: string, subject: string} = {template: '', subject:''}

  switch(job.data.type) {
    case "ACTIVATE_ACCOUNT": 
      email = {
        subject: "Activate Your Account",
        template: render(<ActivateAccount email={job.data.email} url={job.data.url || ""} />)
      }
      break
    case "FORGOT_PASSWORD":
      email = {
        subject: "Reset Your Password",
        template: render(<ForgotPassword email={job.data.email} url={job.data.url || ""} />)
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