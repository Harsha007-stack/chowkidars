"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Admin access required")
  return user
}

export async function createAdmin(formData: FormData) {
  await ensureAdmin()
  const fullName = String(formData.get("full_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!fullName || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." } as const
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." } as const
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { ok: false, error: "Server is missing Supabase service role key." } as const
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
    app_metadata: { guardtrac_provisioned: true },
  })

  if (error) {
    if (/already.*registered|exists/i.test(error.message)) {
      return { ok: false, error: "An account with this email already exists." } as const
    }
    return { ok: false, error: error.message } as const
  }

  revalidatePath("/admin/team")
  return { ok: true } as const
}

export async function createGuard(formData: FormData) {
  await ensureAdmin()
  const fullName = String(formData.get("full_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const phone = String(formData.get("phone") ?? "").trim()
  const siteId = String(formData.get("site_id") ?? "").trim()
  const shiftStart = String(formData.get("shift_start") ?? "").trim()
  const shiftEnd = String(formData.get("shift_end") ?? "").trim()

  if (!fullName || !email || !password || !shiftStart || !shiftEnd) {
    return { ok: false, error: "Name, email, password, and shift times are required." } as const
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." } as const
  }
  const validTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
  if (!validTime(shiftStart) || !validTime(shiftEnd)) {
    return { ok: false, error: "Enter valid duty start and end times." } as const
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { ok: false, error: "Server is missing Supabase service role key." } as const
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone: phone || null, role: "guard" },
    app_metadata: { guardtrac_provisioned: true },
  })

  if (error || !data?.user) {
    const message = error?.message || "Could not create guard account."
    if (/already.*registered|exists/i.test(message)) {
      return { ok: false, error: "An account with this email already exists." } as const
    }
    return { ok: false, error: message } as const
  }

  const { error: updateError } = await admin
    .from("guards")
    .update({
      phone: phone || null,
      site_id: siteId || null,
      shift_start: shiftStart,
      shift_end: shiftEnd,
    })
    .eq("id", data.user.id)

  if (updateError) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id)
    if (deleteError) {
      return {
        ok: false,
        error: `Guard account was created, but setup failed: ${updateError.message}. Cleanup also failed: ${deleteError.message}`,
      } as const
    }
    return { ok: false, error: `Could not finish setting up the guard: ${updateError.message}` } as const
  }

  revalidatePath("/admin/team")
  revalidatePath("/admin/guards")
  revalidatePath("/admin")
  return { ok: true } as const
}

export async function removeAdmin(userId: string) {
  const currentUser = await ensureAdmin()
  if (currentUser.id === userId) {
    return { ok: false, error: "You cannot remove your own admin access." } as const
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { ok: false, error: "Server is missing Supabase service role key." } as const
  }

  // Demote rather than hard-delete: preserves any history they created.
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message } as const

  revalidatePath("/admin/team")
  return { ok: true } as const
}
