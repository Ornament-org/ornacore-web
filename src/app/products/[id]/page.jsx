import ProductDetailPage from '@/features/products/pages/ProductDetailPage';

export const metadata = { title: 'Product Details — OrnaCo' };

export default function Page({ params }) {
  return <ProductDetailPage id={params.id} />;
}
