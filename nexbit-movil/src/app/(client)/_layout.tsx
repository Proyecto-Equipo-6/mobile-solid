import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { useTheme } from '@/shared/hooks/use-theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color, size }: Readonly<{ name: IoniconsName; color: ColorValue; size: number }>) {
  return <Ionicons name={name} size={size} color={color} />;
}

function makeTabBarIcon(name: IoniconsName) {
  return function TabBarIconWrapper(props: { focused: boolean; color: ColorValue; size: number }) {
    return <TabBarIcon name={name} color={props.color} size={props.size} />;
  };
}

export default function ClientLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

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
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { fontWeight: '700', color: theme.text },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: makeTabBarIcon('home-outline'),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catálogo',
          tabBarIcon: makeTabBarIcon('grid-outline'),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: makeTabBarIcon('cart-outline'),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Mis pedidos',
          tabBarIcon: makeTabBarIcon('receipt-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: makeTabBarIcon('person-outline'),
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{ title: 'Producto', href: null, headerShown: true }}
      />
      <Tabs.Screen
        name="checkout"
        options={{ title: 'Checkout', href: null, headerShown: true }}
      />
    </Tabs>
  );
}