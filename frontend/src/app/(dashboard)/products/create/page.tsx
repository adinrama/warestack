"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import { CATEGORIES } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  sku: z.string().min(1, "SKU required"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Must be ≥ 0"),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  category: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 0, price: 0 },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await productsApi.create(data);
      toast.success("Product created successfully");
      router.push("/products");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <Link href="/products" className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700 mb-4 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h1 className="page-title">New Product</h1>
        <p className="page-subtitle">Add a product to your warehouse inventory</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Product Name *</label>
              <input {...register("name")} className="input" placeholder="e.g. Industrial Drill Bit Set" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">SKU *</label>
              <input
                {...register("sku")}
                className="input font-mono"
                placeholder="e.g. TOOL-001"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="label">Category</label>
              <select {...register("category")} className="input appearance-none">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">$</span>
                <input
                  {...register("price")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input pl-7"
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="label">Initial Quantity</label>
              <input
                {...register("quantity")}
                type="number"
                min="0"
                className="input"
                placeholder="0"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="input resize-none"
                placeholder="Optional product description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-ink-100">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Product
            </button>
            <Link href="/products" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
