"use client"

import { useState } from "react"
import { Trash2, Ban, CheckCircle, ShieldCheck } from "lucide-react"
import { deleteUser, toggleBlockUser, toggleVerifyDriver } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface UserActionsProps {
  user: {
    id: string
    role: "client" | "driver"
    is_blocked: number
    is_verified?: number
  }
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const isBlocked = user.is_blocked === 1
  const isVerified = user.is_verified === 1

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this ${user.role}? This action cannot be undone.`)) return
    
    setLoading(true)
    const res = await deleteUser(user.id, user.role)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleToggleBlock = async () => {
    if (!confirm(`Are you sure you want to ${isBlocked ? "unblock" : "block"} this ${user.role}?`)) return
    
    setLoading(true)
    const res = await toggleBlockUser(user.id, user.role, isBlocked)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleToggleVerify = async () => {
    if (user.role !== "driver") return
    if (!confirm(`Are you sure you want to ${isVerified ? "unverify" : "verify"} this driver?`)) return
    
    setLoading(true)
    const res = await toggleVerifyDriver(user.id, isVerified)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggleBlock}
        disabled={loading}
        title={isBlocked ? "Unblock User" : "Block User"}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
          isBlocked ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        <Ban className="w-4 h-4" />
      </button>

      {user.role === "driver" && (
        <button 
          onClick={handleToggleVerify}
          disabled={loading}
          title={isVerified ? "Revoke Verification" : "Verify Driver"}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isVerified ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      )}

      <button 
        onClick={handleDelete}
        disabled={loading}
        title="Delete User"
        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
