import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react'

export interface IActivateAccountTemplate {
  email: string
  url: string
}


const ActivateAccount = ({
  email,
  url
}: IActivateAccountTemplate) => {
  const previewText = `Activate your account on ${process.env.NEXT_PUBLIC_APP_NAME}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Activate your account
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {email},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Please activate your account to continue using all the features.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                pX={20}
                pY={12}
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
                href={url}
              >
                Activate
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link
                href={url}
                className="text-blue-600 no-underline"
              >
                {url}
              </Link>
            </Text>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ActivateAccount;