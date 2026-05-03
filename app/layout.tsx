import "./globals.css";

export const metadata = {
  title: "STPL",
  description: "Smart Task Planner"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
