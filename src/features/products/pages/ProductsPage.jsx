'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowDownUp, ArrowLeft, ChevronDown, PackageSearch, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import AppHeader from '@/features/home/components/AppHeader/AppHeader';
import BottomNav from '@/features/home/components/BottomNav/BottomNav';
import FloatingCartBar from '@/features/home/components/FloatingCartBar/FloatingCartBar';
import MetalSwitcher from '@/features/home/components/MetalSwitcher/MetalSwitcher';
import ProductCardB2B from '@/features/home/components/ProductCardB2B/ProductCardB2B';
import { MetalThemeProvider, useMetalTheme } from '@/features/home/context/MetalThemeContext';
import { useMetalIdMap } from '@/hooks/useMetalIdMap';
import { productApi } from '@/services/productApi';
import { ROUTES } from '@/constants/routes';
import { METALS } from '@/constants/metals';
import styles from './ProductsPage.module.scss';

const PAGE_SIZE = 60;

const WEIGHT_BUCKETS = [
  { id: 'all', label: 'Weight Range' },
  { id: 'under-3', label: 'Under 3 gm', test: (w) => w < 3 },
  { id: '3-6', label: '3 - 6 gm', test: (w) => w >= 3 && w < 6 },
  { id: '6-10', label: '6 - 10 gm', test: (w) => w >= 6 && w < 10 },
  { id: '10-plus', label: '10 gm & above', test: (w) => w >= 10 },
];

const PRICE_BUCKETS = [
  { id: 'all', label: 'Price Range' },
  { id: 'under-20k', label: 'Under ₹20,000', test: (p) => p < 20000 },
  { id: '20k-40k', label: '₹20,000 - ₹40,000', test: (p) => p >= 20000 && p < 40000 },
  { id: '40k-plus', label: '₹40,000 & above', test: (p) => p >= 40000 },
];

const humanizeSlug = (slug = '') => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const primaryImage = (product) =>
  product.images?.find((image) => image.isPrimary)?.media?.secureUrl
  ?? product.images?.[0]?.media?.secureUrl
  ?? null;

const defaultVariant = (product) =>
  product.variants?.find((variant) => variant.isDefault)
  ?? product.variants?.find((variant) => variant.isActive)
  ?? product.variants?.[0]
  ?? {};

const toCardProduct = (product) => {
  const variant = defaultVariant(product);
  const price = variant.yourPrice ?? variant.publicPrice;
  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.name,
    imageUrl: primaryImage(product),
    purity: variant.publicPurity || variant.purity || (variant.publicKarat ? `${Number(variant.publicKarat)}K` : null),
    weight: Number(variant.weightGrams),
    price: price !== null && price !== undefined ? Math.round(Number(price)) : null,
    variants: product.variants ?? [],
    metalName: product.metal?.name ?? null,
  };
};

