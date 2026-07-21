import ProfileClient from '../profile/ProfileClient';

export const metadata = { title: 'My Orders' };

// My Orders is a tab within the Account workspace (same sidebar + split
// layout as /profile) rather than its own page shell — this route just
// lands there with that tab pre-selected, for direct links (post-checkout
// redirect, footer "Track Order", etc.).
export default function OrdersPage() {
  return <ProfileClient initialTab="orders" />;
}
