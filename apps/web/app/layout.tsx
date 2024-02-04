export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <link type="image/png" sizes="16x16" rel="icon" href="/icons8-favicon-3d-fluency-16.png"/>
      <link type="image/png" sizes="32x32" rel="icon" href="/icons8-favicon-3d-fluency-32.png"/>
      <link type="image/png" sizes="96x96" rel="icon" href="/icons8-favicon-3d-fluency-96.png"/>
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
