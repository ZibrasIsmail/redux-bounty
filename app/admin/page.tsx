"use client";

import AdminDashboard from '@/components/AdminDashboard';
import { Providers } from '../providers';

export default function AdminPage() {
  return (
    <Providers>
      <AdminDashboard />
    </Providers>
  )
}
