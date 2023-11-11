import { PasswordHandler } from '@dir/auth';
import { type NextRequest, type NextResponse } from 'next/server';
import { prisma } from '@dir/db';

type ApiHandler = (request: NextRequest) => Promise<NextResponse>

const createApiEndpoint = (handler: ApiHandler) => {

  return async (request: NextRequest) => {
    const token = request.headers.get('authorization')?.split(" ")[1];
    if(!token) {
      throw new Error("Token not found")
    }

    const findApiKey = await prisma.token.findFirst({
      where: {
        hashedToken: await PasswordHandler.hash(token),
        AND: {
          type: "API_KEY",
        },
      }
    });

    if (!findApiKey) {
      return new Response("Invalid Token", { status: 401 })
    }


    try {
      const result = await handler(request);
      // do something with result
      return result
    } catch (error) {
      // handle error
      throw error;
    }
  }
}



export default createApiEndpoint;