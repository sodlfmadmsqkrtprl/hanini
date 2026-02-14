import { notFound } from 'next/navigation';
import { HOBBY_SLUGS, isHobbySlug } from '@/app/page-modules/hobby/constants/slugs';
import { HobbySlugPage } from '@/app/page/hobby/[slug]';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return HOBBY_SLUGS.map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!isHobbySlug(slug)) {
    notFound();
  }

  return <HobbySlugPage slug={slug} />;
}
