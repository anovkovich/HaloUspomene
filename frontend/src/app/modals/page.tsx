"use client";

import { useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { ConfirmationModal } from "@/components/ui";
import Link from "next/link";
import { Header } from "@/components/layout";

export default function Home() {
  // ---------------------------------------------------------
  // 1. STATE FOR DANGER MODAL (Delete)
  // ---------------------------------------------------------
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API
    console.log("Item deleted!");
    setIsDeleting(false);
    setIsDeleteOpen(false);
  };

  // ---------------------------------------------------------
  // 2. STATE FOR PRIMARY MODAL (Publish/Save)
  // ---------------------------------------------------------
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API
    console.log("Post published!");
    setIsPublishing(false);
    setIsPublishOpen(false);
  };

  return (
    <div>
      <Header />
      <main className="min-h-screen p-12 flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">
          Confirmation Modal Examples
        </h1>

        <div className="flex gap-4">
          {/* Trigger for Danger Modal */}
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Account
          </Button>

          {/* Trigger for Primary Modal */}
          <Button variant="primary" onClick={() => setIsPublishOpen(true)}>
            Publish Post
          </Button>
        </div>

        {/* --- DANGER MODAL COMPONENT --- */}
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete Account"
          description="Are you sure you want to permanently delete your account? This action cannot be undone."
          variant="danger"
          confirmText="Yes, delete it"
          isLoading={isDeleting}
        />

        {/* --- PRIMARY MODAL COMPONENT --- */}
        <ConfirmationModal
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          onConfirm={handlePublish}
          title="Publish Post"
          description="This will make your content visible to the public. You can archive it later if needed."
          variant="primary" // <--- Shows blue button
          confirmText="Publish Now"
          cancelText="Keep Draft"
          isLoading={isPublishing}
        />
      </main>
    </div>
  );
}
