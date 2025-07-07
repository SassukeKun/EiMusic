// src/app/register/page.tsx
import React, { Suspense } from 'react';
import RegisterClient from './RegisterClient';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}