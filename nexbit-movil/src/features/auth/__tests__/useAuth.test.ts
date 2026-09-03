import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import * as authService from '@/features/auth/services/auth.service';
import { initializeAuthToken, getAuthToken } from '@/shared/api/client';

jest.mock('@/features/auth/services/auth.service');
jest.mock('@/shared/api/client', () => ({
  initializeAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

const mockedAuthService = jest.mocked(authService);
const mockedInitializeAuthToken = jest.mocked(initializeAuthToken);
const mockedGetAuthToken = jest.mocked(getAuthToken);

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAuthToken.mockReturnValue(null);
  mockedInitializeAuthToken.mockResolvedValue(undefined);
});

describe('useAuth hook', () => {
  it('inicia sin usuario y isLoading se resuelve', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signIn llama authService.login y actualiza el usuario', async () => {
    mockedAuthService.login.mockResolvedValue({
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '3001234567',
      role: 'client',
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('juan@test.com', '1234');
    });

    expect(result.current.user?.name).toBe('Juan Pérez');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('signOut limpia el usuario', async () => {
    mockedAuthService.login.mockResolvedValue({
      id: '1',
      name: 'Juan',
      email: 'juan@test.com',
      role: 'client',
    });
    mockedAuthService.logout.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('juan@test.com', '1234');
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('register llama authService.register', async () => {
    mockedAuthService.register.mockResolvedValue({
      id: '2',
      name: 'Ana',
      email: 'ana@test.com',
      role: 'client',
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        nombre_apellido: 'Ana',
        tipo_documento: 'CC',
        numero_documento: '123456',
        email: 'ana@test.com',
        password: '1234',
        telefono: '300',
        direccion: 'Calle 10',
      });
    });

    expect(mockedAuthService.register).toHaveBeenCalled();
  });

  it('register exitoso llama login automáticamente', async () => {
    mockedAuthService.register.mockResolvedValue({
      id: '2',
      name: 'Ana',
      email: 'ana@test.com',
      role: 'client',
    });
    mockedAuthService.login.mockResolvedValue({
      id: '2',
      name: 'Ana',
      email: 'ana@test.com',
      role: 'client',
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        nombre_apellido: 'Ana',
        tipo_documento: 'CC',
        numero_documento: '123456',
        email: 'ana@test.com',
        password: '1234',
        telefono: '300',
        direccion: 'Calle 10',
      });
    });

    expect(mockedAuthService.register).toHaveBeenCalled();
  });

  it('register con error no autentica al usuario', async () => {
    mockedAuthService.register.mockRejectedValue(new Error('Email ya registrado'));

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.register({
          nombre_apellido: 'Ana',
          tipo_documento: 'CC',
          numero_documento: '123456',
          email: 'ana@test.com',
          password: '1234',
          telefono: '300',
          direccion: 'Calle 10',
        });
      }),
    ).rejects.toThrow();

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signIn con credenciales incorrectas lanza error', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('Credenciales inválidas'));

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current!.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current!.signIn('wrong@test.com', 'bad');
      }),
    ).rejects.toThrow();

    expect(result.current!.user).toBeNull();
    expect(result.current!.isAuthenticated).toBe(false);
  });

  it('refreshUser llama refreshAuth y actualiza el usuario', async () => {
    mockedGetAuthToken.mockReturnValue('valid-token');
    mockedAuthService.refreshAuth.mockResolvedValue({
      id: '1',
      name: 'Juan Refrescado',
      email: 'juan@test.com',
      role: 'client',
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current!.isLoading).toBe(false);
    });

    expect(result.current!.user?.name).toBe('Juan Refrescado');
    expect(result.current!.isAuthenticated).toBe(true);
  });
});
