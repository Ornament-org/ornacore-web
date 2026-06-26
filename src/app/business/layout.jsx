'use client';
import { usePathname } from 'next/navigation';
import B2BLayout from '@/features/b2b/components/B2BLayout/B2BLayout';

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  // Login and register pages don't need the sidebar
  const AUTH_PATHS = ['/business/login', '/business/register'];
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) return <>{children}</>;
  return <B2BLayout>{children}</B2BLayout>;
}
