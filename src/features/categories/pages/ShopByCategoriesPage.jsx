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
import { cardBadgeLabel, formatTunch } from '@/utils/tunch';
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
    tunch: variant.tunch ?? null,
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

const collectCategoryIds = (category) => {
  if (!category) return [];
  return [
    category.id,
    ...(category.children ?? []).flatMap((child) => collectCategoryIds(child)),
  ];
};

const findCategoryById = (category, id) => {
  if (!category || !id) return null;
  if (String(category.id) === String(id)) return category;
  for (const child of category.children ?? []) {
    const match = findCategoryById(child, id);
    if (match) return match;
  }
  return null;
};

const categoryContains = (category, id) => Boolean(findCategoryById(category, id));

const rootIdFor = (category) =>
  category?.ancestorIds?.[0] ?? category?.parentId ?? category?.id ?? null;

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
  const [tunchFilter, setTunchFilter] = useState('all');
  const [weightFilter, setWeightFilter] = useState('all');

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

  // "All" means the selected category AND everything nested under it —
  // products are usually mapped to a leaf subcategory, so scoping to just the
  // parent id would show nothing. A specific subcategory chip scopes to that
  // one category (plus its own descendants, if any).
  const activeCategoryIds = useMemo(() => {
    if (activeFilterId === 'all') return collectCategoryIds(selectedCategory);
    const chip = findCategoryById(selectedCategory, activeFilterId);
    return chip ? collectCategoryIds(chip) : activeFilterId ? [activeFilterId] : [];
  }, [activeFilterId, selectedCategory]);
  const categoryIdsKey = activeCategoryIds.join(',');
  const requestedCategorySlug = searchParams.get('category');

  const categoryLevels = useMemo(() => {
    if (!selectedCategory?.children?.length) return [];
    const levels = [];
    let parent = selectedCategory;

    while (parent?.children?.length) {
      levels.push({ parent, children: parent.children });
      if (activeFilterId === 'all') break;
      parent = parent.children.find((child) => categoryContains(child, activeFilterId));
      if (!parent || String(parent.id) === String(activeFilterId)) {
        if (!parent?.children?.length) break;
      }
    }

    return levels;
  }, [activeFilterId, selectedCategory]);

  // Options come straight from what's already in the catalog for this
  // category — no static/hardcoded list — so the dropdown only ever offers
  // tunch values a shop has actually created products at.
  const tunchOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.tunch).filter((tunch) => tunch != null && Number(tunch) > 0)))
        .sort((a, b) => Number(a) - Number(b)),
    [products],
  );

  const activeFilterCount = [tunchFilter, weightFilter].filter((value) => value !== 'all').length;

  const clearAllFilters = () => {
    setTunchFilter('all');
    setWeightFilter('all');
  };

  const visibleProducts = useMemo(() => {
    const weightBucket = WEIGHT_BUCKETS.find((bucket) => bucket.id === weightFilter);

    const filtered = products.filter((product) => {
      if (tunchFilter !== 'all' && String(product.tunch) !== tunchFilter) return false;
      if (weightBucket?.test && !weightBucket.test(product.weight)) return false;
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
  }, [products, sortMode, tunchFilter, weightFilter]);

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
          const requestedRootId = requestedCategory ? rootIdFor(requestedCategory) : null;
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
        const requestedRootId = requestedCategory ? rootIdFor(requestedCategory) : null;
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
      setTunchFilter('all');
      setWeightFilter('all');

      if (!productsMetalId || !categoryIdsKey) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      try {
        const response = await productApi.getAll({ metalId: productsMetalId, categoryIds: categoryIdsKey, limit: 24 });
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
  }, [categoryIdsKey, productsMetalId]);

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
                <span>({products.length} Products)</span>
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

          {categoryLevels.length ? (
            <div className={styles.categoryLevels} aria-label="Subcategories">
              {categoryLevels.map((level, index) => (
                <div className={styles.categoryLevel} key={level.parent.id}>
                  <span className={styles.categoryLevelLabel}>
                    {index === 0 ? 'Subcategories' : `Inside ${level.parent.name}`}
                  </span>
                  <div className={styles.chips}>
                    <button
                      type="button"
                      className={[
                        styles.chip,
                        (index === 0 ? activeFilterId === 'all' : String(activeFilterId) === String(level.parent.id)) &&
                          styles['chip--active'],
                      ].filter(Boolean).join(' ')}
                      onClick={() => setActiveFilterId(index === 0 ? 'all' : level.parent.id)}
                    >
                      All
                    </button>
                    {level.children.map((child) => {
                      const ChildIcon = getCategoryIcon(child.name);
                      const active = String(activeFilterId) === String(child.id) || categoryContains(child, activeFilterId);
                      return (
                  <button
                    type="button"
                    key={child.id}
                    className={[styles.chip, active && styles['chip--active']].filter(Boolean).join(' ')}
                    onClick={() => setActiveFilterId(child.id)}
                  >
                    <span className={styles.chipIcon}>
                      {child.image?.secureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- category image host is admin-configurable from toolbox media
                        <img src={child.image.secureUrl} alt="" />
                      ) : (
                        <ChildIcon size={11} strokeWidth={1.8} />
                      )}
                    </span>
                    {child.name}
                  </button>
                      );
                    })}
                  </div>
                </div>
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
                className={[styles.filterSelect, tunchFilter !== 'all' && styles['filterSelect--active']]
                  .filter(Boolean)
                  .join(' ')}
              >
                <select value={tunchFilter} onChange={(event) => setTunchFilter(event.target.value)}>
                  <option value="all">Tunch</option>
                  {tunchOptions.map((tunch) => (
                    <option key={tunch} value={String(tunch)}>
                      Tunch: {formatTunch(tunch)}
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
          ) : cardBadgeLabel(product.tunch, product.purity) ? (
            <span className={styles.purity}>{cardBadgeLabel(product.tunch, product.purity)}</span>
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
