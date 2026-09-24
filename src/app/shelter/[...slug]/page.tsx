import { redirect } from 'next/navigation';

export default async function ShelterCatchAllRedirect({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug && slug.length > 0 ? slug[0] : 'dashboard';
  redirect(`/recipient/${path}`);
}
