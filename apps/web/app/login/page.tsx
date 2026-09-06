'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { absoluteAppUrl, supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (data.session) router.replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: absoluteAppUrl('/auth/callback/') },
        });
        if (error) throw error;
        if (data.session) router.replace('/');
        else setMessage('Conta criada. Verifique seu e-mail para confirmar o acesso.');
      }
    } catch (err: any) {
      setError(err?.message || 'Não foi possível autenticar.');
    } finally { setLoading(false); }
  }

  async function continueWithGoogle() {
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: absoluteAppUrl('/auth/callback/') },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return <main style={s.page}>
    <section style={s.card}>
      <div style={s.brand}><div style={s.mark}>⌁</div><div><b>Personal OS</b><small>Seu sistema operacional pessoal.</small></div></div>
      <p style={s.kicker}>ACESSO SEGURO</p>
      <h1 style={s.title}>{mode === 'signin' ? 'Entre no seu espaço.' : 'Crie seu espaço pessoal.'}</h1>
      <p style={s.subtitle}>Seus dados ficam separados por usuário e protegidos no banco. O login Google é apenas autenticação; não concede acesso ao Gmail.</p>

      <button onClick={continueWithGoogle} disabled={loading} style={s.google}>G&nbsp;&nbsp; Continuar com Google</button>
      <div style={s.divider}><span/>ou<span/></div>

      <form onSubmit={submit} style={s.form}>
        <label style={s.label}>E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={s.input} placeholder="voce@exemplo.com" /></label>
        <label style={s.label}>Senha<input type="password" required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e=>setPassword(e.target.value)} style={s.input} placeholder="Mínimo de 8 caracteres" /></label>
        {error ? <p style={s.error}>{error}</p> : null}
        {message ? <p style={s.success}>{message}</p> : null}
        <button disabled={loading} style={s.primary}>{loading ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Criar conta'}</button>
      </form>

      <button onClick={()=>{setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('');}} style={s.switchBtn}>
        {mode === 'signin' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
      </button>
      <p style={s.foot}>A estrutura está preparada para múltiplos usuários, mas cada conta começa em um workspace pessoal privado.</p>
    </section>
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'radial-gradient(circle at 50% 0%,#151d2a 0,#090c11 46%,#07090d 100%)',color:'#eef2f7',fontFamily:'Inter,system-ui,sans-serif'},
  card:{width:'100%',maxWidth:460,border:'1px solid #27303c',borderRadius:28,padding:30,background:'linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018))',boxShadow:'0 36px 120px rgba(0,0,0,.38)'},
  brand:{display:'flex',gap:12,alignItems:'center',marginBottom:34},mark:{width:38,height:38,borderRadius:12,display:'grid',placeItems:'center',background:'#e8edf9',color:'#11161c',fontSize:20},
  kicker:{fontSize:11,fontWeight:800,letterSpacing:'.15em',color:'#8fa9ef',margin:'0 0 10px'},title:{fontSize:36,lineHeight:1.02,letterSpacing:'-.04em',margin:'0 0 14px'},subtitle:{fontSize:14,lineHeight:1.6,color:'#8f99a8',margin:'0 0 24px'},
  google:{width:'100%',border:'1px solid #303a48',borderRadius:13,padding:'13px 16px',background:'#121821',color:'#eef2f7',fontSize:14,fontWeight:800,cursor:'pointer'},
  divider:{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:12,color:'#667180',fontSize:12,margin:'18px 0'},
  form:{display:'grid',gap:15},label:{display:'grid',gap:8,fontSize:12,fontWeight:800,color:'#b9c1cc'},input:{width:'100%',boxSizing:'border-box',border:'1px solid #2b3441',borderRadius:12,padding:'13px 14px',background:'#0b1016',color:'#eef2f7',outline:'none',font:'inherit'},
  primary:{border:0,borderRadius:13,padding:'14px 16px',background:'#e8edf9',color:'#10141b',fontSize:14,fontWeight:900,cursor:'pointer'},switchBtn:{width:'100%',border:0,background:'transparent',color:'#9db8ff',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:16},
  error:{margin:0,padding:'10px 12px',borderRadius:10,background:'rgba(231,138,138,.09)',color:'#f0aaaa',fontSize:12},success:{margin:0,padding:'10px 12px',borderRadius:10,background:'rgba(115,211,155,.09)',color:'#9ce0b9',fontSize:12},foot:{fontSize:11,lineHeight:1.55,color:'#667180',margin:'22px 0 0',textAlign:'center'}
};
