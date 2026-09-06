'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { hydrateCoreStore, watchCoreStore } from '../lib/core-cloud-store';
import { supabase } from '../lib/supabase';

type Identity = {
  user: User;
  profile: { displayName: string; avatarUrl?: string | null };
  workspace: { id: string; name: string; role: string };
  isPlatformAdmin: boolean;
  cloudStatus: 'ready' | 'syncing' | 'error';
  signOut: () => Promise<void>;
};

const IdentityContext = createContext<Identity | null>(null);

export function usePersonalOsIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error('usePersonalOsIdentity must be used inside AuthGate.');
  return value;
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = pathname && pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  const isPublicRoute = normalizedPathname?.endsWith('/login') || normalizedPathname?.includes('/auth/callback');
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ displayName: string; avatarUrl?: string | null } | null>(null);
  const [workspace, setWorkspace] = useState<{ id: string; name: string; role: string } | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'ready' | 'syncing' | 'error'>('syncing');
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let stopWatching: (() => void) | undefined;

    async function bootstrap(nextUser: User) {
      setCloudStatus('syncing');
      setBootstrapError(null);
      const [profileRes, membershipRes, platformAdminRes] = await Promise.all([
        supabase.from('profiles').select('display_name,avatar_url').eq('id', nextUser.id).single(),
        supabase.from('workspace_members').select('workspace_id,role').eq('user_id', nextUser.id).eq('status', 'active').order('created_at').limit(1).single(),
        supabase.from('platform_admins').select('user_id').eq('user_id', nextUser.id).maybeSingle(),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (membershipRes.error) throw membershipRes.error;
      if (platformAdminRes.error) throw platformAdminRes.error;

      const workspaceRes = await supabase.from('workspaces').select('id,name').eq('id', membershipRes.data.workspace_id).single();
      if (workspaceRes.error) throw workspaceRes.error;

      const baseline = await hydrateCoreStore(workspaceRes.data.id, nextUser.id);
      if (disposed) return;
      setUser(nextUser);
      setProfile({ displayName: profileRes.data.display_name ?? nextUser.email?.split('@')[0] ?? 'Usuário', avatarUrl: profileRes.data.avatar_url });
      setWorkspace({ id: workspaceRes.data.id, name: workspaceRes.data.name, role: membershipRes.data.role });
      setIsPlatformAdmin(Boolean(platformAdminRes.data));
      setCloudStatus('ready');
      stopWatching?.();
      stopWatching = watchCoreStore(workspaceRes.data.id, nextUser.id, baseline, () => setCloudStatus('error'));
      setReady(true);
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (disposed) return;
      if (error) {
        console.error('Personal OS session check failed', error);
        setBootstrapError('Não foi possível verificar sua sessão.');
        setCloudStatus('error');
        setReady(true);
        return;
      }
      if (data.session?.user) {
        try { await bootstrap(data.session.user); }
        catch (error) {
          console.error('Personal OS bootstrap failed', error);
          setBootstrapError('Não foi possível carregar seu ambiente pessoal.');
          setCloudStatus('error');
          setReady(true);
        }
      } else {
        setReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      if (!session?.user) {
        stopWatching?.();
        setUser(null);
        setProfile(null);
        setWorkspace(null);
        setIsPlatformAdmin(false);
        setBootstrapError(null);
        setReady(true);
        return;
      }
      void bootstrap(session.user).catch(error => {
        console.error('Personal OS auth refresh failed', error);
        setBootstrapError('Não foi possível atualizar sua sessão.');
        setCloudStatus('error');
        setReady(true);
      });
    });

    return () => {
      disposed = true;
      stopWatching?.();
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (ready && !user && !isPublicRoute) router.replace('/login/');
  }, [ready, user, isPublicRoute, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login/');
  }

  const identity = useMemo<Identity | null>(() => {
    if (!user || !profile || !workspace) return null;
    return { user, profile, workspace, isPlatformAdmin, cloudStatus, signOut };
  }, [user, profile, workspace, isPlatformAdmin, cloudStatus]);

  if (isPublicRoute) return <>{children}</>;

  if (ready && bootstrapError) {
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#090c11',color:'#eef2f7',fontFamily:'Inter,system-ui,sans-serif',padding:24}}>
      <div style={{maxWidth:430,textAlign:'center'}}>
        <div style={{fontSize:28,marginBottom:10}}>⌁</div>
        <b>Personal OS</b>
        <p style={{color:'#9aa5b3',fontSize:13,lineHeight:1.6}}>{bootstrapError}</p>
        <button onClick={()=>router.replace('/login/')} style={{border:'1px solid #334052',background:'#151b24',color:'#eef2f7',borderRadius:10,padding:'10px 14px',fontSize:13,cursor:'pointer'}}>Voltar para o login</button>
      </div>
    </main>;
  }

  if (!ready || !identity) {
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#090c11',color:'#eef2f7',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:28,marginBottom:10}}>⌁</div><b>Personal OS</b><p style={{color:'#7f8998',fontSize:13}}>Carregando seu ambiente seguro…</p></div>
    </main>;
  }

  return <IdentityContext.Provider value={identity}>
    {children}
    <div style={{position:'fixed',right:18,bottom:18,zIndex:80,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-end'}}>
      {identity.isPlatformAdmin ? <Link href="/admin/users/" aria-label="Abrir Administração de Usuários" style={{textDecoration:'none',border:'1px solid #31405a',background:'#111824',color:'#a9bfff',borderRadius:999,padding:'11px 14px',fontSize:13,fontWeight:800,boxShadow:'0 14px 40px rgba(0,0,0,.25)'}}>⚙ Usuários</Link> : null}
      <Link href="/diario/" aria-label="Abrir Diário" style={{textDecoration:'none',background:'#e8edf9',color:'#10141b',borderRadius:999,padding:'11px 14px',fontSize:13,fontWeight:800,boxShadow:'0 14px 40px rgba(0,0,0,.35)'}}>✎ Diário</Link>
      <button onClick={signOut} title={`Sair de ${identity.profile.displayName}`} style={{border:'1px solid #29313d',background:'#11161d',color:'#aeb8c6',borderRadius:999,padding:'11px 13px',fontSize:12,cursor:'pointer'}}>Sair</button>
      <span title={cloudStatus === 'ready' ? 'Sincronizado com a nuvem' : cloudStatus === 'error' ? 'Falha de sincronização' : 'Sincronizando'} style={{width:9,height:9,borderRadius:99,background:cloudStatus === 'ready' ? '#73d39b' : cloudStatus === 'error' ? '#e78a8a' : '#d7b86a',boxShadow:'0 0 0 4px rgba(255,255,255,.04)'}} />
    </div>
  </IdentityContext.Provider>;
}
