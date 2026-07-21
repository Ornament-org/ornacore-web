'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import TopBar from '@/components/layout/TopBar/TopBar';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import AppHeader from '@/features/home/components/AppHeader/AppHeader';
import BottomNav from '@/features/home/components/BottomNav/BottomNav';
import { MetalThemeProvider } from '@/features/home/context/MetalThemeContext';
import { fetchCurrentUser } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';
import { fetchBranding } from '@/redux/slices/brandingSlice';

const SELF_MANAGED_APP_ROUTES = [ROUTES.HOME, ROUTES.CATEGORIES, ROUTES.PRODUCTS];
const APP_SHELL_PREFIXES = [
  ROUTES.CART,
  ROUTES.WISHLIST,
  ROUTES.CHECKOUT,
  ROUTES.ORDERS,
  ROUTES.PROFILE,
  ROUTES.PRODUCTS,
];
// Orders lives under Account now (My Orders, from the profile menu) — it
// keeps the same headerless chrome as the rest of Account instead of the
// generic storefront AppHeader, so moving between them feels like one section.
const HEADERLESS_APP_ROUTES = [ROUTES.PROFILE, ROUTES.ORDERS];
// The `/business` subtree (login, register, approval, dashboard, ...) fully
// owns its own chrome AND its own auth guard (app/business/layout.jsx) — it
// skips both the gate and the chrome-wrapping logic below entirely. This is
// the storefront's only entry point now — the legacy B2C `/login`/`/register`
// pages have been removed.
const RAW_PASSTHROUGH_PREFIX = '/business';

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, actorType, user } = useSelector((state) => state.auth);
  const displayName = useSelector((state) => state.branding.displayName);
  const favicon = useSelector((state) => state.branding.favicon);
  const brandingStatus = useSelector((state) => state.branding.status);
  const [checkedSession, setCheckedSession] = useState(false);

  const isRawPassthrough = pathname === RAW_PASSTHROUGH_PREFIX || pathname.startsWith(`${RAW_PASSTHROUGH_PREFIX}/`);
  const isGateExempt = isRawPassthrough;
  const isApproved = user?.shopkeeper?.status === 'APPROVED';

  const usesSelfManagedAppShell = SELF_MANAGED_APP_ROUTES.includes(pathname);
  const usesStorefrontAppShell = APP_SHELL_PREFIXES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (brandingStatus === 'idle') dispatch(fetchBranding());
  }, [dispatch, brandingStatus]);

  useEffect(() => {
    document.title = `${displayName} — B2B Jewellery Marketplace`;
  }, [displayName]);

  useEffect(() => {
    if (!favicon) return;

    let faviconLink = document.querySelector('link[rel="icon"]');

    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }

    faviconLink.setAttribute('href', favicon);
  }, [favicon]);

  // Whole storefront is B2B-only: browsing the catalog, categories, cart —
  // all of it — requires a registered, approved shopkeeper session. This
  // mirrors app/business/layout.jsx's guard exactly (same token check, same
  // fetchCurrentUser rehydration), just applied to the public-facing routes
  // instead of the /business dashboard ones.
  useEffect(() => {
    if (isGateExempt) return;

    const checkSession = async () => {
      if (isAuthenticated) {
        setCheckedSession(true);
        return;
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setCheckedSession(true);
        return;
      }
      await dispatch(fetchCurrentUser());
      setCheckedSession(true);
    };

    void checkSession();
    // Only ever attempt this once per mount per route — later auth changes
    // come from explicit login/logout actions, not from re-running this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGateExempt]);

  useEffect(() => {
    if (isGateExempt || !checkedSession) return;

    if (!isAuthenticated || actorType !== 'b2b') {
      router.replace(ROUTES.BUSINESS.LOGIN);
      return;
    }
    if (!isApproved) {
      router.replace(ROUTES.BUSINESS.APPROVAL);
    }
  }, [isGateExempt, checkedSession, isAuthenticated, actorType, isApproved, router]);

  if (isRawPassthrough) return <>{children}</>;

  // Still resolving the session, or a redirect above is about to fire —
  // render nothing rather than flashing the storefront/dashboard first.
  if (!isGateExempt && (!checkedSession || !isAuthenticated || actorType !== 'b2b' || !isApproved)) return null;

  if (usesSelfManagedAppShell) return <>{children}</>;

  if (usesStorefrontAppShell) {
    const showAppHeader = !HEADERLESS_APP_ROUTES.some((route) =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    return (
      <MetalThemeProvider>
        {showAppHeader ? <AppHeader /> : null}
        {children}
        <BottomNav />
      </MetalThemeProvider>
    );
  }

  return (
    <>
      <TopBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}
