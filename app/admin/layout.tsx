// app/admin/layout.tsx

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React, { Suspense } from "react";

export const dynamic = 'force-dynamic'; // Prevents prerendering

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
    <Suspense fallback={<div>Loading Admin Page...</div>}>
      {children}
    </Suspense>
    </ClerkProvider>
  );
};

export default AdminLayout;
