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

const toCardProduct = (product) => {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0] ?? {};
  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.name,
    weight: Number(defaultVariant.weightGrams ?? 0),
    purity: defaultVariant.publicPurity || defaultVariant.purity || '—',
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
      <div className={styles.productGrid} style={{ '--cols': columns }}>
        {(products ?? []).map((product) => (
          <ProductCardB2B key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// `config.collectionIds`, when set via Homepage Management, hand-picks which
// collections show here and in what order. Left unset, every active
// collection for the current metal shows automatically.
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
  const [collections, setCollections] = useState([]);
  const curatedIds = Array.isArray(config.collectionIds) ? config.collectionIds : [];
  const curatedKey = curatedIds.join(',');
  const productsPerRow = Number(config.productsPerRow) > 0
    ? Math.max(Number(config.productsPerRow), DEFAULT_PRODUCTS_PER_ROW)
    : DEFAULT_PRODUCTS_PER_ROW;
  const productRows = Number(config.productRows) > 0 ? Number(config.productRows) : DEFAULT_PRODUCT_ROWS;
  const backendMetalId = metalIdMap ? (metalId === 'all' ? undefined : metalIdMap[metalId]) : undefined;

  useEffect(() => {
    if (!metalIdMap) return undefined;

    const params = {};
    if (backendMetalId) params.metalId = backendMetalId;
    if (curatedKey) params.ids = curatedKey;

    let alive = true;
    productApi
      .getCollections(Object.keys(params).length ? params : undefined)
      .then((response) => {
        if (!alive) return;
        setCollections(response.data ?? []);
      })
      .catch(() => {
        if (alive) setCollections([]);
      });
    return () => {
      alive = false;
    };
  }, [metalIdMap, backendMetalId, curatedKey]);

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
