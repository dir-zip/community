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

export interface IForgotPasswordTemplate {
  email: string
  url: string
}


const ForgotPassword = ({
  email,
  url
}: IForgotPasswordTemplate) => {
  const previewText = `Reset your password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Let's help you get back access to your account
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {email},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              It seem's you forgot your password. Not to worry, you can reset it here.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] py-2 px-4 rounded text-white text-[12px] font-semibold no-underline text-center"
                href={url}
              >
                Reset Password
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

export default ForgotPassword;