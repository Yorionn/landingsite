import './globalstyle.css';

export const metadata = {
  title: 'Site Nikolai',
  description: 'Landing page',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

