import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';

export default function ClientLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (role !== 'client') {
    return <Redirect href={role ? ROLE_HOME[role] : '/login'} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catálogo' }} />
      <Tabs.Screen name="cart" options={{ title: 'Carrito' }} />
    </Tabs>
  );
}