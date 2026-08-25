import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { DashColors } from '@/shared/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function HeaderSignOutButton({ onPress }: Readonly<{ onPress: () => void }>) {
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

function TabBarIcon({ name, color, size }: Readonly<{ name: IoniconsName; color: string; size: number }>) {
  return <Ionicons name={name} size={size} color={color} />;
}

function makeTabBarIcon(name: IoniconsName) {
  return function TabBarIconWrapper(props: Readonly<{ color: string; size: number }>) {
    return <TabBarIcon name={name} {...props} />;
  };
}

export default function DriverLayout() {
  const { role, isAuthenticated, isLoading, signOut } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (role !== 'driver') {
    return <Redirect href={role ? ROLE_HOME[role] : '/login'} />;
  }

  const renderHeaderRight = () => <HeaderSignOutButton onPress={signOut} />;

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
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Entregas',
          tabBarIcon: makeTabBarIcon('bicycle-outline'),
        }}
      />
    </Tabs>
  );
}
