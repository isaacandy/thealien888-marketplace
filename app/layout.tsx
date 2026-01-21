import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Script from 'next/script';
import './layout.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TheAlien.888 Marketplace',
  description:
    'A dark, cyberpunk NFT marketplace interface for TheAlien.888 collection on Ethereum.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Alien 888',
    url: 'https://thealien888.com',
    description: 'The Alien 888 is a collection of 888 unique aliens on the Ethereum blockchain.',
    publisher: {
      '@type': 'Organization',
      name: 'The Alien 888',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thealien888.com/logo.png',
      },
    },
  };
  return (
    <html lang="en" className="bg-black text-emerald-100">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Clarity tracking code for https://web3.thealien888.iznd.xyz/ */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v4o4yvt0m9");
          `}
        </Script>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-gradient-to-b from-black via-[#020617] to-black antialiased layout-body`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
