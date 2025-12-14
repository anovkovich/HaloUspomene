"use client";

import { Header } from "@/components/layout";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  DateInput,
  IconButton,
  Input,
  RadioGroup,
  Select,
  TimeInput,
} from "@/components/ui";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [radioVal, setRadioVal] = useState("option1");

  return (
    <div>
      <Header />

      <main className="min-h-screen p-12 space-y-12 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Design System</h1>
          <p className="text-muted-foreground mt-2">
            Atomic components using global theme variables.
          </p>
        </div>

        {/* 1. ALERTS & FEEDBACK (New) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Feedback</h2>
          <div className="grid gap-4">
            <Alert
              title="Payment Successful"
              description="Your transaction has been completed. A receipt has been sent to your email."
              variant="success"
            />
            <Alert
              title="Session Expired"
              description="Please log in again to continue using the dashboard."
              variant="warning"
            />
            <Alert
              title="Critical Error"
              description="Failed to connect to database. Please contact support."
              variant="danger"
            />
            <Alert title="New Update Available" variant="primary" />
          </div>
        </section>

        {/* 2. BADGES (New) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Status Indicators
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Order #1024:</span>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Order #1025:</span>
              <Badge variant="warning">Processing</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">System:</span>
              <Badge variant="danger">Offline</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Role:</span>
              <Badge variant="primary">Admin</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tag:</span>
              <Badge variant="neutral">Design</Badge>
            </div>
          </div>
        </section>

        {/* 3. CARD & FORMS (Updated) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Cards & Forms</h2>

          {/* Using the CARD component here instead of a plain div */}
          <Card className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Account Settings</h3>
              <p className="text-sm text-gray-500">
                Manage your preferences and notifications.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
              </div>
              <Input label="Email Address" placeholder="john@example.com" />
              <Input label="Net worth" prefix="$" postfix="USD" />

              <div className="grid grid-cols-2 gap-4">
                <DateInput label="Start Date" placeholder="Select date" />

                <TimeInput label="Meeting Time" />
              </div>

              <Select
                label="Subscription Plan"
                options={[
                  { label: "Free Tier", value: "free" },
                  { label: "Pro (Monthly)", value: "pro_monthly" },
                  { label: "Pro (Yearly)", value: "pro_yearly" },
                ]}
              />
            </div>

            <div className="border border-border rounded-lg p-4">
              <RadioGroup
                label="Email Notifications"
                name="notify"
                selected={radioVal}
                onChange={setRadioVal}
                options={[
                  { label: "Everything", value: "email" },
                  { label: "Same as email", value: "push" },
                  { label: "No push notifications", value: "none" },
                ]}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Checkbox label="Subscribe to newsletter" defaultChecked />
              <div className="flex gap-3">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. BUTTONS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Actions</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger" rounded>
              Delete
            </Button>
            <div className="h-8 w-px bg-gray-300 mx-2"></div> {/* Separator */}
            <IconButton variant="secondary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
            <IconButton variant="ghost" rounded>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </IconButton>
          </div>
        </section>
      </main>
    </div>
  );
}
