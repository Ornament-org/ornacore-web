import { MetalThemeProvider } from './context/MetalThemeContext';
import AppHeader from './components/AppHeader/AppHeader';
import MetalSwitcher from './components/MetalSwitcher/MetalSwitcher';
import HeroCarousel from './components/HeroCarousel/HeroCarousel';
import CollectionsRow from './components/CollectionsRow/CollectionsRow';
import CategoryScroller from './components/CategoryScroller/CategoryScroller';
import FeaturedProducts from './components/FeaturedProducts/FeaturedProducts';
import WhyPartner from './components/WhyPartner/WhyPartner';
import LiveRateCard from './components/LiveRateCard/LiveRateCard';
import HomeFooter from './components/HomeFooter/HomeFooter';
import FloatingCartBar from './components/FloatingCartBar/FloatingCartBar';
import BottomNav from './components/BottomNav/BottomNav';

// One-to-one with the CMS's SECTION_TYPES (ornacore-admin/src/features/cms/data/sectionTypes.js)
// — every manageable section in the toolbox renders through exactly one of
// these components, so what admins see in Homepage Management is what's live.
const SECTION_COMPONENTS = {
  BANNERS: HeroCarousel,
  COLLECTIONS: CollectionsRow,
  QUICK_CATEGORIES: CategoryScroller,
  TRENDING_PRODUCTS: FeaturedProducts,
  TRUST_SECTION: WhyPartner,
  RATE_BANNER: LiveRateCard,
};

// Used only if the homepage resolve call fails outright (network/API down) —
// matches the CMS's own default section order so the page still looks right.
const FALLBACK_SECTIONS = [
  { sectionType: 'BANNERS' },
  { sectionType: 'COLLECTIONS' },
  { sectionType: 'QUICK_CATEGORIES' },
  { sectionType: 'TRENDING_PRODUCTS' },
  { sectionType: 'TRUST_SECTION' },
  { sectionType: 'RATE_BANNER' },
];

async function getHomeSections() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const response = await fetch(`${apiBaseUrl}/homepage?audience=B2B`, { cache: 'no-store' });
    if (!response.ok) return FALLBACK_SECTIONS;

    const body = await response.json();
    const sections = body?.data?.sections;
    return Array.isArray(sections) ? sections : FALLBACK_SECTIONS;
  } catch {
    return FALLBACK_SECTIONS;
  }
}

export default async function HomePage() {
  const sections = await getHomeSections();

  return (
    <MetalThemeProvider>
      <AppHeader />
      <MetalSwitcher />
      <main>
        {sections.map((section) => {
          const SectionComponent = SECTION_COMPONENTS[section.sectionType];
          if (!SectionComponent) return null;
          return (
            <SectionComponent
              key={section.sectionKey ?? section.sectionType}
              title={section.title || undefined}
              subtitle={section.subtitle || undefined}
              config={section.config || {}}
            />
          );
        })}
      </main>
      <HomeFooter />
      <FloatingCartBar />
      <BottomNav />
    </MetalThemeProvider>
  );
}
