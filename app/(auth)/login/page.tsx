import { LoginForm } from "../../../components/forms/login-form";
import { Briefcase } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding / Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-900/40 via-slate-900 to-slate-900 z-0"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 blur-3xl rounded-full z-0"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-500/20 blur-3xl rounded-full z-0"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight">BCP</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight">
            Control your business with precision.
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your users, optimize operations, and track everything from
            one unified platform built for modern enterprises.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} BCP Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500">
              Please enter your details to sign in.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
