import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SignIn } from "@clerk/nextjs";
import { Cross2Icon } from "@radix-ui/react-icons";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
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
            outline-none
            border-none
          "
          style={{
            outline: 'none',
            border: 'none',
          }}
        >
          <Dialog.Title className="sr-only">Sign In</Dialog.Title>
          <SignIn
            routing="hash"
            signUpUrl={undefined} 
          />
          <Dialog.Close className="absolute top-2 right-2 text-gray-300 hover:text-gray-100">
            <Cross2Icon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
