"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { businessProfileApi } from "../../../../features/business-profile/api";
import { BusinessProfile } from "../../../../types/business-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { Pencil } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { UpdateBusinessProfileForm } from "../../../../components/forms/update-business-profile-form";

export default function BusinessProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = async () => {
      try {
        const res = await businessProfileApi.getProfile();
        setProfile(res.data);
      } catch (err) {
        setError("Failed to fetch business profile");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  if (!user || loading) return <div className="animate-pulse h-64 w-full rounded-2xl bg-slate-100"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Business Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your company's core information.</p>
        </div>
        {["OWNER", "ADMIN_FINANCE"].includes(user.role) && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="mr-2 h-4 w-4 text-slate-500" /> Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {profile && (
        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="h-32 bg-gradient-to-r from-emerald-500/80 to-teal-500/80"></div>
          <CardHeader className="relative pb-0">
            <div className="absolute -top-12 left-6 h-24 w-24 rounded-2xl border-4 border-white bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-bold shadow-sm overflow-hidden">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                (profile.businessName || "B").charAt(0).toUpperCase()
              )}
            </div>
            <div className="pt-14">
              <CardTitle className="text-2xl">{profile.businessName}</CardTitle>
              <CardDescription>Primary Enterprise Account</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Legal Name</p>
                <p className="font-medium text-slate-900">{profile.legalName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</p>
                <p className="font-medium text-slate-900">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</p>
                <p className="font-medium text-slate-900">{profile.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Updated</p>
                <p className="font-medium text-slate-900">{new Date(profile.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Address</p>
                <p className="font-medium text-slate-900 max-w-xl leading-relaxed">{profile.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Business Profile" className="max-w-2xl">
          <UpdateBusinessProfileForm 
            initialData={profile}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchProfile();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
