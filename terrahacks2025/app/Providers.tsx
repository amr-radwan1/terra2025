// app/Providers.tsx
'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth'; // no change needed if tsconfig handles .tsx

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
