"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { appSettingsApi } from "../../../../features/app-settings/api";
import { AppSettings } from "../../../../types/app-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { Settings2 } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { UpdateAppSettingsForm } from "../../../../components/forms/update-app-settings-form";

export default function AppSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchSettings = async () => {
      try {
        const res = await appSettingsApi.getSettings();
        setSettings(res.data);
      } catch (err) {
        setError("Failed to fetch app settings");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  if (!user || loading) return <div className="animate-pulse h-64 w-full rounded-2xl bg-slate-100"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">App Settings</h2>
          <p className="mt-1 text-sm text-slate-500">Global configurations for your system.</p>
        </div>
        {user.role === "OWNER" && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditModalOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4 text-slate-500" /> Modify Settings
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {settings && (
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader className="border-b border-slate-100/80 bg-slate-50/50">
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Changes here affect all users in the organization.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Active Year</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 items-center justify-center rounded bg-indigo-100 px-2 text-xs font-bold text-indigo-700">FY</div>
                  <p className="text-lg font-bold text-slate-900">{settings.activeYear}</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Default Currency</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-slate-900">{settings.currency}</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Timezone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{settings.timezone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {settings && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modify App Settings" className="max-w-2xl">
          <UpdateAppSettingsForm 
            initialData={settings}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchSettings();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
