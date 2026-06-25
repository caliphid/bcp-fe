"use client";

import { useAuthStore } from "../../store/auth-store";
import { useLangStore, Language } from "../../store/lang-store";
import { useTranslation } from "../../hooks/use-translation";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Bell, Globe } from "lucide-react";

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activePortal = useAuthStore((state) => state.activePortal);
  const setActivePortal = useAuthStore((state) => state.setActivePortal);
  const language = useLangStore((state) => state.language);
  const setLanguage = useLangStore((state) => state.setLanguage);
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handlePortalSwitch = (portal: "FINANCE" | "OMS") => {
    setActivePortal(portal);
    if (portal === "FINANCE") {
      router.push("/dashboard");
    } else {
      router.push("/dashboard/sales-orders");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Module Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => handlePortalSwitch("FINANCE")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activePortal === "FINANCE" || !activePortal
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("topbar.portals.finance")}
          </button>
          <button
            onClick={() => handlePortalSwitch("OMS")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activePortal === "OMS"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("topbar.portals.oms")}
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute 0 right-0 top-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          title={language === "id" ? "Switch to English" : "Ganti ke Indonesia"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {language === "id" ? "ID" : "EN"}
          </span>
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center space-x-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900">{user.name}</span>
            <span className="text-xs font-medium text-slate-500">{user.role}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title={t("topbar.logout")}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
