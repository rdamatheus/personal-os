'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function finish() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error('A sessão não foi criada. Tente entrar novamente.');
        if (active) router.replace('/');
      } catch (err: any) {
        if (active) setError(err?.message || 'Não foi possível concluir o login.');
      }
    }
    void finish();
    return () => { active = false; };
  }, [router]);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#090c11',color:'#eef2f7',fontFamily:'Inter,system-ui,sans-serif',padding:24}}>
    <div style={{textAlign:'center',maxWidth:420}}>
      <div style={{fontSize:30,marginBottom:12}}>⌁</div>
      <h1 style={{fontSize:24,margin:'0 0 10px'}}>Concluindo seu acesso…</h1>
      {error ? <><p style={{color:'#efaaaa',lineHeight:1.5}}>{error}</p><button onClick={()=>router.replace('/login/')} style={{border:0,borderRadius:12,padding:'12px 15px',fontWeight:800,cursor:'pointer'}}>Voltar ao login</button></> : <p style={{color:'#7f8998'}}>Validando sua sessão e carregando seu workspace.</p>}
    </div>
  </main>;
}
