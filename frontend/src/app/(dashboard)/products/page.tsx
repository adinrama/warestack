"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package, Plus, Search, Pencil, Trash2,
  ChevronLeft, ChevronRight, Filter, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { formatCurrency, formatDate, CATEGORIES } from "@/lib/utils";

export default function ProductsPage() {
  const { data: session } = useSession();
  const isLead = session?.user?.role === "STAFF_LEAD";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({
        page,
        limit: 15,
        ...(search && { search }),
        ...(category && { category }),
      });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetch(); }, [fetch]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, category]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await productsApi.delete(id);
      toast.success("Product deleted");
      fetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} items in inventory</p>
        </div>
        {isLead && (
          <Link href="/products/create" className="btn-primary">
            <Plus className="w-4 h-4" /> New Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, description..."
            className="input pl-9"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input pl-9 pr-8 appearance-none min-w-[160px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">
                  Updated
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-ink-100 rounded" />
                        <div className="space-y-1">
                          <div className="h-3.5 bg-ink-100 rounded w-32" />
                          <div className="h-3 bg-ink-50 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="h-3 bg-ink-50 rounded w-16" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-3 bg-ink-50 rounded w-16 ml-auto" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-3 bg-ink-50 rounded w-12 ml-auto" />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-right">
                      <div className="h-3 bg-ink-50 rounded w-20 ml-auto" />
                    </td>
                    <td className="px-5 py-4" />
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Package className="w-10 h-10 text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-400 text-sm">No products found</p>
                    {isLead && !search && !category && (
                      <Link href="/products/create" className="btn-primary mt-4">
                        <Plus className="w-4 h-4" /> Add your first product
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-ink-100 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                          <Package className="w-4 h-4 text-ink-500 group-hover:text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${product.id}`}
                            className="font-medium text-ink-900 hover:text-amber-600 truncate block transition-colors"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs text-ink-400 font-mono">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {product.category ? (
                        <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded font-medium">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-ink-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono text-sm font-medium ${
                        product.quantity === 0
                          ? "text-red-600"
                          : product.quantity < 10
                          ? "text-amber-600"
                          : "text-green-700"
                      }`}>
                        {product.quantity < 10 && product.quantity > 0 && (
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                        )}
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-right text-xs text-ink-400">
                      {formatDate(product.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        {isLead && (
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between">
            <p className="text-xs text-ink-400">
              Page {page} of {pages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary p-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
