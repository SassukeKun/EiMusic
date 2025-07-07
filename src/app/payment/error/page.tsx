// 📁 CAMINHO: src/app/payment/error/page.tsx
import React, { Suspense } from 'react';
import PaymentErrorClient from './PaymentErrorClient';

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentErrorClient />
    </Suspense>
  );
}