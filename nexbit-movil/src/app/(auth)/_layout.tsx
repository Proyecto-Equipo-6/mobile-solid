import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';

export default function AuthLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Redirect href={ROLE_HOME[role]} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}