"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { createGuard } from "@/app/admin/team/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SiteOption = { id: string; site_name: string }

export function CreateGuardForm({ sites }: { sites: SiteOption[] }) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    const form = event.currentTarget
    const formData = new FormData(form)

    start(async () => {
      const result = await createGuard(formData)
      if (result.ok) {
        setMessage({ kind: "ok", text: "Guard account created. They can now sign in with these credentials." })
        form.reset()
      } else {
        setMessage({ kind: "err", text: result.error })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="guard-name">Full name</Label>
        <Input id="guard-name" name="full_name" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guard-email">Email</Label>
        <Input id="guard-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guard-phone">Phone</Label>
        <Input id="guard-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guard-site">Assigned site</Label>
        <select
          id="guard-site"
          name="site_id"
          defaultValue=""
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="">No site yet</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.site_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guard-shift-start">Duty start</Label>
        <Input id="guard-shift-start" name="shift_start" type="time" defaultValue="09:00" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guard-shift-end">Duty end</Label>
        <Input id="guard-shift-end" name="shift_end" type="time" defaultValue="17:00" required />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor="guard-password">Temporary password</Label>
        <Input
          id="guard-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="text-xs text-muted-foreground">Share the email and password with the guard so they can sign in.</p>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create guard"}
        </Button>
        {message && (
          <p className={message.kind === "ok" ? "text-sm text-primary" : "text-sm text-destructive"} role="alert">
            {message.text}
          </p>
        )}
      </div>
    </form>
  )
}
