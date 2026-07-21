'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowDownUp,
  ArrowLeft,
  BadgeIndianRupee,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  Gem,
  Heart,
  Minus,
  PackageSearch,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import AppHeader from '@/features/home/components/AppHeader/AppHeader';
import BottomNav from '@/features/home/components/BottomNav/BottomNav';
import FloatingCartBar from '@/features/home/components/FloatingCartBar/FloatingCartBar';
import MetalSwitcher from '@/features/home/components/MetalSwitcher/MetalSwitcher';
import VariantPickerSheet from '@/features/home/components/VariantPickerSheet/VariantPickerSheet';
import { MetalThemeProvider, useMetalTheme } from '@/features/home/context/MetalThemeContext';
import { addItem, updateQuantity } from '@/redux/slices/cartSlice';
import { productApi } from '@/services/productApi';
import { ROUTES } from '@/constants/routes';
import { METALS } from '@/constants/metals';
import { isProductOutOfStock, isVariantOutOfStock } from '@/utils/inventory';
import styles from './ShopByCategoriesPage.module.scss';

const CATEGORY_ICONS = [
  { match: /ear|jhum|stud|hoop|drop|chand/i, icon: Sparkles },
  { match: /nose|nath/i, icon: BadgeIndianRupee },
  { match: /bali|brace|anklet|bangle|ring/i, icon: Circle },
  { match: /chain|mangal|pendant|set/i, icon: Gem },
];

const getCategoryIcon = (name = '') =>
  CATEGORY_ICONS.find(({ match }) => match.test(name))?.icon ?? Gem;

// A plain JSX-returning helper (not a component — called as a function, not
// rendered as a tag) so the per-category icon lookup can stay a simple
// variable assignment without tripping the "components created during
// render" lint rule, mirroring the same lookup-inside-.map() pattern
// MetalSwitcher already uses for its tab icons.
function renderCategoryButton({ category, active, onSelect }) {
  const Icon = getCategoryIcon(category.name);
  return (
    <button
      type="button"
      key={category.id}
      className={[styles.categoryButton, active && styles['categoryButton--active']].filter(Boolean).join(' ')}
      onClick={() => onSelect(category.id)}
    >
      <span className={styles.categoryIcon}>
        {category.image?.secureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- category image host is admin-configurable from toolbox media
          <img src={category.image.secureUrl} alt="" />
        ) : (
          <Icon size={25} strokeWidth={1.45} />
        )}
      </span>
      <span>{category.name}</span>
    </button>
  );
}

const normalizeMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
};

const primaryImage = (product) =>
  product.images?.find((image) => image.isPrimary)?.media?.secureUrl
  ?? product.images?.[0]?.media?.secureUrl
  ?? null;

const defaultVariant = (product) =>
  product.variants?.find((variant) => variant.isDefault)
  ?? product.variants?.find((variant) => variant.isActive)
  ?? product.variants?.[0]
  ?? {};

const toProductCard = (product) => {
  const variant = defaultVariant(product);
  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.name,
    imageUrl: primaryImage(product),
    purity: variant.publicPurity || variant.purity || (variant.publicKarat ? `${Number(variant.publicKarat)}K` : null),
    weight: Number(variant.weightGrams),
    price: normalizeMoney(variant.yourPrice ?? variant.publicPrice),
    variants: product.variants ?? [],
    metalName: product.metal?.name ?? null,
  };
};

const metalCodeForTheme = (metalId) => metalId.toUpperCase();

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

