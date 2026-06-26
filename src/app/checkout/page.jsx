'use client';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';

export default function CheckoutPage() {
  const { items, total } = useSelector((s) => s.cart);
  const gst = Math.round(total * 0.03);

  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, marginBottom: '2rem' }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, marginBottom: '1rem' }}>Delivery Address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input label="Full Name" placeholder="Your name" />
                <Input label="Mobile" placeholder="+91 98765 43210" />
                <Input label="Pincode" placeholder="400001" />
                <Input label="City" placeholder="Mumbai" />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input label="Full Address" placeholder="House/Flat, Street, Area" />
                </div>
                <Input label="State" placeholder="Maharashtra" />
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, marginBottom: '1rem' }}>Payment Method</h2>
              {['UPI', 'Net Banking', 'Credit/Debit Card', 'Cash on Delivery'].map((m) => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f0e8de', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value={m} style={{ accentColor: '#b8860b' }} />
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#1a1410' }}>{m}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ background: '#f9f5f0', border: '1px solid #e8ddd0', borderRadius: 16, padding: '1.75rem', position: 'sticky', top: 90 }}>
            <h2 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, marginBottom: '1.25rem' }}>Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#5c4f3a' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid #e8ddd0', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Jost, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1a1410', marginBottom: '1.25rem' }}>
              <span>Total</span>
              <span>₹{(total + gst).toLocaleString('en-IN')}</span>
            </div>
            <Button fullWidth size="lg">Place Order</Button>
            <Link href={ROUTES.CART} style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#9e8c72' }}>← Back to Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
