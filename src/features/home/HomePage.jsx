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
import { API_BASE_URL, HOSTED_API_BASE_URL, USES_LOCAL_API } from '@/constants/api';

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

const normalizeConfig = (config) => {
  if (!config) return {};
  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch {
      return {};
    }
  }
  return config;
};

const normalizeSection = (section, index) => {
  const sectionType = section.sectionType ?? section.section_type;
  if (!sectionType) return null;

  return {
    sectionType,
    sectionKey: section.sectionKey ?? section.section_key ?? sectionType,
    title: section.title ?? null,
    subtitle: section.subtitle ?? null,
    config: normalizeConfig(section.config ?? section.configJson ?? section.config_json),
    sortOrder: section.sortOrder ?? section.sort_order ?? index,
  };
};

async function getHomeSections() {
  const apiCandidates = [
    API_BASE_URL,
    ...(process.env.NODE_ENV === 'production' && USES_LOCAL_API ? [HOSTED_API_BASE_URL] : []),
  ];

  for (const apiBaseUrl of apiCandidates) {
    try {
      const response = await fetch(`${apiBaseUrl}/homepage?audience=B2B`, { cache: 'no-store' });
      if (!response.ok) continue;

      const body = await response.json();
      const sections = body?.data?.sections;
      if (Array.isArray(sections)) {
        return sections
          .map((section, index) => normalizeSection(section, index))
          .filter(Boolean)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      }
    } catch {
      // Try the next configured API origin before falling back to the default shell.
    }
  }

  return FALLBACK_SECTIONS;
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
