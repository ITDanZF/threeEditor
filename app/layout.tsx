import "./globals.css";

export const metadata = {
  title: "三维编辑器",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/icon?<generated>" type="image/<generated>" sizes="<generated>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
