import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { adminsApi, type Admin, ApiError } from "~/lib/api";
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
  return [{ title: "Admins — FloraVoice Admin" }];
}

interface AdminFormState {
  email: string;
  username: string;
  password: string;
}

const emptyForm: AdminFormState = { email: "", username: "", password: "" };

function AdminFormFields({
  values,
  onChange,
  isEdit = false,
}: {
  values: AdminFormState;
  onChange: (next: AdminFormState) => void;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="off"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-username">Username</Label>
        <Input
          id="admin-username"
          type="text"
          autoComplete="off"
          value={values.username}
          onChange={(e) => onChange({ ...values, username: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">
          Password{isEdit && " (leave blank to keep current)"}
        </Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => onChange({ ...values, password: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminFormState>(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState<AdminFormState>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminsApi
      .list()
      .then(setAdmins)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load admins"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (editTarget) {
      setEditForm({ email: editTarget.email, username: editTarget.username, password: "" });
    }
  }, [editTarget]);

  async function handleCreate() {
    setCreateLoading(true);
    try {
      const created = await adminsApi.create(createForm);
      setAdmins((prev) => [...prev, created]);
      setCreateOpen(false);
      setCreateForm(emptyForm);
      toast.success("Admin created");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create admin");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const updated = await adminsApi.update(editTarget.id, {
        email: editForm.email,
        username: editForm.username,
        password: editForm.password || editTarget.id, // API requires password; keep existing not exposed
      });
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditTarget(null);
      toast.success("Admin updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update admin");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminsApi.delete(deleteTarget.id);
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Admin deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete admin");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Admin
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="text-sm text-muted-foreground">No admins found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-80">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{admin.id}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(admin)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(admin)}
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
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <AdminFormFields values={createForm} onChange={setCreateForm} />
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
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <AdminFormFields values={editForm} onChange={setEditForm} isEdit />
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
            <DialogTitle>Delete Admin</DialogTitle>
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