function ProductsBrowser({ collectionSlug, categorySlugParam, categoryIdParam }) {
  const { metalId, metal } = useMetalTheme();
  const metalIdMap = useMetalIdMap();
  const isAllMetals = metalId === 'all';
  const backendMetalId = metalIdMap ? (isAllMetals ? undefined : metalIdMap[metalId]) : undefined;

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState('popular');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purityFilter, setPurityFilter] = useState('all');
  const [weightFilter, setWeightFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const initialCategoryConsumedRef = useRef(false);

  // Category chips — scoped to the active metal, or every category when on
  // "All Metals". The very first successful load also resolves the
  // `category`/`categoryId` URL params (once); every metal switch after that
  // resets the chip filter, since a category picked under one metal has no
  // meaning once you jump to another.
  useEffect(() => {
    if (!metalIdMap) return undefined;
    let alive = true;
    productApi
      .getCategories(backendMetalId ? { metalId: backendMetalId } : {})
      .then((response) => {
        if (!alive) return;
        const list = response.data ?? [];
        setCategories(list);

        if (!initialCategoryConsumedRef.current) {
          initialCategoryConsumedRef.current = true;
          if (categoryIdParam) {
            setCategoryFilter(String(categoryIdParam));
            return;
          }
          if (categorySlugParam) {
            const match = list.find((category) => category.slug === categorySlugParam);
            if (match) {
              setCategoryFilter(String(match.id));
              return;
            }
          }
          setCategoryFilter('all');
        } else {
          setCategoryFilter('all');
        }
      })
      .catch(() => {
        if (alive) setCategories([]);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metalIdMap, backendMetalId]);

  useEffect(() => {
    let alive = true;

    const loadProducts = async () => {
      if (!metalIdMap) return;
      setLoading(true);
      setPurityFilter('all');
      setWeightFilter('all');
      setPriceFilter('all');

      const params = { limit: PAGE_SIZE };
      if (backendMetalId) params.metalId = backendMetalId;
      if (collectionSlug) params.collection = collectionSlug;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;

      try {
        const response = await productApi.getAll(params);
        if (alive) setProducts((response.data ?? []).map(toCardProduct));
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadProducts();

    return () => {
      alive = false;
    };
  }, [metalIdMap, backendMetalId, collectionSlug, categoryFilter]);

  const purityOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.purity).filter(Boolean))),
    [products],
  );

  const activeFilterCount = [purityFilter, weightFilter, priceFilter].filter((value) => value !== 'all').length;

  const clearAllFilters = () => {
    setPurityFilter('all');
    setWeightFilter('all');
    setPriceFilter('all');
  };

  const visibleProducts = useMemo(() => {
    const weightBucket = WEIGHT_BUCKETS.find((bucket) => bucket.id === weightFilter);
    const priceBucket = PRICE_BUCKETS.find((bucket) => bucket.id === priceFilter);

    const filtered = products.filter((product) => {
      if (purityFilter !== 'all' && product.purity !== purityFilter) return false;
      if (weightBucket?.test && !weightBucket.test(product.weight)) return false;
      if (priceBucket?.test && !priceBucket.test(product.price ?? -1)) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sortMode === 'price-low') {
      sorted.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    }
    if (sortMode === 'price-high') {
      sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }
    return sorted;
  }, [products, sortMode, purityFilter, weightFilter, priceFilter]);

  const cycleSort = () => {
    setSortMode((current) => {
      if (current === 'latest') return 'price-low';
      if (current === 'price-low') return 'price-high';
      return 'latest';
    });
  };

  const pageTitle = isAllMetals ? 'All Jewellery' : `${metal.label} Jewellery`;

  return (
    <main className={styles.page}>
      <div className={styles.headingRow}>
        <Link href={ROUTES.HOME} className={styles.backButton} aria-label="Back to home">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1>{pageTitle}</h1>
          <p className={styles.count}>{visibleProducts.length} products</p>
        </div>
      </div>

      {collectionSlug ? (
        <div className={styles.collectionBanner}>
          <span>Filtered by collection: {humanizeSlug(collectionSlug)}</span>
          <Link href={`${ROUTES.PRODUCTS}?metal=${metalId}`} aria-label="Clear collection filter">
            <X size={14} />
          </Link>
        </div>
      ) : null}

      {categories.length ? (
        <div className={styles.chips} aria-label="Categories">
          <button
            type="button"
            className={[styles.chip, categoryFilter === 'all' && styles['chip--active']].filter(Boolean).join(' ')}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={[styles.chip, String(categoryFilter) === String(category.id) && styles['chip--active']]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setCategoryFilter(String(category.id))}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.toolbar}>
        {products.length ? (
          <div className={styles.filterBar} aria-label="Product filters">
            <span className={styles.filterBarLabel}>
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </span>

            <label
              className={[styles.filterSelect, purityFilter !== 'all' && styles['filterSelect--active']]
                .filter(Boolean)
                .join(' ')}
            >
              <select value={purityFilter} onChange={(event) => setPurityFilter(event.target.value)}>
                <option value="all">Purity</option>
                {purityOptions.map((purity) => (
                  <option key={purity} value={purity}>
                    Purity: {purity}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>

            <label
              className={[styles.filterSelect, weightFilter !== 'all' && styles['filterSelect--active']]
                .filter(Boolean)
                .join(' ')}
            >
              <select value={weightFilter} onChange={(event) => setWeightFilter(event.target.value)}>
                {WEIGHT_BUCKETS.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.id === 'all' ? bucket.label : `Weight: ${bucket.label}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>

            <label
              className={[styles.filterSelect, priceFilter !== 'all' && styles['filterSelect--active']]
                .filter(Boolean)
                .join(' ')}
            >
              <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
                {PRICE_BUCKETS.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.id === 'all' ? bucket.label : `Price: ${bucket.label}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>

            {activeFilterCount ? (
              <button type="button" className={styles.filterClear} onClick={clearAllFilters}>
                <RotateCcw size={13} /> Clear All
              </button>
            ) : null}
          </div>
        ) : (
          <span />
        )}

        <button type="button" className={styles.sortButton} onClick={cycleSort}>
          <ArrowDownUp size={16} />
          {sortMode === 'latest' ? 'Sort By' : sortMode === 'price-low' ? 'Low to High' : 'High to Low'}
        </button>
      </div>

      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => <div key={index} className={styles.skeleton} />)
        ) : visibleProducts.length ? (
          visibleProducts.map((product) => <ProductCardB2B key={product.id} product={product} />)
        ) : products.length ? (
          <div className={styles.empty}>
            <PackageSearch size={36} />
            <p>No products match your filters.</p>
            <button type="button" className={styles.filterClear} onClick={clearAllFilters}>
              <RotateCcw size={13} /> Clear All
            </button>
          </div>
        ) : (
          <div className={styles.empty}>
            <PackageSearch size={36} />
            <p>No active products found here.</p>
            <span>Add products from toolbox and publish them to show here.</span>
          </div>
        )}
      </div>

      <FloatingCartBar />
      <BottomNav />
    </main>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const requestedMetal = searchParams.get('metal');
  const defaultMetal = METALS.some((item) => item.id === requestedMetal) ? requestedMetal : 'all';
  const collectionSlug = searchParams.get('collection') || null;
  const categorySlugParam = searchParams.get('category') || null;
  const categoryIdParam = searchParams.get('categoryId') || null;

  return (
    <MetalThemeProvider defaultMetal={defaultMetal}>
      <AppHeader />
      <MetalSwitcher />
      <ProductsBrowser
        collectionSlug={collectionSlug}
        categorySlugParam={categorySlugParam}
        categoryIdParam={categoryIdParam}
      />
    </MetalThemeProvider>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}
