import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';

export default function AdminLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (role !== 'admin') {
    return <Redirect href={role ? ROLE_HOME[role] : '/login'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="products" options={{ title: 'Productos' }} />
      <Stack.Screen name="orders" options={{ title: 'Pedidos' }} />
    </Stack>
  );
}