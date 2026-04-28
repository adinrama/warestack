"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Package2, ArrowRight, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
            <Package2 className="w-4 h-4 text-ink-900" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">WareStack</span>
        </div>

        <div>
          <div className="mb-10">
            <div className="font-mono text-amber-400 text-xs tracking-widest uppercase mb-4">
              Warehouse Management System
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Inventory<br />without<br />the chaos.
            </h1>
            <p className="mt-4 text-ink-300 text-sm leading-relaxed max-w-sm">
              Role-based access control, product isolation per team lead, and real-time stock management.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Role-Based", value: "Access Control" },
              { label: "Up to 5", value: "Staff per Lead" },
              { label: "Full", value: "Audit Trail" },
            ].map((stat) => (
              <div key={stat.label} className="border border-ink-700 rounded-lg p-4">
                <div className="text-amber-400 font-bold text-sm">{stat.label}</div>
                <div className="text-ink-300 text-xs mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-ink-600 text-xs font-mono">© 2024 WareStack v1.0</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-ink-900 rounded flex items-center justify-center">
            <Package2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-ink-900 text-lg">WareStack</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Sign in</h2>
            <p className="text-sm text-ink-400 mt-1">Access your warehouse dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@warehouse.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-200">
            <p className="text-xs text-ink-400 mb-3 font-mono">Demo accounts:</p>
            <div className="space-y-2">
              <div className="bg-white border border-ink-200 rounded-md p-3 text-xs font-mono">
                <span className="badge-lead mr-2">Lead</span>
                lead@warehouse.com / password123
              </div>
              <div className="bg-white border border-ink-200 rounded-md p-3 text-xs font-mono">
                <span className="badge-staff mr-2">Staff</span>
                staff1@warehouse.com / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
