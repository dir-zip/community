"use client"

import { Form, TextField } from "../../../../../components/Forms"
import { type Session } from "@1upsaas/db"


const SessionForm = ({session}: {session: Session}) => {
  return (
    <Form 
    initialValues={{
      ...session
    }} 
    onSubmit={async (values) => {
      console.log(values)
    }}
  >
    <TextField name="id" label="Id" disabled />
    <TextField name="createdAt" label="Created At" disabled />
    <TextField name="expiresAt" label="Expires At" disabled />
    <TextField name="userId" label="User Id" disabled />
  </Form>
  )
}

export default SessionForm