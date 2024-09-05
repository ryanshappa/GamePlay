// src/utils/uploadthing.ts

import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "~/api/uploadthing/core";

// This will generate client-side hooks for uploading files
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
