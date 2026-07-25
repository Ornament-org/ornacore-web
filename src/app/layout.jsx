import '@/styles/globals.scss';
import ReduxProvider from '@/redux/ReduxProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import SiteChrome from '@/components/layout/SiteChrome/SiteChrome';
import { API_BASE_URL } from '@/constants/api';

const DEFAULT_BRANDING = {
  displayName: 'OrnaCore',
  favicon: null,
};

const getBrandingMetadata = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/store-settings/branding`, { next: { revalidate: 300 } });

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

// Runs before React hydrates: dark is the storefront default, but a returning
// visitor who explicitly chose light mode keeps that preference.
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('ornacore-theme');
    if (stored === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
