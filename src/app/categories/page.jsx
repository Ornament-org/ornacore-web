import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

const CATEGORIES = [
  { id: 1, label: 'Gold Jewellery', icon: '💛', count: 142 },
  { id: 2, label: 'Diamond Jewellery', icon: '💎', count: 78 },
  { id: 3, label: 'Silver Jewellery', icon: '⭕', count: 96 },
  { id: 4, label: 'Wedding Collection', icon: '💍', count: 54 },
  { id: 5, label: 'Bangles & Bracelets', icon: '○', count: 88 },
  { id: 6, label: 'Earrings', icon: '◇', count: 112 },
  { id: 7, label: 'Pendants', icon: '◈', count: 67 },
  { id: 8, label: 'Rings', icon: '◯', count: 94 },
];

export const metadata = { title: 'Categories — OrnaCo' };

export default function CategoriesPage() {
  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, marginBottom: '2rem' }}>
          Shop By Category
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`${ROUTES.PRODUCTS}?category=${cat.label.toLowerCase()}`}
              style={{ background: '#fdf8f0', border: '1px solid #e8ddd0', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, color: '#1a1410', marginBottom: 4 }}>{cat.label}</p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: '#9e8c72' }}>{cat.count} products</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
