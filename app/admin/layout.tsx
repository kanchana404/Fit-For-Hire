// app/admin/layout.tsx

"use client";

import React, { Suspense } from "react";

export const dynamic = 'force-dynamic'; // Prevents prerendering

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading Admin Page...</div>}>
      {children}
    </Suspense>
  );
};

export default AdminLayout;
