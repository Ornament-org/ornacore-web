'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import B2BLayout from '@/features/b2b/components/B2BLayout/B2BLayout';
import { fetchCurrentUser } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';

// Login/Register/Approval never get the sidebar chrome — they're either
// pre-auth or a holding screen for shopkeepers who aren't approved yet.
const CHROME_FREE_PATHS = [ROUTES.BUSINESS.LOGIN, ROUTES.BUSINESS.REGISTER, ROUTES.BUSINESS.APPROVAL];
// Only these two are reachable without a session at all.
const PUBLIC_PATHS = [ROUTES.BUSINESS.LOGIN, ROUTES.BUSINESS.REGISTER];

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, actorType, user } = useSelector((state) => state.auth);
  const [checkedSession, setCheckedSession] = useState(false);

  // The backend intentionally allows DRAFT/PENDING_REVIEW/REJECTED/SUSPENDED
  // shopkeepers to authenticate (only BLOCKED is rejected at login) — it's
  // this guard's job to hold everyone except APPROVED on the approval screen
  // instead of letting them into the real storefront (home page onward).
  const isApproved = user?.shopkeeper?.status === 'APPROVED';
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
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
    // Only ever attempt this once per mount — later auth changes come from
    // explicit login/logout actions, not from re-running this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!checkedSession) return;

    if (isPublicPath) {
      // Already have a session — don't show the login/register form again
      // (e.g. landing back on it via the browser's back button). Send them
      // wherever they actually belong instead, pending or fully approved.
      if (isAuthenticated && actorType === 'b2b') {
        router.replace(isApproved ? ROUTES.HOME : ROUTES.BUSINESS.APPROVAL);
      }
      return;
    }

    if (!isAuthenticated || actorType !== 'b2b') {
      router.replace(ROUTES.BUSINESS.LOGIN);
      return;
    }
    if (!isApproved && pathname !== ROUTES.BUSINESS.APPROVAL) {
      router.replace(ROUTES.BUSINESS.APPROVAL);
      return;
    }
    if (isApproved && pathname === ROUTES.BUSINESS.APPROVAL) {
      router.replace(ROUTES.HOME);
    }
  }, [checkedSession, isPublicPath, isAuthenticated, actorType, isApproved, pathname, router]);

  if (isPublicPath) {
    // Still resolving the session, or the already-logged-in redirect above
    // is about to fire — render nothing rather than flashing the login form
    // at someone who's already signed in.
    if (!checkedSession || (isAuthenticated && actorType === 'b2b')) return null;
    return <>{children}</>;
  }

  // Still resolving the session (or a redirect above is about to fire) —
  // render nothing rather than flashing the dashboard/sidebar first. Only
  // gated on the one-time initial check, not the shared `loading` flag —
  // that flag also flips for unrelated actions (e.g. a password change
  // further down the tree) and would otherwise blank the whole page then.
  if (!checkedSession || !isAuthenticated || actorType !== 'b2b') return null;
  if (!isApproved) return pathname === ROUTES.BUSINESS.APPROVAL ? <>{children}</> : null;
  if (CHROME_FREE_PATHS.includes(pathname)) return <>{children}</>;

  return <B2BLayout>{children}</B2BLayout>;
}
