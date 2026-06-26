"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "../../../../store/auth-store";
import { usersApi } from "../../../../features/users/api";
import { User } from "../../../../types/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { CreateUserForm } from "../../../../components/forms/create-user-form";
import { UpdateUserForm } from "../../../../components/forms/update-user-form";

export default function UsersPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(t("pages.users.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !["OWNER", "ADMIN_FINANCE"].includes(user.role)) {
      router.push("/dashboard");
      return;
    }
    if (user) fetchUsers();
  }, [user, router]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      if (currentStatus === "ACTIVE") {
        await usersApi.deactivateUser(userId);
      } else {
        await usersApi.activateUser(userId);
      }
      fetchUsers(); // Refresh
    } catch (err) {
      setError(t("common.messages.errorOccurred"));
    }
  };

  if (!user || loading) return <div className="animate-pulse h-full w-full rounded-2xl bg-slate-100"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.users.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.users.subtitle")}</p>
        </div>
        {user.role === "OWNER" && (
          <Button className="w-full sm:w-auto shadow-primary-500/30 shadow-md" onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.users.addUser")}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="border-b border-slate-100/80 bg-slate-50/50">
          <CardTitle>{t("pages.users.teamDirectory")}</CardTitle>
          <CardDescription>{t("pages.users.teamDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t("common.labels.name")}</th>
                  <th className="px-6 py-4">{t("common.labels.email")}</th>
                  <th className="px-6 py-4">{t("common.labels.role")}</th>
                  <th className="px-6 py-4">{t("common.labels.status")}</th>
                  <th className="px-6 py-4 text-right">{t("common.labels.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800' : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'}`} onClick={() => user.role === 'OWNER' && handleToggleStatus(u.id, u.status)}>
                        {u.status === 'ACTIVE' ? (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        ) : (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        )}
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role === "OWNER" && (
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-base font-medium text-slate-900">{t("pages.users.noUsersFound")}</p>
                        <p className="text-sm">{t("pages.users.emptyStateDesc")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t("pages.users.createUser")} className="max-w-2xl">
        <CreateUserForm 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchUsers();
          }} 
          onCancel={() => setIsCreateModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={t("pages.users.editUser")} className="max-w-2xl">
        {editingUser && (
          <UpdateUserForm 
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              fetchUsers();
            }} 
            onCancel={() => setEditingUser(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
