'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { productApi } from '@/services/productApi';
import { useMetalIdMap } from '@/hooks/useMetalIdMap';
import { useMetalTheme } from '../../context/MetalThemeContext';
import ProductCardB2B from '../ProductCardB2B/ProductCardB2B';
import styles from './FeaturedProducts.module.scss';

const DEFAULT_MAX_PRODUCTS = 6;

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

export default function FeaturedProducts({ title = 'Top Picks for Your Business', config = {} }) {
  const { metalId, metal } = useMetalTheme();
  const metalIdMap = useMetalIdMap();
  const [products, setProducts] = useState([]);
  const limit = Number(config.limit) > 0 ? Number(config.limit) : DEFAULT_MAX_PRODUCTS;

  useEffect(() => {
    if (!metalIdMap) return undefined;
    // "All Metals" intentionally resolves to no backend id, meaning no metal
    // filter at all — a mix across every metal, not "nothing to show".
    const backendMetalId = metalId === 'all' ? undefined : metalIdMap[metalId];

    let alive = true;
    productApi
      .getAll({ metalId: backendMetalId, limit })
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
  }, [metalId, metalIdMap, limit]);

  if (!products.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Link href={`${ROUTES.PRODUCTS}?metal=${metalId}`} className={styles.viewAll}>
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <p className={styles.sub}>
        Best-selling{metalId === 'all' ? '' : ` ${metal.label.toLowerCase()}`} picks, ready for
        quick wholesale ordering.
      </p>

      <div className={styles.grid}>
        {products.map((p) => (
          <ProductCardB2B key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
