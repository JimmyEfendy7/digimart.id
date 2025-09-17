// This is a server component using Next.js App Router (v15)
import StorePageClient from './StorePageClient';

// In Next.js 15, PageProps.params can be a Promise. Use async function and await params.
export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StorePageClient storeId={id} />;
}