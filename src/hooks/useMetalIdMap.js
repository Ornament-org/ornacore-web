import { useEffect, useState } from 'react';
import { productApi } from '@/services/productApi';

// Backend Metal.id is not stable/sequential (confirmed DIAMOND=5, PLATINUM=6 in practice) —
// resolved once from the real /metals endpoint rather than assumed, keyed by Metal.code
// lowercased (matches the metal slugs used by MetalThemeContext, e.g. "gold", "silver").
export function useMetalIdMap() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    let alive = true;
    productApi
      .getMetals()
      .then((response) => {
        if (!alive) return;
        const entries = (response.data ?? []).map((metal) => [metal.code?.toLowerCase(), metal.id]);
        setMap(Object.fromEntries(entries));
      })
      .catch(() => {
        if (alive) setMap({});
      });
    return () => {
      alive = false;
    };
  }, []);

  return map;
}
