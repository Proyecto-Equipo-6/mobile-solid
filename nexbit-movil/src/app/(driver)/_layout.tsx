import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';

export default function DriverLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (role !== 'driver') {
    return <Redirect href={role ? ROLE_HOME[role] : '/login'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="deliveries" options={{ title: 'Entregas' }} />
    </Stack>
  );
}