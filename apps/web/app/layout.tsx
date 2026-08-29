import './globals.css';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Personal OS',
  description: 'Capture everything. Commit to less. Learn continuously.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}<Link href="/diario/" aria-label="Abrir Diário" style={{position:'fixed',right:18,bottom:18,zIndex:50,textDecoration:'none',background:'#e8edf9',color:'#10141b',borderRadius:999,padding:'12px 16px',fontSize:13,fontWeight:800,boxShadow:'0 14px 40px rgba(0,0,0,.35)'}}>✎ Diário</Link></body></html>;
}