function CategoryBrowser() {
  const searchParams = useSearchParams();
  const { metalId, metal } = useMetalTheme();
  const isAllMetals = metalId === 'all';
  const [backendMetals, setBackendMetals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [products, setProducts] = useState([]);
  const [sortMode, setSortMode] = useState('latest');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [purityFilter, setPurityFilter] = useState('all');
  const [weightFilter, setWeightFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const backendMetalId = useMemo(() => {
    const code = metalCodeForTheme(metalId);
    return backendMetals.find((item) =>
      String(item.code ?? '').toUpperCase() === code || item.name?.toLowerCase() === metalId
    )?.id ?? null;
  }, [backendMetals, metalId]);

  const flatCategories = useMemo(
    () => (isAllMetals ? groupedCategories.flatMap((group) => group.items) : categories),
    [isAllMetals, groupedCategories, categories],
  );

  const selectedCategory = useMemo(
    () =>
      flatCategories.find((category) => String(category.id) === String(selectedCategoryId)) ??
      flatCategories[0] ??
      null,
    [flatCategories, selectedCategoryId],
  );

  // In "All Metals" mode there's no single active metal to scope products by
  // — each category already carries its own metal, so that's what drives the
  // product fetch instead of the (nonexistent) page-level metal filter.
  const productsMetalId = isAllMetals ? selectedCategory?.metalId ?? null : backendMetalId;

  const activeCategoryId = activeFilterId === 'all' ? selectedCategory?.id : activeFilterId;
  const requestedCategorySlug = searchParams.get('category');

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

  useEffect(() => {
    let alive = true;
    productApi
      .getMetals()
      .then((response) => {
        if (alive) setBackendMetals(response.data ?? []);
      })
      .catch(() => {
        if (alive) setBackendMetals([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadCategories = async () => {
      setLoadingCategories(true);
      setCategories([]);
      setGroupedCategories([]);
      setSelectedCategoryId(null);
      setActiveFilterId('all');

      if (isAllMetals) {
        try {
          const response = await productApi.getCategoryTree({});
          if (!alive) return;
          const tree = response.data?.tree ?? [];
          const flat = response.data?.flat ?? [];
          const source = tree.length ? tree : flat;
          const metalOrder = METALS.filter((item) => item.id !== 'all').map((item) => item.id);

          const groups = Object.values(
            source.reduce((acc, category) => {
              const key = category.metal?.id ?? 'unassigned';
              if (!acc[key]) {
                acc[key] = {
                  metalId: category.metal?.id ?? null,
                  metalCode: category.metal?.code?.toLowerCase() ?? '',
                  metalName: category.metal?.name ?? 'Other',
                  items: [],
                };
              }
              acc[key].items.push(category);
              return acc;
            }, {}),
          ).sort((a, b) => metalOrder.indexOf(a.metalCode) - metalOrder.indexOf(b.metalCode));

          // Search the flat list (every depth), not `source` — `tree` only holds root
          // categories, so a subcategory slug like "drops" would never match there and
          // silently fall back to whatever root sorts first (e.g. "Anklets").
          const requestedCategory = flat.find((category) => category.slug === requestedCategorySlug);
          const requestedRootId = requestedCategory ? requestedCategory.parentId ?? requestedCategory.id : null;
          setGroupedCategories(groups);
          setSelectedCategoryId(requestedRootId ?? groups[0]?.items[0]?.id ?? null);
          setActiveFilterId(requestedCategory?.parentId ? requestedCategory.id : 'all');
        } catch {
          if (alive) setGroupedCategories([]);
        } finally {
          if (alive) setLoadingCategories(false);
        }
        return;
      }

      if (!backendMetalId) {
        setLoadingCategories(false);
        return;
      }

      try {
        const response = await productApi.getCategoryTree({ metalId: backendMetalId });
        if (!alive) return;
        const tree = response.data?.tree ?? [];
        const flat = response.data?.flat ?? [];
        const source = tree.length ? tree : flat;
        // Same as the "All Metals" branch above: match against `flat` (every depth),
        // then resolve up to the root so the sidebar highlights the right parent and
        // the subcategory itself becomes the active chip filter.
        const requestedCategory = flat.find((category) => category.slug === requestedCategorySlug);
        const requestedRootId = requestedCategory ? requestedCategory.parentId ?? requestedCategory.id : null;
        setCategories(source);
        setSelectedCategoryId(requestedRootId ?? source[0]?.id ?? null);
        setActiveFilterId(requestedCategory?.parentId ? requestedCategory.id : 'all');
      } catch {
        if (alive) setCategories([]);
      } finally {
        if (alive) setLoadingCategories(false);
      }
    };

    void loadCategories();

    return () => {
      alive = false;
    };
  }, [isAllMetals, backendMetalId, requestedCategorySlug]);

  useEffect(() => {
    let alive = true;

    const loadProducts = async () => {
      setLoadingProducts(true);
      setPurityFilter('all');
      setWeightFilter('all');
      setPriceFilter('all');

      if (!productsMetalId || !activeCategoryId) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      try {
        const response = await productApi.getAll({ metalId: productsMetalId, categoryId: activeCategoryId, limit: 24 });
        if (alive) setProducts((response.data ?? []).map(toProductCard));
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoadingProducts(false);
      }
    };

    void loadProducts();

    return () => {
      alive = false;
    };
  }, [activeCategoryId, productsMetalId]);

  const selectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setActiveFilterId('all');
  };

  const cycleSort = () => {
    setSortMode((current) => {
      if (current === 'latest') return 'price-low';
      if (current === 'price-low') return 'price-high';
      return 'latest';
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.headingRow}>
        <a href={ROUTES.HOME} className={styles.backButton} aria-label="Back to home">
          <ArrowLeft size={22} />
        </a>
        <h1>Shop by Categories</h1>
      </div>

      <section className={styles.shell}>
        <aside className={styles.sidebar} aria-label={isAllMetals ? 'All categories' : `${metal.label} categories`}>
          <div className={isAllMetals ? styles.categoryScrollerGrouped : styles.categoryScroller}>
            {loadingCategories ? (
              <div className={styles.emptySide}>Loading categories...</div>
            ) : isAllMetals ? (
              groupedCategories.length ? (
                groupedCategories.map((group) => (
                  <div key={group.metalId ?? group.metalName} className={styles.categoryGroup}>
                    <span className={styles.categoryGroupLabel}>{group.metalName}</span>
                    {group.items.map((category) =>
                      renderCategoryButton({
                        category,
                        active: String(category.id) === String(selectedCategory?.id),
                        onSelect: selectCategory,
                      }),
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptySide}>Create categories in toolbox.</div>
              )
            ) : categories.length ? (
              categories.map((category) =>
                renderCategoryButton({
                  category,
                  active: String(category.id) === String(selectedCategory?.id),
                  onSelect: selectCategory,
                }),
              )
            ) : (
              <div className={styles.emptySide}>Create {metal.label} categories in toolbox.</div>
            )}
          </div>

          <button type="button" className={styles.priceListButton}>
            <Download size={18} />
            <span>
              Download Price List
              <small>({isAllMetals ? selectedCategory?.metal?.name ?? 'All Metals' : metal.label})</small>
            </span>
          </button>
        </aside>

        <section className={styles.content}>
          <div className={styles.contentScroll}>
            <div className={styles.contentHeader}>
              <div>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                  <span>{isAllMetals ? selectedCategory?.metal?.name ?? 'All Metals' : metal.label}</span>
                  {selectedCategory ? (
                    <>
                      <ChevronRight size={12} />
                      <span>{selectedCategory.name}</span>
                    </>
                  ) : null}
                </nav>
                <h2>
                  {selectedCategory?.name ?? `${metal.label} Categories`}
                  <span>({selectedCategory?.productCount ?? products.length} Products)</span>
                </h2>
                {selectedCategory?.shortDescription ? <p>{selectedCategory.shortDescription}</p> : null}
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={cycleSort}>
                  <ArrowDownUp size={16} />
                  {sortMode === 'latest' ? 'Sort By' : sortMode === 'price-low' ? 'Low to High' : 'High to Low'}
                </button>
              </div>
            </div>

            {selectedCategory?.children?.length ? (
              <div className={styles.chips} aria-label="Subcategories">
                <button
                  type="button"
                  className={[styles.chip, activeFilterId === 'all' && styles['chip--active']].filter(Boolean).join(' ')}
                  onClick={() => setActiveFilterId('all')}
                >
                  All
                </button>
                {selectedCategory.children.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    className={[styles.chip, String(activeFilterId) === String(child.id) && styles['chip--active']].filter(Boolean).join(' ')}
                    onClick={() => setActiveFilterId(child.id)}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            ) : null}

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
            ) : null}

            <div className={styles.productGrid}>
              {loadingProducts ? (
                Array.from({ length: 6 }).map((_, index) => <div key={index} className={styles.skeleton} />)
              ) : visibleProducts.length ? (
                visibleProducts.map((product) => <CategoryProductCard key={product.id} product={product} />)
              ) : products.length ? (
                <div className={styles.emptyProducts}>
                  <PackageSearch size={36} />
                  <p>No products match your filters.</p>
                  <button type="button" className={styles.filterClear} onClick={clearAllFilters}>
                    <RotateCcw size={13} /> Clear All
                  </button>
                </div>
              ) : (
                <div className={styles.emptyProducts}>
                  <PackageSearch size={36} />
                  <p>No active products found for this category.</p>
                  <span>Add products from toolbox and publish them to show here.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

const formatCardWeight = (grams) => `${Number(grams).toFixed(3).replace(/\.?0+$/, '')} gm`;

const weightRangeOf = (variants) => {
  const weights = variants.map((variant) => Number(variant.weightGrams ?? 0)).filter((value) => value > 0);
  if (!weights.length) return 'Weight on request';
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return min === max ? formatCardWeight(min) : `${formatCardWeight(min)} – ${formatCardWeight(max)}`;
};

function CategoryProductCard({ product }) {
  const { metal } = useMetalTheme();
  const dispatch = useDispatch();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Same rule as the home/product-listing cards: a product with more than
  // one active variant (e.g. Small/Medium/Large) can't be added with a
  // single tap — open the size picker instead of guessing which one.
  const activeVariants = (product.variants ?? []).filter((variant) => variant.isActive !== false);
  const isVariable = activeVariants.length > 1;
  const singleVariant = !isVariable ? activeVariants[0] : null;
  const cartLineId = singleVariant ? singleVariant.id : product.id;
  const outOfStock = isVariable ? isProductOutOfStock(activeVariants) : isVariantOutOfStock(singleVariant);

  const quantity = useSelector((state) =>
    isVariable ? 0 : state.cart.items.find((item) => item.id === cartLineId)?.quantity ?? 0,
  );

  const weightLabel = isVariable
    ? weightRangeOf(activeVariants)
    : Number.isFinite(product.weight) && product.weight > 0
      ? formatCardWeight(product.weight)
      : 'Weight on request';

  const stopAndRun = (fn) => (event) => {
    event.preventDefault();
    fn();
  };

  const handleAddClick = stopAndRun(() => {
    if (outOfStock) return;
    if (isVariable) {
      setPickerOpen(true);
      return;
    }
    dispatch(
      addItem({
        id: cartLineId,
        variantId: singleVariant?.id ?? undefined,
        productId: product.id,
        productSlug: product.slug ?? null,
        name: product.name,
        price: product.price,
        weight: product.weight,
        imageUrl: product.imageUrl,
        metalName: product.metalName ?? null,
      }),
    );
  });
  const handleIncrement = stopAndRun(() => dispatch(updateQuantity({ id: cartLineId, quantity: quantity + 1 })));
  const handleDecrement = stopAndRun(() => dispatch(updateQuantity({ id: cartLineId, quantity: quantity - 1 })));

  return (
    <>
      <Link href={ROUTES.PRODUCT_DETAIL(product.slug ?? product.id)} className={styles.productCard}>
        <div className={styles.productImage} style={product.imageUrl ? undefined : { background: metal.gradient }}>
          <button
            type="button"
            className={styles.wishlist}
            aria-label={`Save ${product.name}`}
            onClick={(event) => event.preventDefault()}
          >
            <Heart size={18} strokeWidth={1.55} />
          </button>
          {outOfStock ? (
            <span className={styles.outOfStockBadge}>Out of Stock</span>
          ) : product.purity ? (
            <span className={styles.purity}>{product.purity}</span>
          ) : null}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media
            <img
              src={product.imageUrl}
              alt=""
              style={outOfStock ? { filter: 'grayscale(0.7)', opacity: 0.55 } : undefined}
            />
          ) : null}
        </div>
        <div className={styles.productInfo}>
          <h3>{product.name}</h3>
          {!isVariable ? <p>{weightLabel}</p> : null}
          <strong>{product.price !== null ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on request'}</strong>
          {outOfStock ? (
            <button type="button" className={styles.addButton} disabled aria-label={`${product.name} is out of stock`}>
              <span className={styles.addWeight}>Out of Stock</span>
            </button>
          ) : !isVariable && quantity > 0 ? (
            <div className={styles.stepper}>
              <button type="button" onClick={handleDecrement} aria-label={`Remove one ${product.name}`}>
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={handleIncrement} aria-label={`Add one more ${product.name}`}>
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddClick}
              aria-label={isVariable ? `Choose a size for ${product.name}` : `Add ${product.name}`}
            >
              <span className={styles.addWeight}>{weightLabel}</span>
              <Plus className={styles.addIcon} size={14} strokeWidth={2.7} />
            </button>
          )}
        </div>
      </Link>

      {isVariable ? (
        <VariantPickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          product={product}
          variants={activeVariants}
        />
      ) : null}
    </>
  );
}

function ShopByCategoriesPageInner() {
  const searchParams = useSearchParams();
  const requestedMetal = searchParams.get('metal');
  const defaultMetal = METALS.some((item) => item.id === requestedMetal) ? requestedMetal : 'gold';

  return (
    <MetalThemeProvider defaultMetal={defaultMetal}>
      <AppHeader />
      <MetalSwitcher />
      <CategoryBrowser />
      <FloatingCartBar />
      <BottomNav />
    </MetalThemeProvider>
  );
}

export default function ShopByCategoriesPage() {
  return (
    <Suspense fallback={null}>
      <ShopByCategoriesPageInner />
    </Suspense>
  );
}
