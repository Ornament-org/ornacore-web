'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '@/services/productApi';
import { useMetalIdMap } from '@/hooks/useMetalIdMap';
import { useMetalTheme } from '../../context/MetalThemeContext';
import styles from './HeroCarousel.module.scss';

// Legacy fallback placement key, used only when the "Promotional Banners"
// homepage section hasn't been configured at all.
const HERO_PLACEMENT_KEY = 'home_hero';

const DEFAULT_BANNERS = [
  {
    id: 'nathni-default',
    imageUrl: '/banners/nathni-banner.png',
    alt: 'Nathni premium collection banner',
    target: '/products?category=nathni',
  },
];

const toSlide = (banner) => ({
  id: banner.id,
  imageUrl: banner.image?.secureUrl,
  mobileImageUrl: banner.mobileImage?.secureUrl,
  alt: banner.subtitle || banner.title || 'Homepage banner',
  target: banner.linkUrl,
});

// `config.bannerIds`, when set via Homepage Management's banner picker, hand-picks
// which banners rotate here (across any metals), narrowed to the current metal
// tab at render time. Left unset, falls back to the "home_hero" placement.
export default function HeroCarousel({ config = {} }) {
  const { metalId } = useMetalTheme();
  const metalIdMap = useMetalIdMap();
  const [index, setIndex] = useState(0);
  const [bannerSlides, setBannerSlides] = useState(DEFAULT_BANNERS);
  const curatedIds = Array.isArray(config.bannerIds) ? config.bannerIds : [];
  const curatedKey = curatedIds.join(',');

  useEffect(() => {
    if (curatedKey && !metalIdMap) return undefined;
    const backendMetalId = metalIdMap?.[metalId];

    const params = curatedKey
      ? { ids: curatedKey, metalId: backendMetalId || undefined }
      : { placement: HERO_PLACEMENT_KEY };

    let alive = true;
    productApi
      .getBanners(params)
      .then((response) => {
        if (!alive) return;
        const banners = (response.data ?? []).map(toSlide).filter((banner) => banner.imageUrl);
        setBannerSlides(banners.length ? banners : DEFAULT_BANNERS);
      })
      .catch(() => {
        if (alive) setBannerSlides(DEFAULT_BANNERS);
      });

    return () => {
      alive = false;
    };
  }, [metalId, metalIdMap, curatedKey]);

  useEffect(() => {
    const slideCount = bannerSlides.length;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slideCount), 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const goTo = (i) => setIndex(((i % bannerSlides.length) + bannerSlides.length) % bannerSlides.length);
  const banner = bannerSlides[index] ?? bannerSlides[0];
  const bannerImage = banner.mobileImageUrl ? (
    <>
      <Image
        src={banner.imageUrl}
        alt={banner.alt}
        className={[styles.bannerImage, styles.bannerImageDesktop].join(' ')}
        fill
        priority
        sizes="(min-width: 1360px) 1360px, 100vw"
        unoptimized
      />
      <Image
        src={banner.mobileImageUrl}
        alt={banner.alt}
        className={[styles.bannerImage, styles.bannerImageMobile].join(' ')}
        fill
        priority
        sizes="100vw"
        unoptimized
      />
    </>
  ) : (
    <Image
      src={banner.imageUrl}
      alt={banner.alt}
      className={styles.bannerImage}
      fill
      priority
      sizes="(min-width: 1360px) 1360px, 100vw"
      unoptimized
    />
  );
  const bannerContent = banner.target ? (
    <Link href={banner.target} className={styles.bannerLink} aria-label={banner.alt}>
      {bannerImage}
    </Link>
  ) : (
    bannerImage
  );

  return (
    <section className={styles.hero} aria-label="Featured promotions">
      <div className={styles.bannerFrame}>
        {bannerContent}
        {bannerSlides.length > 1 ? (
          <>
            <button
              type="button"
              className={[styles.navBtn, styles.navPrev].join(' ')}
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={[styles.navBtn, styles.navNext].join(' ')}
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}
      </div>

      {bannerSlides.length > 1 ? (
        <div className={styles.dots}>
          {bannerSlides.map((bannerSlide, i) => (
            <button
              key={bannerSlide.id}
              type="button"
              className={[styles.dot, i === index && styles['dot--active']].filter(Boolean).join(' ')}
              onClick={() => goTo(i)}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
