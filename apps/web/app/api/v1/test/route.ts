import { NextResponse } from "next/server";
import { createApiEndpoint } from "../../../../lib/router";

const GET = createApiEndpoint(async () => {
  return NextResponse.json({ hello: "world" })
})

export { GET }

