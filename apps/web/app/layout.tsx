import "@/styles/global.css";


export const metadata = {
  title: "1upsaas",
  description: "Login to get started.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
      <meta name="theme-color" content="rgb(231, 229, 228)" />
      </head>
      <body>
        <>
          {children}
        </>
      </body>
    </html>
  );
}
