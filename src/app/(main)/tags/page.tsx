import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTags } from "@/features/tags/queries";
import { TagsClientView } from "@/features/tags/components/tags-client-view";
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

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tags for detailed transaction organization.
          </p>
        </div>
        <div className="hidden md:block">
          <CreateTagTrigger />
        </div>
      </div>

      <TagsClientView 
        tags={tagsResponse.data} 
        totalCount={tagsResponse.count}
        currentPage={page}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        <CreateTagTrigger />
      </div>
    </div>
  );
}
