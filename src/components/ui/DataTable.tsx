import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import { Skeleton } from './Skeleton';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
  getRowKey: (row: T) => string | number;
  maxHeight?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No data available.',
  isLoading = false,
  getRowKey,
  maxHeight = '24rem',
}: DataTableProps<T>): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading table data">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className="w-full overflow-auto rounded-lg border border-border"
      style={{ maxHeight }}
    >
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'sticky top-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground backdrop-blur-sm',
                  column.className,
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={column.onSort}
                    aria-label={`Sort by ${column.header}`}
                  >
                    {column.header}
                    {column.sortDirection === 'asc' ? (
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : column.sortDirection === 'desc' ? (
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-b-0 hover:bg-muted/30"
            >
              {columns.map((column) => (
                <td key={column.id} className={cn('px-4 py-3 text-foreground', column.className)}>
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
