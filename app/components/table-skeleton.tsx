import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface Column {
  width?: string;
  align?: "left" | "right";
}

interface TableSkeletonProps {
  columns: Column[];
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead
              key={i}
              className={col.width ? `w-${col.width}` : undefined}
              style={col.width ? { width: col.width } : undefined}
            >
              <Skeleton className="h-4 w-16" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, rowIdx) => (
          <TableRow key={rowIdx}>
            {columns.map((col, colIdx) => (
              <TableCell
                key={colIdx}
                className={col.align === "right" ? "text-right" : undefined}
              >
                {col.align === "right" ? (
                  <div className="flex justify-end gap-2">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                ) : (
                  <Skeleton
                    className="h-4"
                    style={{
                      width: `${60 + Math.round(((rowIdx * 7 + colIdx * 13) % 30))}%`,
                    }}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
