import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataGridPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export function DataGridPagination({
  currentPage,
  totalPages,
  onPageChange,
  isPending
}: DataGridPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`mt-4 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => handlePageChange(currentPage - 1, e)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {/* Simple compact pagination logic */}
          {currentPage > 3 && totalPages > 5 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => handlePageChange(1, e)}>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}

          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            // Logic to center the current page
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === pageNum}
                  onClick={(e) => handlePageChange(pageNum, e)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => handlePageChange(totalPages, e)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => handlePageChange(currentPage + 1, e)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
