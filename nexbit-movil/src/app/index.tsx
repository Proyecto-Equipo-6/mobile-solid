import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';

export default function Index() {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Redirect href={ROLE_HOME[role]} />;
  }

  return <Redirect href="/login" />;
}