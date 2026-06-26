import ProductsPage from '@/features/products/pages/ProductsPage';

export const metadata = { title: 'Products — OrnaCo' };

export default function Page({ searchParams }) {
  return <ProductsPage searchParams={searchParams} />;
}
