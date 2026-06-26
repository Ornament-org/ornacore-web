import HeroBanner from './components/HeroBanner/HeroBanner';
import CategorySection from './components/CategorySection/CategorySection';
import BestSellers from './components/BestSellers/BestSellers';
import PromoSection from './components/PromoSection/PromoSection';
import TrustBadges from './components/TrustBadges/TrustBadges';
import B2BSection from './components/B2BSection/B2BSection';

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <CategorySection />
      <BestSellers />
      <PromoSection />
      <TrustBadges />
      <B2BSection />
    </main>
  );
}
