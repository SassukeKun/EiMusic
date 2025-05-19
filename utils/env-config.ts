// utils/env-config.ts
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('SSL certificate verification disabled for development');
}

export {}; // Para garantir que o TypeScript trate este arquivo como um módulo