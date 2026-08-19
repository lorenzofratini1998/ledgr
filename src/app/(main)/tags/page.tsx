import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTags } from "@/features/tags/queries";
import { TagsClientView } from "@/features/tags/components/tags-client-view";
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { TaxonomyNavTabs } from '@/components/shared/taxonomy-nav-tabs';
import { CreateTagTrigger } from "@/features/tags/components/create-tag-trigger";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags - Ledgr",
  description: "Manage your transaction tags.",
};

export default async function TagsPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const searchParams = await props.searchParams;
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;

  const tagsResponse = await getTags(user.id, {
    page,
    pageSize: 20,
    search,
  });

  const trigger = <CreateTagTrigger />;

  return (
    <PageContainer>
      <PageHeader 
        title="Tags"
        description="Manage your tags for detailed transaction organization."
        action={trigger}
      />

      <TaxonomyNavTabs />

      <TagsClientView 
        tags={tagsResponse.data} 
        totalCount={tagsResponse.count}
        currentPage={page}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        {trigger}
      </div>
    </PageContainer>
  );
}
