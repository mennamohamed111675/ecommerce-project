export const formatPrice = (price) => {
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price || 0);
  return `${amount} EGP`;
};

export const normalizeProducts = (payload) => payload?.data || [];

export function productMatches(product, term) {
  const query = term.trim().toLowerCase();
  if (!query) return true;
  return [product.title, product.category?.name, product.brand?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}
