import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface DataGridProps<TData> {
  table: ReactTable<TData>;
  columnsLength: number;
  isPending?: boolean;
  noResultsMessage?: string;
  onRowClick?: (row: TData) => void;
  renderMobileItem?: (row: TData) => React.ReactNode;
}

export function DataGrid<TData>({ 
  table, 
  columnsLength, 
  isPending, 
  noResultsMessage = "No results found.",
  onRowClick,
  renderMobileItem
}: DataGridProps<TData>) {
  return (
    <>
      <div className={`rounded-md border bg-card relative overflow-hidden ${renderMobileItem ? 'hidden md:block' : ''}`}>
        {isPending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsLength} className="h-24 text-center text-muted-foreground">
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderMobileItem && (
        <div className={`md:hidden flex flex-col gap-3 relative ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                {renderMobileItem(row.original)}
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground border rounded-xl bg-card">
              {noResultsMessage}
            </div>
          )}
        </div>
      )}
    </>
  );
}
