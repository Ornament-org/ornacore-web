import { MetalThemeProvider } from './context/MetalThemeContext';
import AppHeader from './components/AppHeader/AppHeader';
import MetalSwitcher from './components/MetalSwitcher/MetalSwitcher';
import HomeFooter from './components/HomeFooter/HomeFooter';
import FloatingCartBar from './components/FloatingCartBar/FloatingCartBar';
import BottomNav from './components/BottomNav/BottomNav';
import HomeSections from './HomeSections';

export default function HomePage() {
  return (
    <MetalThemeProvider>
      <AppHeader />
      <MetalSwitcher />
      <main>
        <HomeSections />
      </main>
      <HomeFooter />
      <FloatingCartBar />
      <BottomNav />
    </MetalThemeProvider>
  );
}
