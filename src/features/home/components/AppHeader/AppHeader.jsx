'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Search, ChevronDown, BadgeCheck, Gem, LayoutGrid, Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { productApi } from '@/services/productApi';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './AppHeader.module.scss';

const primaryImage = (product) =>
  product.images?.find((image) => image.isPrimary)?.media?.secureUrl
  ?? product.images?.[0]?.media?.secureUrl
  ?? null;

export default function AppHeader() {
  const router = useRouter();
  const displayName = useSelector((state) => state.branding.displayName);
  const logo = useSelector((state) => state.branding.logo);
  const shopkeeper = useSelector((state) => state.auth.user?.shopkeeper);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [productResults, setProductResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const allCategoriesRef = useRef(null);
  const searchRef = useRef(null);
  const isVerified = shopkeeper?.status === 'APPROVED';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the results dropdown on an outside click.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  // Live suggestions: products come from the catalog search (name/design
  // code), categories are matched client-side against the full list (the
  // categories endpoint has no server-side name search). Debounced so we
  // don't fire a request on every keystroke.
  useEffect(() => {
    let alive = true;

    const run = () => {
      const term = query.trim();
      if (term.length < 2) {
        setProductResults([]);
        setCategoryResults([]);
        setSearching(false);
        return undefined;
      }

      setSearching(true);
      const timer = setTimeout(async () => {
        try {
          if (!allCategoriesRef.current) {
            const categoriesResponse = await productApi.getCategories();
            allCategoriesRef.current = categoriesResponse.data ?? [];
          }
          const productsResponse = await productApi.getAll({ search: term, limit: 6 });
          if (!alive) return;
          const lower = term.toLowerCase();
          setProductResults(productsResponse.data ?? []);
          setCategoryResults(
            (allCategoriesRef.current ?? [])
              .filter((category) => category.name?.toLowerCase().includes(lower))
              .slice(0, 4),
          );
        } catch {
          if (alive) {
            setProductResults([]);
            setCategoryResults([]);
          }
        } finally {
          if (alive) setSearching(false);
        }
      }, 280);
      return () => clearTimeout(timer);
    };

    const cleanup = run();
    return () => {
      alive = false;
      cleanup?.();
    };
  }, [query]);

  const runSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(term)}`);
  };

  const goTo = (href) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const hasResults = productResults.length > 0 || categoryResults.length > 0;

  return (
    <header className={['app-header', styles.header, scrolled && styles['header--scrolled']].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <Link href={ROUTES.HOME} className={styles.brand}>
          <span className={[styles.brandIcon, !logo && styles['brandIcon--fallback']].filter(Boolean).join(' ')}>
            {/* eslint-disable-next-line @next/next/no-img-element -- logo host is admin-configurable (Cloudinary or local storage), so next/image's static domain allowlist can't be relied on */}
            {logo ? <img src={logo} alt="" /> : <Gem size={18} strokeWidth={1.75} />}
          </span>
          <span className={styles.brandName}>{displayName}</span>
        </Link>

        <div className={styles.searchWrap} ref={searchRef}>
          <form className={styles.search} role="search" onSubmit={runSearch}>
            <Search size={17} className={styles.searchIcon} />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search products, categories..."
              className={styles.searchInput}
              aria-label="Search products, categories, collections"
            />
          </form>

          {open && query.trim().length >= 2 ? (
            <div className={styles.results} role="listbox" aria-label="Search results">
              {searching && !hasResults ? (
                <div className={styles.resultsState}>
                  <Loader2 size={16} className={styles.spin} /> Searching…
                </div>
              ) : !hasResults ? (
                <div className={styles.resultsState}>No matches for “{query.trim()}”.</div>
              ) : (
                <>
                  {categoryResults.length ? (
                    <div className={styles.resultsGroup}>
                      <span className={styles.resultsLabel}>Categories</span>
                      {categoryResults.map((category) => (
                        <button
                          type="button"
                          key={`c-${category.id}`}
                          className={styles.resultRow}
                          onClick={() => goTo(`${ROUTES.CATEGORIES}?category=${category.slug}`)}
                        >
                          <span className={styles.resultThumb}>
                            {category.image?.secureUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- category image host is admin-configurable from toolbox media
                              <img src={category.image.secureUrl} alt="" />
                            ) : (
                              <LayoutGrid size={16} />
                            )}
                          </span>
                          <span className={styles.resultInfo}>
                            <strong>{category.name}</strong>
                            <span>{category.metal?.name ?? 'Category'}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {productResults.length ? (
                    <div className={styles.resultsGroup}>
                      <span className={styles.resultsLabel}>Products</span>
                      {productResults.map((product) => {
                        const image = primaryImage(product);
                        return (
                          <button
                            type="button"
                            key={`p-${product.id}`}
                            className={styles.resultRow}
                            onClick={() => goTo(ROUTES.PRODUCT_DETAIL(product.slug ?? product.id))}
                          >
                            <span className={styles.resultThumb}>
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media
                                <img src={image} alt="" />
                              ) : (
                                <Gem size={16} />
                              )}
                            </span>
                            <span className={styles.resultInfo}>
                              <strong>{product.name}</strong>
                              <span>{product.metal?.name ?? 'Product'}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <button type="button" className={styles.resultsAll} onClick={runSearch}>
                    See all results for “{query.trim()}”
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className={styles.actions}>
          <ThemeToggle className={styles.themeToggle} />

          <Link href={ROUTES.PROFILE} className={styles.business}>
            <span className={styles.businessIconWrap}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 21V9l8-6 8 6v12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={styles.businessInfo}>
              <span className={styles.businessName}>{shopkeeper?.shopName || 'My Shop'}</span>
              <span className={styles.businessMeta}>
                Business Account
                {isVerified ? (
                  <span className={styles.verifiedBadge}>
                    <BadgeCheck size={12} />
                    <span className={styles.verifiedText}>Verified</span>
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronDown size={16} className={styles.businessChevron} />
          </Link>
        </div>
      </div>
    </header>
  );
}
