import { RegisterOwnerForm } from "../../../components/forms/register-owner-form";
import Link from "next/link";
import { Sparkles, Building2 } from "lucide-react";

export default function RegisterOwnerPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding / Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900 to-primary-900/40 z-0"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary-600/20 blur-3xl rounded-full z-0"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-500/20 blur-3xl rounded-full z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight">BCP</span>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-300 backdrop-blur-sm">
            <Building2 className="mr-2 h-4 w-4" />
            For Business Owners
          </div>
          <h1 className="text-5xl font-bold leading-tight">Join the next generation of business management.</h1>
          <p className="text-slate-400 text-lg">
            Create your owner account today and gain full access to the BCP dashboard, allowing you to invite staff and configure your enterprise settings.
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
            <p className="mt-2 text-slate-500">
              Get started by registering as an owner.
            </p>
          </div>
          
          <RegisterOwnerForm />
          
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
