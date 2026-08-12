import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Personal OS',
  description: 'Capture everything. Commit to less. Learn continuously.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
