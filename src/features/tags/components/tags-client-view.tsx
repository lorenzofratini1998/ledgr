"use client";

import { DataTable, TagRow } from "./data-table";
import { columns } from "./columns";

interface TagsClientViewProps {
  tags: TagRow[];
  totalCount: number;
  currentPage: number;
}

export function TagsClientView({ 
  tags, 
  totalCount, 
  currentPage,
}: TagsClientViewProps) {
  return (
    <div className="mt-8 pb-32">
      <DataTable 
        columns={columns} 
        data={tags} 
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  );
}
