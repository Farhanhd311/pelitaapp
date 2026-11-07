// Layout semua halaman admin (PANDUAN 8.4-8.7). Hak akses dicek lagi di setiap API route (lib/db/rbac.ts).

import type { ReactNode } from "react";
import { KerangkaAdmin } from "@/components/admin/KerangkaAdmin";

export default function Layout({ children }: { children: ReactNode }) {
  return <KerangkaAdmin>{children}</KerangkaAdmin>;
}
