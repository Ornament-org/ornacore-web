'use client';

import AccountHeader from '@/features/account/components/AccountHeader/AccountHeader';
import AppHeader from '@/features/home/components/AppHeader/AppHeader';
import BottomNav from '@/features/home/components/BottomNav/BottomNav';
import MetalSwitcher from '@/features/home/components/MetalSwitcher/MetalSwitcher';
import { MetalThemeProvider } from '@/features/home/context/MetalThemeContext';
import { ROUTES } from '@/constants/routes';
import styles from './AppSkeletons.module.scss';

const shimmerItems = (count, className) =>
  Array.from({ length: count }, (_, index) => <div key={index} className={className} />);

export function ProductGridSkeleton({ count = 10 }) {
  return <div className={styles.productGrid}>{shimmerItems(count, styles.productCard)}</div>;
}

function HeaderSkeleton() {
  return (
    <>
      <AppHeader />
      <MetalSwitcher />
    </>
  );
}

export function HomeSkeleton() {
  return (
    <MetalThemeProvider>
      <HeaderSkeleton />
      <main className={styles.homePage} aria-busy="true" aria-label="Loading home">
        <section className={styles.heroSkeleton}>
          <div className={styles.heroCopy}>
            <span />
            <strong />
            <em />
            <b />
          </div>
          <div className={styles.heroImage} />
        </section>
        <section className={styles.homeSection}>
          <div className={styles.sectionTitle} />
          <div className={styles.collectionRow}>{shimmerItems(4, styles.collectionCard)}</div>
        </section>
        <ProductGridSkeleton count={8} />
      </main>
      <BottomNav />
    </MetalThemeProvider>
  );
}

export function ProductsSkeleton() {
  return (
    <MetalThemeProvider>
      <HeaderSkeleton />
      <main className={styles.listPage} aria-busy="true" aria-label="Loading products">
        <div className={styles.titleRow}>
          <span />
          <div>
            <strong />
            <em />
          </div>
        </div>
        <div className={styles.chipRow}>{shimmerItems(7, styles.chip)}</div>
        <div className={styles.toolbar}>
          <span />
          <span />
        </div>
        <ProductGridSkeleton count={10} />
      </main>
      <BottomNav />
    </MetalThemeProvider>
  );
}

export function CategoriesSkeleton() {
  return (
    <MetalThemeProvider defaultMetal="gold">
      <HeaderSkeleton />
      <main className={styles.categoryPage} aria-busy="true" aria-label="Loading categories">
        <div className={styles.titleRow}>
          <span />
          <div>
            <strong />
            <em />
          </div>
        </div>
        <section className={styles.categoryShell}>
          <aside className={styles.categorySide}>{shimmerItems(8, styles.categoryItem)}</aside>
          <div className={styles.categoryContent}>
            <div className={styles.contentHead}>
              <strong />
              <em />
            </div>
            <div className={styles.chipRow}>{shimmerItems(5, styles.chip)}</div>
            <ProductGridSkeleton count={8} />
          </div>
        </section>
      </main>
      <BottomNav />
    </MetalThemeProvider>
  );
}

export function ProfileSkeleton({ title = 'Profile', description = 'View and manage your shop profile' }) {
  return (
    <main className={styles.profilePage} aria-busy="true" aria-label="Loading account">
      <AccountHeader title={title} description={description} backHref={ROUTES.HOME} backLabel="Home" />
      <div className={styles.profileWorkspace}>
        <aside className={styles.profileSide}>
          <div className={styles.identitySkeleton}>
            <span />
            <div>
              <strong />
              <em />
              <em />
            </div>
          </div>
          {shimmerItems(4, styles.menuSkeleton)}
          <div className={styles.secureSkeleton} />
        </aside>
        <section className={styles.profileDetail}>
          {shimmerItems(4, styles.formSkeleton)}
        </section>
      </div>
    </main>
  );
}

export function OrderDetailSkeleton() {
  return (
    <main className={styles.profilePage} aria-busy="true" aria-label="Loading order">
      <AccountHeader title="Order details" description="Fetching your order summary" backHref={ROUTES.ORDERS} backLabel="My Orders" />
      <div className={styles.orderGrid}>
        <section className={styles.orderItems}>{shimmerItems(5, styles.orderRow)}</section>
        <aside className={styles.orderSummary}>{shimmerItems(6, styles.summaryLine)}</aside>
      </div>
    </main>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className={styles.productDetailPage} aria-busy="true" aria-label="Loading product">
      <div className={styles.detailBreadcrumb} />
      <div className={styles.productDetailGrid}>
        <section className={styles.gallerySkeleton}>
          <div className={styles.thumbColumn}>{shimmerItems(4, styles.thumbSkeleton)}</div>
          <div className={styles.mainProductImage} />
        </section>
        <section className={styles.productInfoSkeleton}>
          <span />
          <strong />
          <em />
          <div className={styles.specGrid}>{shimmerItems(3, styles.specCard)}</div>
          <b />
          <i />
        </section>
      </div>
    </main>
  );
}
