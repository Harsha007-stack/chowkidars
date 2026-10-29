import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brand } from "@/components/brand"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Account creation is restricted</CardTitle>
            <CardDescription>
              Account creation is managed by your agency administrator. Ask them to create your login credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/auth/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
