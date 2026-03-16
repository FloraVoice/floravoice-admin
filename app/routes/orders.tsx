import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { TableSkeleton } from "~/components/table-skeleton";
import { toast } from "sonner";
import { ordersApi, type OrderResponse, ApiError } from "~/lib/api";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function meta() {
  return [{ title: "Orders — FloraVoice Admin" }];
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    ordersApi
      .list()
      .then(setOrders)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load orders"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      {isLoading ? (
        <div className="rounded-md border">
          <TableSkeleton
            columns={[
              { width: "320px" },
              { width: "320px" },
              {},
              {},
              { align: "right" },
            ]}
          />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-80">ID</TableHead>
                <TableHead className="w-80">Customer ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="w-20 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.user_id}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDetailOrder(order)}
                      aria-label="View details"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs break-all">{detailOrder.id}</span>
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-mono text-xs break-all">{detailOrder.user_id}</span>
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(detailOrder.created_at).toLocaleString()}</span>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flower ID</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Price at Purchase</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.flower_id}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${item.price_at_purchase.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(item.quantity * item.price_at_purchase).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        $
                        {detailOrder.items
                          .reduce(
                            (sum, i) => sum + i.quantity * i.price_at_purchase,
                            0,
                          )
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
