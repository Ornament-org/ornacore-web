import '@/styles/globals.scss';
import ReduxProvider from '@/redux/ReduxProvider';
import TopBar from '@/components/layout/TopBar/TopBar';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

export const metadata = {
  title: 'OrnaCo — Timeless Elegance in Jewellery',
  description: 'Discover exquisite gold, diamond and silver jewellery. 100% BIS hallmarked. Pan India delivery. B2B business platform for jewellery partners.',
  keywords: 'jewellery, gold jewellery, diamond jewellery, silver jewellery, hallmarked jewellery',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <TopBar />
          <Header />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
