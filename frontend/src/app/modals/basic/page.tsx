"use client";

import { useState } from "react";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import { BasicModal } from "@/components/ui";
import { Header } from "@/components/layout";

export default function Home() {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Define the footer buttons separately to keep the main return clean
  const editModalFooter = (
    <>
      <Button variant="outline" onClick={() => setIsEditOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={() => setIsEditOpen(false)}>
        Save Changes
      </Button>
    </>
  );

  return (
    <div>
      <Header />

      <main className="min-h-screen p-12 flex flex-col items-center justify-center">
        {/* Trigger */}
        <Button onClick={() => setIsEditOpen(true)}>Edit Profile</Button>

        {/* THE GENERIC MODAL */}
        <BasicModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Profile"
          footer={editModalFooter} // Pass the buttons here
          size="lg" // Try 'sm', 'md', 'lg', 'xl'
        >
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Make changes to your profile here. Click save when you are done.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Jane" />
              <Input label="Last Name" placeholder="Doe" />
            </div>

            <Input label="Username" placeholder="@jane.doe" />

            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
              <strong>Note:</strong> Changing your username will log you out.
            </div>
          </div>
        </BasicModal>
      </main>
    </div>
  );
}
