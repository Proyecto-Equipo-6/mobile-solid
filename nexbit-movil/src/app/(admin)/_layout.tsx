import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { DashColors } from '@/shared/constants/theme';

export default function AdminLayout() {
  const { role, isAuthenticated, isLoading, signOut } = useAuth();

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
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: DashColors.accent,
        tabBarInactiveTintColor: DashColors.textMuted,
        tabBarStyle: {
          backgroundColor: DashColors.fondo,
          borderTopColor: DashColors.border,
        },
        headerStyle: { backgroundColor: DashColors.fondo },
        headerTitleStyle: { fontWeight: '700', color: DashColors.text },
        sceneStyle: { backgroundColor: DashColors.bg },
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={24}
            color={DashColors.text}
            onPress={signOut}
            style={{ paddingRight: 16 }}
          />
        ),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}