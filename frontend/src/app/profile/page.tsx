import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/inputs/Input";
import Badge from "@/components/ui/Badge";

// This is a Server Component (no 'use client')
export default async function ProfilePage() {
  // 1. Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // 2. Fetch User Data from Backend
  // Note: We use the BACKEND_URL from env because this runs on the server
  const res = await fetch(`${process.env.BACKEND_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Always fetch fresh data
  });

  if (!res.ok) {
    // If token invalid, redirect to login
    redirect("/login");
  }

  const user = await res.json();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Badge variant={user.is_active ? "success" : "danger"}>
            {user.is_active ? "Active Account" : "Inactive"}
          </Badge>
        </div>

        <Card className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="First Name"
              defaultValue={user.first_name}
              readOnly
              className="bg-muted/30"
            />
            <Input
              label="Last Name"
              defaultValue={user.last_name}
              readOnly
              className="bg-muted/30"
            />
          </div>

          <Input
            label="Email Address"
            defaultValue={user.email}
            readOnly
            className="bg-muted/30"
            prefix={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            }
          />

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              User ID:{" "}
              <span className="font-mono text-foreground">{user.id}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
