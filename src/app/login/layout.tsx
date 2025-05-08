// src/app/login/layout.tsx
import { ReactNode } from 'react'

export const metadata = {
  title: 'Login'
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    // Aqui podes adicionar apenas um <div> com bg e paddings, se quiseres
    <>
      {children}
    </>
  )
}
