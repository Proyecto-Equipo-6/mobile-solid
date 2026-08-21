import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { CartProvider } from '@/features/cart/hooks/useCart';
import { AnimatedSplashOverlay } from '@/shared/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(client)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(driver)" />
          </Stack>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}