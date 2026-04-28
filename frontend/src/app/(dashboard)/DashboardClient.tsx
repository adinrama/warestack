"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import {
  Package, Users, TrendingUp, AlertCircle,
  ArrowRight, Plus, RefreshCw,
} from "lucide-react";
import { productsApi, teamApi } from "@/lib/api";
import { Product, TeamResponse } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardClientProps {
  session: Session | null;
}

export function DashboardClient({ session }: DashboardClientProps) {
  const isLead = session?.user?.role === "STAFF_LEAD";
  const [products, setProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await productsApi.getAll({ limit: 5 });
      setProducts(prodRes.data.products);

      if (isLead) {
        const teamRes = await teamApi.getMembers();
        setTeam(teamRes.data);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity < 10).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">
            Good morning, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s what&apos;s happening in your warehouse today.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary text-xs gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Products",
            value: products.length,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Stock",
            value: totalStock.toLocaleString(),
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Inventory Value",
            value: formatCurrency(totalValue),
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
            small: true,
          },
          {
            label: "Low Stock",
            value: lowStock,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            alert: lowStock > 0,
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-ink-500 font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <div className={`w-8 h-8 ${stat.bg} rounded-md flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`font-bold text-ink-900 ${stat.small ? "text-lg" : "text-2xl"}`}>
              {loading ? (
                <span className="inline-block w-12 h-6 bg-ink-100 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent products */}
        <div className={`card ${isLead ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900 text-sm">Recent Products</h2>
            <Link href="/products" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-ink-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-ink-100 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-ink-100 rounded w-1/2" />
                    <div className="h-3 bg-ink-50 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Package className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-400">No products yet</p>
                {isLead && (
                  <Link href="/products/create" className="btn-primary mt-4 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </Link>
                )}
              </div>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-ink-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-ink-100 rounded flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-ink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-ink-400 font-mono">{product.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {formatCurrency(product.price)}
                    </p>
                    <p className={`text-xs font-mono ${product.quantity < 10 ? "text-red-500" : "text-ink-400"}`}>
                      {product.quantity} units
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Team panel — Lead only */}
        {isLead && (
          <div className="card">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-semibold text-ink-900 text-sm">Team</h2>
              <Link href="/team" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 py-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ink-100 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-ink-100 rounded w-2/3" />
                        <div className="h-2.5 bg-ink-50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-ink-500">
                      {team?.count ?? 0}/{team?.maxAllowed ?? 5} members
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: team?.maxAllowed ?? 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-5 h-1.5 rounded-full ${
                            i < (team?.count ?? 0) ? "bg-amber-400" : "bg-ink-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {(team?.members ?? []).length === 0 ? (
                    <div className="text-center py-4">
                      <Users className="w-7 h-7 text-ink-300 mx-auto mb-2" />
                      <p className="text-xs text-ink-400">No team members</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {team?.members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-ink-600">
                              {m.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink-900 truncate">{m.name}</p>
                            <p className="text-xs text-ink-400 truncate">{m.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/team" className="btn-secondary w-full mt-4 text-xs justify-center">
                    <Plus className="w-3.5 h-3.5" /> Add Staff
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
