import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { DashColors } from '@/shared/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function HeaderSignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <Ionicons
      name="log-out-outline"
      size={24}
      color={DashColors.text}
      onPress={onPress}
      style={{ paddingRight: 16 }}
    />
  );
}

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
        headerRight: () => <HeaderSignOutButton onPress={signOut} />,
      }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: (props) => <TabBarIcon name="stats-chart-outline" {...props} /> }} />
      <Tabs.Screen name="products" options={{ title: 'Productos', tabBarIcon: (props) => <TabBarIcon name="cube-outline" {...props} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: (props) => <TabBarIcon name="list-outline" {...props} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Usuarios', tabBarIcon: (props) => <TabBarIcon name="people-outline" {...props} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorías', tabBarIcon: (props) => <TabBarIcon name="pricetags-outline" {...props} /> }} />
      <Tabs.Screen name="suppliers" options={{ title: 'Proveedores', tabBarIcon: (props) => <TabBarIcon name="business-outline" {...props} /> }} />
      <Tabs.Screen name="drivers" options={{ title: 'Repartidores', tabBarIcon: (props) => <TabBarIcon name="bicycle-outline" {...props} /> }} />
      <Tabs.Screen name="roles" options={{ title: 'Roles', tabBarIcon: (props) => <TabBarIcon name="key-outline" {...props} /> }} />
    </Tabs>
  );
}