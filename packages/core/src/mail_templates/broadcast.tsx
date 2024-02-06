import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Tailwind,
} from '@react-email/components';
import * as React from 'react'

export interface IBroadcastTemplate {
  html: string,
  email: string
}


const BroadcastTemplate = ({
  html,
  email
}: IBroadcastTemplate) => {


  return (
    <Html>
      <Head />
      <Preview>Broadcast</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
    
            <div dangerouslySetInnerHTML={{ __html: html }} />
  
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${email}`}>Unsubscribe</Link>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BroadcastTemplate;