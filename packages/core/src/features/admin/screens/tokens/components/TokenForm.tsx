"use client"

import { Form, TextField } from "../../../../../components/Forms"
import { type Token } from "@dir/db"

const TokenForm = ({token}: {token: Token}) => {

  return (
  <Form 
    initialValues={{...token}} 
    onSubmit={async (values) => {
      console.log(values)
    }}
  >
    <TextField name="id" label="Id" disabled />

    <TextField name="createdAt" label="Created At" disabled />

    <TextField name="expiresAt" label="Expires At" disabled />

    <TextField name="lastFour" label="Last Four Digits" disabled />

    <TextField name="type" label="Type" disabled />

    <TextField name="sentTo" label="Sent To" disabled />

    <TextField name="userId" label="User Id" disabled />

    <TextField name="workspaceId" label="Workspace Id" disabled />
  </Form>
  )
}

export default TokenForm