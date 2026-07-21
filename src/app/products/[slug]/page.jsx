import ProductDetailPage from '@/features/products/pages/ProductDetailPage';

export const metadata = { title: 'Product Details' };

export default async function Page({ params }) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}
