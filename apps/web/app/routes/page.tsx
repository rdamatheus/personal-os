'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePersonalOsIdentity } from '../../components/AuthGate';
import { createGoal, createRoute, listGoals, listRoutes, setRouteStepStatus, type GoalRecord, type RouteRecord } from '../../lib/personal-os-data';

export default function RoutesPage() {
  const { user, workspace } = usePersonalOsIdentity();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalSuccess, setGoalSuccess] = useState('');

  const [routeTitle, setRouteTitle] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [routeGoalId, setRouteGoalId] = useState('');
  const [routeSteps, setRouteSteps] = useState('');

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [nextGoals, nextRoutes] = await Promise.all([listGoals(workspace.id), listRoutes(workspace.id)]);
      setGoals(nextGoals);
      setRoutes(nextRoutes);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar metas e rotas.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [workspace.id]);

  async function submitGoal(e: FormEvent) {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setSaving(true); setError('');
    try {
      await createGoal({
        workspaceId: workspace.id,
        userId: user.id,
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        targetDate: goalTarget || undefined,
        successCriteria: goalSuccess.trim(),
      });
      setGoalTitle(''); setGoalDescription(''); setGoalTarget(''); setGoalSuccess('');
      await refresh();
    } catch (err: any) { setError(err?.message || 'Não foi possível criar a meta.'); }
    finally { setSaving(false); }
  }

  async function submitRoute(e: FormEvent) {
    e.preventDefault();
    const steps = routeSteps.split('\n').map(line => line.trim()).filter(Boolean).map(title => ({ title }));
    if (!routeTitle.trim() || steps.length === 0) return;
    setSaving(true); setError('');
    try {
      await createRoute({
        workspaceId: workspace.id,
        userId: user.id,
        goalId: routeGoalId || undefined,
        title: routeTitle.trim(),
        description: routeDescription.trim(),
        steps,
      });
      setRouteTitle(''); setRouteDescription(''); setRouteGoalId(''); setRouteSteps('');
      await refresh();
    } catch (err: any) { setError(err?.message || 'Não foi possível criar a rota.'); }
    finally { setSaving(false); }
  }

  async function toggleStep(route: RouteRecord, stepId: string, currentStatus: string) {
    setSaving(true); setError('');
    try {
      await setRouteStepStatus({
        workspaceId: workspace.id,
        userId: user.id,
        routeId: route.id,
        stepId,
        status: currentStatus === 'done' ? 'ready' : 'done',
      });
      await refresh();
    } catch (err: any) { setError(err?.message || 'Não foi possível atualizar a etapa.'); }
    finally { setSaving(false); }
  }

  const nextAction = useMemo(() => {
    for (const route of routes.filter(r => r.status === 'active')) {
      const step = route.route_steps.find(s => s.status === 'ready' || s.status === 'doing');
      if (step) return { route: route.title, step: step.title };
    }
    return null;
  }, [routes]);

  return <main style={s.page}>
    <div style={s.shell}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>PERSONAL OS · MOTOR DE ROTAS</p>
          <h1 style={s.h1}>Metas viram caminhos executáveis.</h1>
          <p style={s.sub}>Persistência real no Supabase, isolada pelo seu workspace. A conclusão das etapas recalcula o progresso automaticamente.</p>
        </div>
        <Link href="/" style={s.back}>← Voltar</Link>
      </header>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.summary}>
        <Card label="Metas ativas" value={String(goals.filter(g=>g.status==='active').length)} />
        <Card label="Rotas" value={String(routes.length)} />
        <Card label="Próxima melhor ação" value={nextAction?.step || 'Definir uma rota'} wide />
      </section>

      <section style={s.grid}>
        <article style={s.panel}>
          <p style={s.kicker}>1 · OBJETIVO</p>
          <h2 style={s.h2}>Criar meta</h2>
          <form onSubmit={submitGoal} style={s.form}>
            <input style={s.input} value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} placeholder="Ex.: Comprar uma moto" required />
            <textarea style={s.textarea} value={goalDescription} onChange={e=>setGoalDescription(e.target.value)} placeholder="Por que isso importa?" />
            <input style={s.input} type="date" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} />
            <textarea style={s.textarea} value={goalSuccess} onChange={e=>setGoalSuccess(e.target.value)} placeholder="Como saberemos que a meta foi alcançada?" />
            <button style={s.primary} disabled={saving}>Salvar meta</button>
          </form>
        </article>

        <article style={s.panel}>
          <p style={s.kicker}>2 · CAMINHO</p>
          <h2 style={s.h2}>Criar rota</h2>
          <form onSubmit={submitRoute} style={s.form}>
            <select style={s.input} value={routeGoalId} onChange={e=>setRouteGoalId(e.target.value)}>
              <option value="">Sem meta vinculada</option>
              {goals.map(goal=><option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
            <input style={s.input} value={routeTitle} onChange={e=>setRouteTitle(e.target.value)} placeholder="Nome da rota" required />
            <textarea style={s.textarea} value={routeDescription} onChange={e=>setRouteDescription(e.target.value)} placeholder="Contexto da rota" />
            <textarea style={{...s.textarea,minHeight:150}} value={routeSteps} onChange={e=>setRouteSteps(e.target.value)} placeholder={'Uma etapa por linha\nEx.: Definir orçamento máximo\nPesquisar modelos\nSimular custo mensal'} required />
            <button style={s.primary} disabled={saving}>Salvar rota</button>
          </form>
          <p style={s.note}>A geração automática por IA será ligada ao mesmo motor: primeiro a IA propõe; você aprova; só então a rota é gravada.</p>
        </article>
      </section>

      <section style={{display:'grid',gap:16,marginTop:22}}>
        <div style={s.sectionTitle}><div><p style={s.kicker}>EXECUÇÃO</p><h2 style={s.h2}>Suas rotas</h2></div><button onClick={()=>void refresh()} style={s.secondary}>Atualizar</button></div>
        {loading ? <div style={s.empty}>Carregando…</div> : routes.length === 0 ? <div style={s.empty}>Nenhuma rota criada ainda.</div> : routes.map(route => <article key={route.id} style={s.routeCard}>
          <div style={s.routeTop}>
            <div><span style={s.badge}>{route.source}</span><h3 style={s.h3}>{route.title}</h3><p style={s.routeDesc}>{route.description || 'Sem descrição.'}</p></div>
            <div style={s.progressNumber}>{Math.round(route.progress)}%</div>
          </div>
          <div style={s.progressBar}><i style={{...s.progressFill,width:`${route.progress}%`}} /></div>
          <div style={{display:'grid',gap:9,marginTop:16}}>
            {route.route_steps.map(step => <button key={step.id} disabled={saving} onClick={()=>void toggleStep(route,step.id,step.status)} style={{...s.step,opacity:step.status==='pending'?.55:1}}>
              <span style={{...s.check,background:step.status==='done'?'#dfe7f7':'transparent'}}>{step.status==='done'?'✓':step.position+1}</span>
              <div style={{textAlign:'left',flex:1}}><b style={{textDecoration:step.status==='done'?'line-through':'none'}}>{step.title}</b><small style={s.stepStatus}>{labelStatus(step.status)}</small></div>
            </button>)}
          </div>
        </article>)}
      </section>
    </div>
  </main>;
}

function labelStatus(status: string) {
  return ({pending:'Aguardando',ready:'Próxima ação',doing:'Em andamento',blocked:'Bloqueada',done:'Concluída',skipped:'Ignorada'} as Record<string,string>)[status] ?? status;
}

function Card({label,value,wide=false}:{label:string;value:string;wide?:boolean}) {
  return <div style={{...s.metric,gridColumn:wide?'span 2':undefined}}><span>{label}</span><b>{value}</b></div>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:'100vh',background:'#080b10',color:'#edf1f7',fontFamily:'Inter,system-ui,sans-serif',padding:'36px 20px 80px'},
  shell:{maxWidth:1120,margin:'0 auto'},header:{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-start',marginBottom:24},
  eyebrow:{fontSize:11,fontWeight:900,letterSpacing:'.15em',color:'#91a9e8',margin:'0 0 10px'},h1:{fontSize:38,letterSpacing:'-.04em',margin:'0 0 10px'},sub:{maxWidth:700,color:'#8e98a8',lineHeight:1.6,fontSize:14,margin:0},back:{color:'#c7d5f6',textDecoration:'none',border:'1px solid #293241',borderRadius:12,padding:'10px 13px',fontSize:13},
  error:{border:'1px solid #663b3b',background:'#251516',color:'#efb1b1',borderRadius:12,padding:'12px 14px',marginBottom:16,fontSize:13},
  summary:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18},metric:{border:'1px solid #232c38',background:'#0e131a',borderRadius:16,padding:16,display:'grid',gap:8},
  grid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18},panel:{border:'1px solid #232c38',background:'#0d1218',borderRadius:20,padding:22},kicker:{fontSize:10,fontWeight:900,letterSpacing:'.14em',color:'#7f9ce2',margin:'0 0 8px'},h2:{fontSize:22,margin:'0 0 16px',letterSpacing:'-.02em'},
  form:{display:'grid',gap:11},input:{border:'1px solid #293342',background:'#090d12',color:'#edf1f7',borderRadius:11,padding:'12px 13px',font:'inherit'},textarea:{border:'1px solid #293342',background:'#090d12',color:'#edf1f7',borderRadius:11,padding:'12px 13px',font:'inherit',minHeight:88,resize:'vertical'},
  primary:{border:0,borderRadius:11,padding:'12px 14px',background:'#e3e9f6',color:'#0d1117',fontWeight:900,cursor:'pointer'},secondary:{border:'1px solid #2a3544',borderRadius:10,padding:'9px 12px',background:'#10161e',color:'#c5ceda',cursor:'pointer'},note:{fontSize:11,lineHeight:1.5,color:'#677384',margin:'13px 0 0'},
  sectionTitle:{display:'flex',alignItems:'center',justifyContent:'space-between'},empty:{border:'1px dashed #2a3441',borderRadius:18,padding:26,color:'#7d8897',textAlign:'center'},routeCard:{border:'1px solid #242e3a',background:'#0d1218',borderRadius:20,padding:20},routeTop:{display:'flex',justifyContent:'space-between',gap:20},badge:{fontSize:10,textTransform:'uppercase',letterSpacing:'.11em',color:'#8da7e6'},h3:{fontSize:21,margin:'5px 0 7px'},routeDesc:{fontSize:13,color:'#7f8998',margin:0},progressNumber:{fontSize:26,fontWeight:900},progressBar:{height:7,borderRadius:99,background:'#151c25',overflow:'hidden',marginTop:15},progressFill:{display:'block',height:'100%',background:'#dbe4f7',borderRadius:99},
  step:{display:'flex',alignItems:'center',gap:12,width:'100%',border:'1px solid #222c37',background:'#0a0f15',color:'#e9edf4',borderRadius:12,padding:'11px 12px',cursor:'pointer'},check:{width:27,height:27,border:'1px solid #394657',borderRadius:8,display:'grid',placeItems:'center',color:'#11161d',fontWeight:900},stepStatus:{display:'block',color:'#778393',marginTop:3,fontSize:10},
};
