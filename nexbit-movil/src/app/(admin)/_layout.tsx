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

function makeTabBarIcon(name: IoniconsName) {
  return function TabBarIconWrapper(props: { color: string; size: number }) {
    return <TabBarIcon name={name} {...props} />;
  };
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

function HeaderRight({ signOut }: { signOut: () => void }) {
  return <HeaderSignOutButton onPress={signOut} />;
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

  const renderHeaderRight = () => <HeaderRight signOut={signOut} />;

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
        headerRight: renderHeaderRight,
      }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: makeTabBarIcon('stats-chart-outline') }} />
      <Tabs.Screen name="products" options={{ title: 'Productos', tabBarIcon: makeTabBarIcon('cube-outline') }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: makeTabBarIcon('list-outline') }} />
      <Tabs.Screen name="users" options={{ title: 'Usuarios', tabBarIcon: makeTabBarIcon('people-outline') }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorías', tabBarIcon: makeTabBarIcon('pricetags-outline') }} />
      <Tabs.Screen name="suppliers" options={{ title: 'Proveedores', tabBarIcon: makeTabBarIcon('business-outline') }} />
      <Tabs.Screen name="drivers" options={{ title: 'Repartidores', tabBarIcon: makeTabBarIcon('bicycle-outline') }} />
      <Tabs.Screen name="roles" options={{ title: 'Roles', tabBarIcon: makeTabBarIcon('key-outline') }} />
    </Tabs>
  );
}