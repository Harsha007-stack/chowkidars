"use server"

export type SignUpResult = { ok: true; role: "guard" | "admin" } | { ok: false; error: string }
export type PublicSite = { id: string; site_name: string; address: string | null }

/** Retained for old clients; account creation is now restricted to admin-managed provisioning. */
export async function signUpUser(_input: {
  email: string
  password: string
  fullName: string
  phone?: string
  siteId?: string
  shiftStart?: string
  shiftEnd?: string
}): Promise<SignUpResult> {
  return {
    ok: false,
    error: "Self-service sign-up is disabled. Ask your administrator to create your account.",
  }
}
