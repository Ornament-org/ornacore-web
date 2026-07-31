'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gem } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { productApi } from '@/services/productApi';
import { useMetalIdMap } from '@/hooks/useMetalIdMap';
import { useMetalTheme } from '../../context/MetalThemeContext';
import ProductCardB2B from '../ProductCardB2B/ProductCardB2B';
import styles from './CollectionsRow.module.scss';

const DEFAULT_PRODUCTS_PER_ROW = 6;
const DEFAULT_PRODUCT_ROWS = 1;
const skeletonItems = (count, className) =>
  Array.from({ length: count }, (_, index) => <div key={index} className={className} />);

const toCardProduct = (product) => {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0] ?? {};
  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.name,
    weight: Number(defaultVariant.weightGrams ?? 0),
    purity: defaultVariant.publicPurity || defaultVariant.purity || '—',
    tunch: defaultVariant.tunch ?? null,
    price: defaultVariant.publicPrice !== null && defaultVariant.publicPrice !== undefined
      ? Number(defaultVariant.publicPrice)
      : null,
    imageUrl: product.images?.[0]?.media?.secureUrl ?? null,
    variants: product.variants ?? [],
    metalName: product.metal?.name ?? null,
  };
};

// A PRODUCT-type collection's actual hand-picked products, fetched by
// collection slug (the same filter the storefront product listing already
// supports) so pricing/images come through the real product pipeline rather
// than the collection's own nested (unpriced) product links.
function CollectionProductGrid({ collection, metalId, backendMetalId, columns, maxProducts }) {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let alive = true;
    productApi
      .getAll({ collection: collection.slug, metalId: backendMetalId, limit: maxProducts })
      .then((response) => {
        if (!alive) return;
        setProducts((response.data ?? []).map(toCardProduct));
      })
      .catch(() => {
        if (alive) setProducts([]);
      });
    return () => {
      alive = false;
    };
  }, [collection.slug, backendMetalId, maxProducts]);

  if (products !== null && !products.length) return null;

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{collection.name}</h3>
        <Link
          href={`${ROUTES.PRODUCTS}?collection=${collection.slug}&metal=${metalId}`}
          className={styles.groupViewAll}
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>
      <div className={styles.productGrid} style={{ '--cols': columns }} aria-busy={products === null}>
        {products === null
          ? skeletonItems(Math.min(maxProducts, 6), styles.productCardSkeleton)
          : products.map((product) => (
              <ProductCardB2B key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
}

function CollectionsSkeleton() {
  return (
    <section className={styles.section} aria-busy="true" aria-label="Loading collections">
      <div className={styles.groups}>
        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <div className={styles.groupTitleSkeleton} />
            <div className={styles.viewAllSkeleton} />
          </div>
          <div className={styles.scroller}>{skeletonItems(4, styles.collectionItemSkeleton)}</div>
        </div>
        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <div className={styles.groupTitleSkeleton} />
            <div className={styles.viewAllSkeleton} />
          </div>
          <div className={styles.productGrid}>{skeletonItems(4, styles.productCardSkeleton)}</div>
        </div>
      </div>
    </section>
  );
}

// `config.collectionIds`, set via Homepage Management, is authoritative:
// only those collections show here, in that exact order. An empty list means
// the section is intentionally blank, so new catalog collections never leak
// onto the storefront just because they are active.
//
// Each collection renders as its own row. A CATEGORY-type collection with
// multiple picked categories expands into one circle per category (same
// visual language as "Shop by Category"). A PRODUCT-type collection renders
// its actual picked products as a real card grid — `config.productsPerRow` /
// `config.productRows` control the grid shape, with a "View All" link for
// the rest.
export default function CollectionsRow({ config = {} }) {
  const { metalId } = useMetalTheme();
  const metalIdMap = useMetalIdMap();
  const [collectionResult, setCollectionResult] = useState({ key: '', rows: null });
  const curatedIds = Array.isArray(config.collectionIds) ? config.collectionIds : [];
  const curatedKey = curatedIds.join(',');
  const productsPerRow = Number(config.productsPerRow) > 0
    ? Math.max(Number(config.productsPerRow), DEFAULT_PRODUCTS_PER_ROW)
    : DEFAULT_PRODUCTS_PER_ROW;
  const productRows = Number(config.productRows) > 0 ? Number(config.productRows) : DEFAULT_PRODUCT_ROWS;
  const backendMetalId = metalIdMap ? (metalId === 'all' ? undefined : metalIdMap[metalId]) : undefined;
  const requestKey = `${backendMetalId ?? 'all'}:${curatedKey}`;

  useEffect(() => {
    if (!metalIdMap) return undefined;
    if (!curatedKey) return undefined;

    const params = {};
    if (backendMetalId) params.metalId = backendMetalId;
    params.ids = curatedKey;

    let alive = true;
    productApi
      .getCollections(Object.keys(params).length ? params : undefined)
      .then((response) => {
        if (!alive) return;
        setCollectionResult({ key: requestKey, rows: response.data ?? [] });
      })
      .catch(() => {
        if (alive) setCollectionResult({ key: requestKey, rows: [] });
      });
    return () => {
      alive = false;
    };
  }, [metalIdMap, backendMetalId, curatedKey, requestKey]);

  if (!curatedKey) return null;
  if (!metalIdMap || collectionResult.key !== requestKey || collectionResult.rows === null) {
    return <CollectionsSkeleton />;
  }

  const collections = collectionResult.rows;
  if (!collections.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.groups}>
        {collections.map((collection) => {
          const categories = collection.type === 'CATEGORY' ? collection.categoryLinks ?? [] : [];

          if (categories.length) {
            return (
              <div key={collection.id} className={styles.group}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>{collection.name}</h3>
                  <Link href={`${ROUTES.CATEGORIES}?metal=${metalId}`} className={styles.groupViewAll}>
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                <div className={styles.scroller}>
                  {categories.map(({ category }) =>
                    category ? (
                      <Link
                        key={category.id}
                        href={`${ROUTES.CATEGORIES}?metal=${metalId}&category=${category.slug}`}
                        className={styles.item}
                      >
                        <span className={styles.iconWrap}>
                          {category.image?.secureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- category image host is admin-configurable, not a fixed remote-pattern domain
                            <img src={category.image.secureUrl} alt="" />
                          ) : (
                            <Gem size={24} strokeWidth={1.25} />
                          )}
                        </span>
                        <span className={styles.label}>{category.name}</span>
                      </Link>
                    ) : null,
                  )}
                </div>
              </div>
            );
          }

          return (
            <CollectionProductGrid
              key={collection.id}
              collection={collection}
              metalId={metalId}
              backendMetalId={backendMetalId}
              columns={productsPerRow}
              maxProducts={productsPerRow * productRows}
            />
          );
        })}
      </div>
    </section>
  );
}
