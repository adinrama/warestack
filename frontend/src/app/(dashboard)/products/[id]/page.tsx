"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Save, Trash2, Package,
  AlertCircle, Calendar, Tag,
} from "lucide-react";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { formatCurrency, formatDate, CATEGORIES } from "@/lib/utils";

const leadSchema = z.object({
  name: z.string().min(1, "Required"),
  sku: z.string().min(1, "Required"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0),
  category: z.string().optional(),
});

const staffSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Must be ≥ 0"),
});

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const isLead = session?.user?.role === "STAFF_LEAD";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const schema = isLead ? leadSchema : staffSchema;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await productsApi.getOne(id);
        setProduct(res.data);
        reset(res.data);
      } catch {
        toast.error("Product not found");
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (data: unknown) => {
    try {
      const res = await productsApi.update(id, data);
      setProduct(res.data);
      reset(res.data);
      toast.success("Product updated");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await productsApi.delete(id);
      toast.success("Product deleted");
      router.push("/products");
    } catch (err) {
      toast.error((err as Error).message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-ink-100 rounded w-48 mb-8 animate-pulse" />
        <div className="max-w-2xl card p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-ink-100 rounded w-20" />
              <div className="h-9 bg-ink-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <div className="page-header">
        <Link href="/products" className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700 mb-4 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded">
                {product.sku}
              </span>
              {product.category && (
                <span className="text-xs text-ink-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {product.category}
                </span>
              )}
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Updated {formatDate(product.updatedAt)}
              </span>
            </div>
          </div>
          {isLead && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger text-xs"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-xs text-ink-500 mb-1">Current Price</p>
          <p className="text-xl font-bold text-ink-900">{formatCurrency(product.price)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-ink-500 mb-1">Stock</p>
          <p className={`text-xl font-bold font-mono ${product.quantity < 10 ? "text-amber-600" : "text-green-700"}`}>
            {product.quantity < 10 && <AlertCircle className="w-4 h-4 inline mr-1" />}
            {product.quantity}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-ink-500 mb-1">Total Value</p>
          <p className="text-xl font-bold text-ink-900">
            {formatCurrency(Number(product.price) * product.quantity)}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Package className="w-4 h-4 text-ink-400" />
            <h2 className="font-semibold text-ink-900 text-sm">
              {isLead ? "Edit Product" : "Update Stock"}
            </h2>
            {!isLead && (
              <span className="text-xs text-ink-400 ml-auto">Staff can only update quantity</span>
            )}
          </div>

          {isLead ? (
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="label">Product Name</label>
                <input {...register("name")} className="input" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
              </div>
              <div>
                <label className="label">SKU</label>
                <input {...register("sku")} className="input font-mono" />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{String(errors.sku.message)}</p>}
              </div>
              <div>
                <label className="label">Category</label>
                <select {...register("category")} className="input appearance-none">
                  <option value="">No category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">$</span>
                  <input {...register("price")} type="number" step="0.01" min="0" className="input pl-7" />
                </div>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input {...register("quantity")} type="number" min="0" className="input" />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{String(errors.quantity.message)}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea {...register("description")} rows={3} className="input resize-none" />
              </div>
            </div>
          ) : (
            <div className="max-w-xs">
              <label className="label">Quantity in Stock</label>
              <input {...register("quantity")} type="number" min="0" className="input text-lg font-mono" />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{String(errors.quantity.message)}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-ink-100">
            <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <Link href="/products" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
