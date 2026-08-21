import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { DashColors } from '@/shared/constants/theme';

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
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: DashColors.fondo },
        headerTitleStyle: { fontWeight: '700', color: DashColors.text },
        contentStyle: { backgroundColor: DashColors.bg },
      }}>
      <Stack.Screen name="deliveries" options={{ title: 'Entregas' }} />
    </Stack>
  );
}