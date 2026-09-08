const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.\w+$/;
const REGEX_TELEFONO = /^\d{10}$/;
const REGEX_NIT = /^\d{9}-\d$/;

export function validarEmail(email: string): boolean {
  return REGEX_EMAIL.test(String(email).trim());
}

export function validarTelefono(telefono: string): boolean {
  return REGEX_TELEFONO.test(String(telefono).trim());
}

export function validarPassword(password: string): boolean {
  const valor = String(password);
  return (
    valor.length >= 8 &&
    valor.length <= 20 &&
    /[A-Z]/.test(valor) &&
    /[a-z]/.test(valor) &&
    /\d/.test(valor)
  );
}

export function validarNIT(nit: string): boolean {
  return REGEX_NIT.test(String(nit).trim());
}

export function validarPrecio(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

export function validarStock(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0;
}

export function validarNombre(nombre: string): boolean {
  return Boolean(nombre && String(nombre).trim());
}

export function mensajePassword(): string {
  return 'La contraseña debe tener entre 8 y 20 caracteres, una mayúscula, una minúscula y un número';
}

export function mensajeTelefono(): string {
  return 'El teléfono debe tener exactamente 10 dígitos';
}

export function mensajeNIT(): string {
  return 'El NIT debe tener el formato 900123456-7';
}

export function mensajeEmail(): string {
  return 'Correo electrónico inválido';
}