import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { usersApi, type User, ApiError } from "~/lib/api";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Customers — FloraVoice Admin" }];
}

interface CustomerFormState {
  email: string;
  username: string;
  password: string;
  address: string;
}

const emptyForm: CustomerFormState = {
  email: "",
  username: "",
  password: "",
  address: "",
};

function CustomerFormFields({
  values,
  onChange,
  isEdit = false,
}: {
  values: CustomerFormState;
  onChange: (next: CustomerFormState) => void;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="customer-email">Email</Label>
        <Input
          id="customer-email"
          type="email"
          autoComplete="off"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-username">Username</Label>
        <Input
          id="customer-username"
          type="text"
          autoComplete="off"
          value={values.username}
          onChange={(e) => onChange({ ...values, username: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-password">
          Password{isEdit && " (required to save changes)"}
        </Label>
        <Input
          id="customer-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => onChange({ ...values, password: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-address">Address</Label>
        <Input
          id="customer-address"
          type="text"
          autoComplete="off"
          value={values.address}
          onChange={(e) => onChange({ ...values, address: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CustomerFormState>(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<CustomerFormState>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    usersApi
      .list()
      .then(setCustomers)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load customers"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (editTarget) {
      setEditForm({
        email: editTarget.email,
        username: editTarget.username,
        password: "",
        address: editTarget.address,
      });
    }
  }, [editTarget]);

  async function handleCreate() {
    setCreateLoading(true);
    try {
      const created = await usersApi.create(createForm);
      setCustomers((prev) => [...prev, created]);
      setCreateOpen(false);
      setCreateForm(emptyForm);
      toast.success("Customer created");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create customer");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const updated = await usersApi.update(editTarget.id, {
        email: editForm.email,
        username: editForm.username,
        password: editForm.password,
        address: editForm.address,
      });
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditTarget(null);
      toast.success("Customer updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update customer");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await usersApi.delete(deleteTarget.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Customer deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete customer");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No customers found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-80">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{customer.id}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="font-medium">{customer.username}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.address}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(customer)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(customer)}
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
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <CustomerFormFields values={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerFormFields values={editForm} onChange={setEditForm} isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteTarget?.username}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
