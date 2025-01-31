import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SignUp } from "@clerk/nextjs";
import { Cross2Icon } from "@radix-ui/react-icons";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        {/* Content */}
        <Dialog.Content
          className="
            fixed top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-gray-900 p-6 rounded-md shadow-lg
            w-full max-w-md
          "
        >
          <SignUp
            routing="hash"
            signInUrl={undefined} 
            appearance={{
              variables: {
                colorBackground: "#1a1a1a",
                colorText: "#fff",
                colorPrimary: "#9b59b6",
              },
              elements: {
                card: "bg-gray-900 text-white border-none",
                formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              }
            }}
          />
          <Dialog.Close className="absolute top-2 right-2 text-gray-300 hover:text-gray-100">
            <Cross2Icon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
