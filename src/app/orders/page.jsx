export const metadata = { title: 'My Orders — OrnaCo' };

export default function OrdersPage() {
  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, marginBottom: '2rem' }}>My Orders</h1>
        <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Jost, sans-serif', color: '#9e8c72' }}>No orders found. Start shopping to see your orders here.</p>
        </div>
      </div>
    </div>
  );
}
