'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePersonalOsIdentity } from '../../../components/AuthGate';
import { supabase } from '../../../lib/supabase';

type AdminUser = {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
  providers: string[];
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  isAnonymous: boolean;
  status: 'active' | 'suspended';
  workspace: null | {
    id: string;
    name: string;
    kind: string;
    role: string | null;
    membershipStatus: string | null;
    createdAt: string;
    archivedAt: string | null;
  };
};

type AdminResponse = {
  summary: {
    total: number;
    returned: number;
    active: number;
    google: number;
    email: number;
    newLast7Days: number;
    page: number;
    perPage: number;
    nextPage: number | null;
    lastPage: number | null;
  };
  users: AdminUser[];
};

function dateTime(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function providerLabel(providers: string[]) {
  if (!providers.length) return '—';
  return providers.map((provider) => provider === 'google' ? 'Google' : provider === 'email' ? 'E-mail/senha' : provider).join(' + ');
}

export default function AdminUsersPage() {
  const router = useRouter();
  const identity = usePersonalOsIdentity();
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke<AdminResponse>('admin-users', {
        body: { page: 1, perPage: 200 },
      });
      if (invokeError) throw invokeError;
      if (!response) throw new Error('O servidor não retornou dados.');
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!identity.isPlatformAdmin) {
      router.replace('/');
      return;
    }
    void loadUsers();
  }, [identity.isPlatformAdmin, router]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return data?.users ?? [];
    return (data?.users ?? []).filter((user) =>
      [user.displayName, user.email ?? '', user.workspace?.name ?? '', providerLabel(user.providers)]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(normalized))
    );
  }, [data, query]);

  if (!identity.isPlatformAdmin) {
    return <main style={s.loading}>Verificando permissão administrativa…</main>;
  }

  return <main style={s.page}>
    <div style={s.shell}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>PERSONAL OS · ADMINISTRAÇÃO</p>
          <h1 style={s.title}>Usuários da plataforma</h1>
          <p style={s.subtitle}>Conta, método de acesso e workspace. Conteúdo pessoal não é exibido neste painel.</p>
        </div>
        <div style={s.actions}>
          <Link href="/" style={s.secondary}>← Voltar ao Personal OS</Link>
          <button onClick={loadUsers} disabled={loading} style={s.primary}>{loading ? 'Atualizando…' : 'Atualizar'}</button>
        </div>
      </header>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.metrics}>
        <Metric label="Usuários" value={data?.summary.total ?? '—'} hint="cadastrados" />
        <Metric label="Ativos" value={data?.summary.active ?? '—'} hint="na página atual" />
        <Metric label="Google" value={data?.summary.google ?? '—'} hint="login conectado" />
        <Metric label="Novos" value={data?.summary.newLast7Days ?? '—'} hint="últimos 7 dias" />
      </section>

      <section style={s.panel}>
        <div style={s.panelHead}>
          <div>
            <b>Cadastros</b>
            <span style={s.muted}>{data ? `${data.summary.returned} registro(s) carregado(s)` : 'Carregando…'}</span>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nome, e-mail, workspace…"
            style={s.search}
          />
        </div>

        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <Th>Usuário</Th>
                <Th>Login</Th>
                <Th>Cadastro</Th>
                <Th>Último acesso</Th>
                <Th>Workspace</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => <tr key={user.id}>
                <Td>
                  <div style={s.person}>
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={s.avatar} referrerPolicy="no-referrer" /> : <div style={s.avatarFallback}>{user.displayName.slice(0,1).toUpperCase()}</div>}
                    <div><b>{user.displayName}</b><span style={s.muted}>{user.email || 'Sem e-mail'}</span></div>
                  </div>
                </Td>
                <Td>{providerLabel(user.providers)}<span style={s.muted}>{user.emailConfirmedAt ? 'E-mail confirmado' : 'Confirmação pendente'}</span></Td>
                <Td>{dateTime(user.createdAt)}</Td>
                <Td>{dateTime(user.lastSignInAt)}</Td>
                <Td>{user.workspace?.name ?? '—'}<span style={s.muted}>{user.workspace ? `${user.workspace.role ?? 'sem papel'} · ${user.workspace.membershipStatus ?? '—'}` : 'Sem workspace'}</span></Td>
                <Td><span style={user.status === 'active' ? s.okBadge : s.warnBadge}>{user.status === 'active' ? 'Ativo' : 'Suspenso'}</span></Td>
              </tr>)}
              {!loading && filtered.length === 0 ? <tr><td colSpan={6} style={s.empty}>Nenhum usuário encontrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section style={s.privacy}>
        <b>Limite de privacidade</b>
        <p>Este painel usa uma função administrativa protegida no backend. A chave privilegiada não vai para o navegador. Metas, tarefas, decisões, diário e demais conteúdos pessoais não são listados aqui.</p>
      </section>
    </div>
  </main>;
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return <div style={s.metric}><span>{label}</span><b>{value}</b><small>{hint}</small></div>;
}
function Th({ children }: { children: React.ReactNode }) { return <th style={s.th}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={s.td}>{children}</td>; }

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:'100vh',background:'#080b10',color:'#eef2f7',fontFamily:'Inter,system-ui,sans-serif',padding:'36px 22px 80px'},
  shell:{maxWidth:1280,margin:'0 auto'},
  loading:{minHeight:'100vh',display:'grid',placeItems:'center',background:'#080b10',color:'#9da8b7',fontFamily:'Inter,system-ui,sans-serif'},
  header:{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-start',marginBottom:26,flexWrap:'wrap'},
  eyebrow:{fontSize:11,fontWeight:900,letterSpacing:'.16em',color:'#8fa9ef',margin:'0 0 9px'},
  title:{fontSize:36,lineHeight:1.05,letterSpacing:'-.04em',margin:'0 0 10px'},
  subtitle:{color:'#8f99a8',fontSize:14,lineHeight:1.6,margin:0,maxWidth:720},
  actions:{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'},
  primary:{border:0,borderRadius:12,padding:'11px 14px',background:'#e8edf9',color:'#10141b',fontSize:13,fontWeight:900,cursor:'pointer'},
  secondary:{border:'1px solid #2a3442',borderRadius:12,padding:'10px 13px',color:'#bcc7d5',textDecoration:'none',fontSize:13,fontWeight:800,background:'#10151c'},
  error:{border:'1px solid rgba(231,138,138,.35)',background:'rgba(231,138,138,.08)',color:'#efaaaa',padding:'12px 14px',borderRadius:12,marginBottom:20,fontSize:13},
  metrics:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:18},
  metric:{border:'1px solid #222b37',background:'#0f141b',borderRadius:18,padding:18,display:'grid',gap:4},
  panel:{border:'1px solid #222b37',background:'#0d1218',borderRadius:20,overflow:'hidden'},
  panelHead:{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',padding:18,borderBottom:'1px solid #1f2732',flexWrap:'wrap'},
  search:{minWidth:280,maxWidth:'100%',border:'1px solid #2a3442',borderRadius:11,padding:'10px 12px',background:'#090d12',color:'#eef2f7',outline:'none'},
  tableWrap:{overflowX:'auto'},
  table:{width:'100%',borderCollapse:'collapse',minWidth:980},
  th:{textAlign:'left',fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',color:'#687587',padding:'12px 14px',borderBottom:'1px solid #1c2430'},
  td:{fontSize:13,color:'#cbd4df',padding:'14px',borderBottom:'1px solid #171e28',verticalAlign:'middle'},
  person:{display:'flex',gap:10,alignItems:'center'},
  avatar:{width:34,height:34,borderRadius:10,objectFit:'cover',background:'#171f2a'},
  avatarFallback:{width:34,height:34,borderRadius:10,display:'grid',placeItems:'center',background:'#17202b',color:'#cdd8e7',fontWeight:900},
  muted:{display:'block',color:'#6f7b8b',fontSize:11,marginTop:3},
  okBadge:{display:'inline-block',border:'1px solid rgba(115,211,155,.28)',background:'rgba(115,211,155,.08)',color:'#9ce0b9',borderRadius:999,padding:'5px 8px',fontSize:11,fontWeight:800},
  warnBadge:{display:'inline-block',border:'1px solid rgba(231,138,138,.28)',background:'rgba(231,138,138,.08)',color:'#efaaaa',borderRadius:999,padding:'5px 8px',fontSize:11,fontWeight:800},
  empty:{textAlign:'center',padding:36,color:'#718093'},
  privacy:{border:'1px solid #202936',borderRadius:16,padding:16,marginTop:16,background:'#0c1117',color:'#b9c4d1',fontSize:13,lineHeight:1.6},
};
