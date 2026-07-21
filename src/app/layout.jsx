import '@/styles/globals.scss';
import ReduxProvider from '@/redux/ReduxProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import SiteChrome from '@/components/layout/SiteChrome/SiteChrome';

const DEFAULT_BRANDING = {
  displayName: 'OrnaCore',
  favicon: null,
};

const getBrandingMetadata = async () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const response = await fetch(`${apiBaseUrl}/store-settings/branding`, { cache: 'no-store' });

    if (!response.ok) return DEFAULT_BRANDING;

    const data = await response.json();

    return {
      displayName: data?.displayName?.trim() || DEFAULT_BRANDING.displayName,
      favicon: data?.favicon || null,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
};

export async function generateMetadata() {
  const branding = await getBrandingMetadata();

  return {
    title: `${branding.displayName} — B2B Jewellery Marketplace`,
    description: 'India\'s trusted B2B jewellery marketplace. Wholesale pricing, 100% hallmarked purity, pan India delivery for jewellery shops and wholesalers.',
    keywords: 'b2b jewellery, wholesale jewellery, gold jewellery, diamond jewellery, silver jewellery, hallmarked jewellery',
    ...(branding.favicon
      ? {
          icons: {
            icon: branding.favicon,
            shortcut: branding.favicon,
            apple: branding.favicon,
          },
        }
      : {}),
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0a09',
};

// Runs before React hydrates so a returning visitor who chose dark mode never
// sees a light-mode flash — the CSS itself already defaults to light (no
// attribute) whenever this finds nothing stored, so first-ever visits need no
// script at all.
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('ornacore-theme');
    if (stored === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly,
          etc.) inject attributes like `cz-shortcut-listen` onto <body> before
          React hydrates, which otherwise trips a hydration mismatch. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <ReduxProvider>
            <SiteChrome>{children}</SiteChrome>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
