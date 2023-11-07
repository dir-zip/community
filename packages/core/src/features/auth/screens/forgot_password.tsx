import ForgotPasswordForm from "../components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80)",
          }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          {/* {env.NEXT_PUBLIC_APP_NAME} */}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;The greatest SaaS boilerplate!&rdquo;
            </p>
            <footer className="text-sm">Steve Jobs</footer>
          </blockquote>
        </div>
      </div>
      <div className="py-16 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-sm text-muted-foreground">
              {`Don't worry. Enter the email address you used when you joined and we’ll send you instructions to reset your password.`}
            </p>
          </div>
          <ForgotPasswordForm />


        </div>
      </div>
    </div>
  )
}