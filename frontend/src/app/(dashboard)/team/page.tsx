"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Users, UserPlus, UserMinus, Mail, Lock,
  Loader2, User, ShieldAlert, Eye, EyeOff,
} from "lucide-react";
import { teamApi } from "@/lib/api";
import { User as UserType } from "@/types";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isLead = session?.user?.role === "STAFF_LEAD";

  const [members, setMembers] = useState<UserType[]>([]);
  const [maxAllowed, setMaxAllowed] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Redirect staff away from this page
  useEffect(() => {
    if (session && !isLead) router.push("/dashboard");
  }, [session, isLead]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await teamApi.getMembers();
      setMembers(res.data.members);
      setMaxAllowed(res.data.maxAllowed);
    } catch {
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeam(); }, []);

  const onAddStaff = async (data: FormData) => {
    try {
      const res = await teamApi.assign(data);
      setMembers((prev) => [...prev, res.data]);
      toast.success(`${data.name} added to your team`);
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRemove = async (staffId: string, name: string) => {
    if (!confirm(`Remove ${name} from your team? They will lose access to products.`)) return;
    setRemovingId(staffId);
    try {
      await teamApi.remove(staffId);
      setMembers((prev) => prev.filter((m) => m.id !== staffId));
      toast.success(`${name} removed from team`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRemovingId(null);
    }
  };

  const isFull = members.length >= maxAllowed;

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">
            {members.length}/{maxAllowed} staff members
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={isFull}
            className="btn-primary"
            title={isFull ? "Team is full (max 5)" : ""}
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Capacity bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-ink-500" />
            <span className="text-sm font-medium text-ink-700">Team Capacity</span>
          </div>
          <span className={`text-sm font-mono font-bold ${isFull ? "text-amber-600" : "text-green-700"}`}>
            {members.length}/{maxAllowed}
          </span>
        </div>
        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? "bg-amber-400" : "bg-green-500"
            }`}
            style={{ width: `${(members.length / maxAllowed) * 100}%` }}
          />
        </div>
        {isFull && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Team is full. Remove a member to add new staff.
          </p>
        )}
      </div>

      {/* Add staff form */}
      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-l-amber-400">
          <h2 className="font-semibold text-ink-900 text-sm mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-500" />
            New Staff Member
          </h2>
          <form onSubmit={handleSubmit(onAddStaff)} className="space-y-4 max-w-lg">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input {...register("name")} className="input pl-9" placeholder="Jane Smith" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input {...register("email")} type="email" className="input pl-9" placeholder="jane@warehouse.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  className="input pl-9 pr-9"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add Member
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 bg-ink-50">
          <h2 className="font-semibold text-ink-900 text-sm">Staff Members</h2>
        </div>

        {loading ? (
          <div className="divide-y divide-ink-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-ink-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-ink-100 rounded w-32" />
                  <div className="h-3 bg-ink-50 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users className="w-12 h-12 text-ink-200 mx-auto mb-3" />
            <p className="text-ink-500 text-sm font-medium">No staff members yet</p>
            <p className="text-ink-400 text-xs mt-1">Add up to {maxAllowed} staff members to your team</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              <UserPlus className="w-4 h-4" /> Add First Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {members.map((member, idx) => (
              <div key={member.id} className="px-5 py-4 flex items-center gap-4 hover:bg-ink-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {member.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900 text-sm">{member.name}</p>
                    <span className="badge-staff">Staff #{idx + 1}</span>
                  </div>
                  <p className="text-xs text-ink-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {member.email}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-ink-400">Joined</p>
                  <p className="text-xs font-medium text-ink-600">
                    {formatDate(member.createdAt!)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(member.id, member.name)}
                  disabled={removingId === member.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                >
                  {removingId === member.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700 font-medium mb-1">About Staff Access</p>
        <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
          <li>Staff members can view and update stock quantities for all your products</li>
          <li>Staff cannot create, delete, or change product prices/details</li>
          <li>Removing a staff member immediately revokes their access</li>
          <li>Maximum {maxAllowed} staff members per Staff Lead</li>
        </ul>
      </div>
    </div>
  );
}
