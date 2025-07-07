import { Suspense } from 'react';
import VerificationClient from './VerificationClient';

export default function VerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationClient />
    </Suspense>
  );
} 