import ResetPasswordForm from "../components/ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center flex lg:max-w-none lg:px-0">
      <div className="mx-auto flex flex-col justify-center space-y-6 w-full sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below to update your account.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}