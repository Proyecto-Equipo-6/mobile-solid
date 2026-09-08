import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { ROLE_HOME } from '@/features/auth/types/auth.types';
import { useTheme } from '@/shared/hooks/use-theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color, size }: Readonly<{ name: IoniconsName; color: ColorValue; size: number }>) {
  return <Ionicons name={name} size={size} color={color} />;
}

function CartTabIcon({ color, size, count }: Readonly<{ color: ColorValue; size: number; count: number }>) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name="cart-outline" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function makeTabBarIcon(name: IoniconsName, badgeCount?: number) {
  return function TabBarIconWrapper(props: { focused: boolean; color: ColorValue; size: number }) {
    if (name === 'cart-outline' && badgeCount !== undefined) {
      return <CartTabIcon color={props.color} size={props.size} count={badgeCount} />;
    }
    return <TabBarIcon name={name} color={props.color} size={props.size} />;
  };
}

export default function ClientLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const { count } = useCart();
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
          tabBarIcon: makeTabBarIcon('cart-outline', count),
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

const styles = StyleSheet.create({
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});