"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeClient from '../components/HomeClient';
import { getLastRoute } from '@/lib/routePersistence';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const lastRoute = getLastRoute();
    if (lastRoute && lastRoute !== '/') {
      router.push(lastRoute);
    }
  }, [router]);

  return <HomeClient />;
}
