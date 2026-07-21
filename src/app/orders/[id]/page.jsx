import OrderDetailPage from '@/features/orders/pages/OrderDetailPage';

export const metadata = { title: 'Order Details' };

export default async function Page({ params }) {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
