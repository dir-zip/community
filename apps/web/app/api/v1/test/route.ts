import { NextResponse } from "next/server";
import {createApiEndpoint} from "../../../../lib/1up";

const GET = createApiEndpoint(async () => {
  return NextResponse.json({hello: "world"})
})

export { GET }

