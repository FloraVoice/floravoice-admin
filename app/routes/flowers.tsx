import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Loader2, Flower2 } from "lucide-react";
import { toast } from "sonner";
import { flowersApi, type FlowerResponse, ApiError } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function meta() {
  return [{ title: "Flowers — FloraVoice Admin" }];
}

// ── Create / Edit form state ──────────────────────────────────────────────────

interface FlowerFormState {
  name: string;
  price: string;
  quantity: string;
}

const emptyForm: FlowerFormState = { name: "", price: "", quantity: "" };

function FlowerFormFields({
  values,
  onChange,
}: {
  values: FlowerFormState;
  onChange: (next: FlowerFormState) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="flower-name">Name</Label>
        <Input
          id="flower-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="Rose"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="flower-price">Price ($)</Label>
        <Input
          id="flower-price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => onChange({ ...values, price: e.target.value })}
          placeholder="9.99"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="flower-quantity">Quantity</Label>
        <Input
          id="flower-quantity"
          type="number"
          min="0"
          step="1"
          value={values.quantity}
          onChange={(e) => onChange({ ...values, quantity: e.target.value })}
          placeholder="100"
        />
      </div>
    </div>
  );
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (quantity < 10) {
    return <Badge variant="outline" className="border-orange-400 text-orange-600">Low stock</Badge>;
  }
  return <Badge variant="secondary">{quantity}</Badge>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Flowers() {
  const [flowers, setFlowers] = useState<FlowerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FlowerFormState>(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<FlowerResponse | null>(null);
  const [editForm, setEditForm] = useState<FlowerFormState>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<FlowerResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    flowersApi
      .list()
      .then(setFlowers)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load flowers"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  // Sync edit form when target changes
  useEffect(() => {
    if (editTarget) {
      setEditForm({
        name: editTarget.name,
        price: String(editTarget.price),
        quantity: String(editTarget.quantity),
      });
    }
  }, [editTarget]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleCreate() {
    setCreateLoading(true);
    try {
      const created = await flowersApi.create({
        name: createForm.name,
        price: parseFloat(createForm.price),
        quantity: parseInt(createForm.quantity, 10),
      });
      setFlowers((prev) => [...prev, created]);
      setCreateOpen(false);
      setCreateForm(emptyForm);
      toast.success("Flower created");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create flower");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const updated = await flowersApi.update(editTarget.id, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity, 10),
      });
      setFlowers((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
      setEditTarget(null);
      toast.success("Flower updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update flower");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await flowersApi.delete(deleteTarget.id);
      setFlowers((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Flower deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete flower");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Flowers</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Flower
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {isLoading ? "Loading…" : `${flowers.length} flower${flowers.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : flowers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Flower2 className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No flowers yet</p>
              <p className="text-xs text-muted-foreground">Add your first flower to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-80">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flowers.map((flower) => (
                  <TableRow key={flower.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{flower.id}</TableCell>
                    <TableCell className="font-medium">{flower.name}</TableCell>
                    <TableCell>${flower.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <StockBadge quantity={flower.quantity} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(flower)}
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(flower)}
                        aria-label="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Flower</DialogTitle>
            <DialogDescription>Add a new flower to your catalogue.</DialogDescription>
          </DialogHeader>
          <FlowerFormFields values={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Creating…</> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flower</DialogTitle>
            <DialogDescription>Update the details for <strong>{editTarget?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <FlowerFormFields values={editForm} onChange={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving…</> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flower</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
