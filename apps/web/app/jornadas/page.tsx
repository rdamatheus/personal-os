'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePersonalOsIdentity } from '../../components/AuthGate';
import { createGoal, createRoute, listGoals, listRoutes, setRouteStepStatus, type GoalRecord, type RouteRecord } from '../../lib/personal-os-data';
import { buildJourneyTemplate, chapterIndex, formatChapterTitle, plainChapterTitle } from '../../lib/progression/journey-runtime';
import { getArchetypeDefinition, listArchetypeDefinitions } from '../../lib/progression/goal-framework';
import type { GoalArchetype } from '../../lib/progression/model';

type JourneyView = {
  goal: GoalRecord;
  chapters: RouteRecord[];
  progress: number;
  totalMissions: number;
  doneMissions: number;
};

const starters: Array<{ title: string; archetype: GoalArchetype }> = [
  { title: 'Construir uma reserva financeira', archetype: 'financial' },
  { title: 'Comprar um bem importante', archetype: 'acquire' },
  { title: 'Aprender uma habilidade nova', archetype: 'learn' },
  { title: 'Criar renda com um serviço', archetype: 'career_business' },
  { title: 'Estabilizar uma situação difícil', archetype: 'stabilize' },
  { title: 'Construir um projeto importante', archetype: 'build' },
];

export default function JornadasPage() {
  const { user, workspace } = usePersonalOsIdentity();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [archetype, setArchetype] = useState<GoalArchetype>('custom');
  const [currentState, setCurrentState] = useState('');
  const [success, setSuccess] = useState('');
  const [targetDate, setTargetDate] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [nextGoals, nextRoutes] = await Promise.all([listGoals(workspace.id), listRoutes(workspace.id)]);
      setGoals(nextGoals);
      setRoutes(nextRoutes);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar suas jornadas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, [workspace.id]);

  const definitions = useMemo(() => listArchetypeDefinitions(), []);
  const definition = useMemo(() => getArchetypeDefinition(archetype), [archetype]);

  const journeys = useMemo<JourneyView[]>(() => {
    return goals.map(goal => {
      const chapters = routes
        .filter(route => route.goal_id === goal.id)
        .sort((a, b) => chapterIndex(a.title) - chapterIndex(b.title) || a.created_at.localeCompare(b.created_at));
      const missions = chapters.flatMap(chapter => chapter.route_steps);
      const doneMissions = missions.filter(mission => mission.status === 'done' || mission.status === 'skipped').length;
      const progress = missions.length ? Math.round((doneMissions / missions.length) * 100) : 0;
      return { goal, chapters, progress, totalMissions: missions.length, doneMissions };
    }).sort((a, b) => b.goal.created_at.localeCompare(a.goal.created_at));
  }, [goals, routes]);

  const overall = useMemo(() => {
    const withMissions = journeys.filter(journey => journey.totalMissions > 0);
    return withMissions.length ? Math.round(withMissions.reduce((sum, journey) => sum + journey.progress, 0) / withMissions.length) : 0;
  }, [journeys]);

  const nextMission = useMemo(() => {
    for (const journey of journeys) {
      const currentChapter = journey.chapters.find(chapter => chapter.progress < 100);
      if (!currentChapter) continue;
      const mission = currentChapter.route_steps.find(step => !['done', 'skipped'].includes(step.status));
      if (mission) return { journey: journey.goal.title, chapter: plainChapterTitle(currentChapter.title), mission: mission.title };
    }
    return null;
  }, [journeys]);

  async function submitJourney(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError('');
    try {
      const goal = await createGoal({
        workspaceId: workspace.id,
        userId: user.id,
        title: title.trim(),
        description: currentState.trim() ? `Estado atual: ${currentState.trim()}\nArquétipo: ${definition.label}` : `Arquétipo: ${definition.label}`,
        targetDate: targetDate || undefined,
        successCriteria: success.trim() || undefined,
      });

      const template = buildJourneyTemplate(archetype);
      for (let index = 0; index < template.length; index += 1) {
        const chapter = template[index];
        await createRoute({
          workspaceId: workspace.id,
          userId: user.id,
          goalId: goal.id,
          title: formatChapterTitle(index, chapter.title),
          description: chapter.purpose,
          steps: chapter.missions.map(mission => ({ title: mission })),
          source: 'template',
        });
      }

      setTitle('');
      setArchetype('custom');
      setCurrentState('');
      setSuccess('');
      setTargetDate('');
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível criar a jornada.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleMission(chapter: RouteRecord, missionId: string, currentStatus: string) {
    setSaving(true);
    setError('');
    try {
      await setRouteStepStatus({
        workspaceId: workspace.id,
        userId: user.id,
        routeId: chapter.id,
        stepId: missionId,
        status: currentStatus === 'done' ? 'ready' : 'done',
      });
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível atualizar a missão.');
    } finally {
      setSaving(false);
    }
  }

  function useStarter(starter: { title: string; archetype: GoalArchetype }) {
    setTitle(starter.title);
    setArchetype(starter.archetype);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <main style={s.page}>
    <div style={s.shell}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>PERSONAL OS · JORNADAS & PROGRESSÃO</p>
          <h1 style={s.h1}>Transforme ambições em progressão real.</h1>
          <p style={s.sub}>Inspirado na lógica de evolução de simuladores como Big Ambitions: você parte do estado atual, conquista capacidades reais, conclui missões e libera a próxima fase sem depender de pontos artificiais.</p>
        </div>
        <Link href="/" style={s.back}>← Voltar</Link>
      </header>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.metrics}>
        <Metric label="Jornadas" value={String(journeys.length)} />
        <Metric label="Progresso médio" value={`${overall}%`} />
        <Metric label="Missões concluídas" value={String(journeys.reduce((sum, journey) => sum + journey.doneMissions, 0))} />
        <Metric label="Próxima missão" value={nextMission?.mission || 'Criar uma jornada'} wide />
      </section>

      <section style={s.topGrid}>
        <article style={s.panel}>
          <p style={s.kicker}>NOVA AMBIÇÃO</p>
          <h2 style={s.h2}>Criar jornada-base</h2>
          <p style={s.note}>Esta versão usa um framework estruturado por tipo de objetivo. A IA depois vai personalizar a rota com pesquisa, contexto, custos, restrições e alternativas antes de você aprovar.</p>
          <form onSubmit={submitJourney} style={s.form}>
            <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="O que você quer conquistar?" required />
            <select style={s.input} value={archetype} onChange={e => setArchetype(e.target.value as GoalArchetype)}>
              {definitions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <textarea style={s.textarea} value={currentState} onChange={e => setCurrentState(e.target.value)} placeholder="Qual é o estado atual? O que já existe e o que ainda falta?" />
            <textarea style={s.textarea} value={success} onChange={e => setSuccess(e.target.value)} placeholder="Como você saberá que deu certo?" />
            <input style={s.input} type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            <button style={s.primary} disabled={saving}>{saving ? 'Criando jornada…' : 'Criar jornada'}</button>
          </form>
        </article>

        <article style={s.panel}>
          <p style={s.kicker}>MAPA DO ARQUÉTIPO</p>
          <h2 style={s.h2}>{definition.label}</h2>
          <p style={s.description}>{definition.description}</p>
          <div style={s.chapterPreview}>
            {definition.defaultChapters.map((chapter, index) => <div key={chapter.title} style={s.previewRow}>
              <span style={s.previewNumber}>{String(index + 1).padStart(2, '0')}</span>
              <div><b>{chapter.title}</b><small>{chapter.purpose}</small></div>
            </div>)}
          </div>
          <p style={{...s.kicker, marginTop: 18}}>MÉTRICAS ÚTEIS</p>
          <div style={s.chips}>{definition.preferredMetrics.map(metric => <span key={metric} style={s.chip}>{metric}</span>)}</div>
        </article>
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={s.sectionHeader}>
          <div><p style={s.kicker}>ATALHOS</p><h2 style={s.h2}>Ambições para começar</h2></div>
        </div>
        <div style={s.starters}>{starters.map(starter => <button key={starter.title} style={s.starter} onClick={() => useStarter(starter)}>
          <span>＋</span><div><b>{starter.title}</b><small>{getArchetypeDefinition(starter.archetype).label}</small></div>
        </button>)}</div>
      </section>

      <section style={{ marginTop: 30 }}>
        <div style={s.sectionHeader}>
          <div><p style={s.kicker}>MAPA DE PROGRESSÃO</p><h2 style={s.h2}>Suas jornadas</h2></div>
          <button onClick={() => void refresh()} style={s.secondary}>Atualizar</button>
        </div>

        {loading ? <div style={s.empty}>Carregando jornadas…</div> : journeys.length === 0 ? <div style={s.empty}>Nenhuma jornada criada ainda. Comece por uma ambição acima.</div> : <div style={s.journeyList}>
          {journeys.map(journey => {
            const currentChapterIndex = Math.max(0, journey.chapters.findIndex(chapter => chapter.progress < 100));
            const allDone = journey.chapters.length > 0 && journey.chapters.every(chapter => chapter.progress >= 100);
            return <article key={journey.goal.id} style={s.journeyCard}>
              <div style={s.journeyTop}>
                <div>
                  <span style={s.journeyLabel}>{allDone ? 'JORNADA CONCLUÍDA' : 'JORNADA ATIVA'}</span>
                  <h3 style={s.h3}>{journey.goal.title}</h3>
                  <p style={s.goalMeta}>{journey.goal.success_criteria ? `Sucesso: ${journey.goal.success_criteria}` : 'Defina evidências reais para considerar esta jornada concluída.'}</p>
                </div>
                <div style={s.progressBadge}>{journey.progress}%</div>
              </div>
              <div style={s.progressBar}><i style={{ ...s.progressFill, width: `${journey.progress}%` }} /></div>
              <div style={s.journeyStats}><span>{journey.doneMissions}/{journey.totalMissions} missões</span><span>{journey.chapters.length} capítulos</span>{journey.goal.target_date ? <span>Alvo: {journey.goal.target_date}</span> : null}</div>

              {journey.chapters.length === 0 ? <div style={s.noChapter}>Essa meta ainda não possui capítulos. Você pode criar uma rota manual em <Link href="/routes/" style={s.inlineLink}>Rotas</Link>.</div> : <div style={s.timeline}>
                {journey.chapters.map((chapter, index) => {
                  const locked = !allDone && index > currentChapterIndex;
                  const completed = chapter.progress >= 100;
                  const current = !locked && !completed;
                  return <div key={chapter.id} style={{ ...s.chapterCard, opacity: locked ? .45 : 1 }}>
                    <div style={s.chapterHead}>
                      <span style={{ ...s.chapterDot, background: completed ? '#dbe6f8' : current ? '#7ea1ef' : '#293442', color: completed ? '#0c1118' : '#eaf0fa' }}>{completed ? '✓' : locked ? '🔒' : index + 1}</span>
                      <div style={{ flex: 1 }}><b>{plainChapterTitle(chapter.title)}</b><small>{completed ? 'Capítulo concluído' : locked ? 'Bloqueado pela fase anterior' : 'Capítulo atual'}</small></div>
                      <strong>{Math.round(chapter.progress)}%</strong>
                    </div>
                    <div style={s.missionList}>
                      {chapter.route_steps.map(mission => <button key={mission.id} disabled={saving || locked} onClick={() => void toggleMission(chapter, mission.id, mission.status)} style={{ ...s.mission, cursor: locked ? 'not-allowed' : 'pointer' }}>
                        <span style={{ ...s.missionCheck, background: mission.status === 'done' ? '#dbe6f8' : 'transparent' }}>{mission.status === 'done' ? '✓' : ''}</span>
                        <div><b style={{ textDecoration: mission.status === 'done' ? 'line-through' : 'none' }}>{mission.title}</b><small>{mission.status === 'done' ? 'Concluída' : locked ? 'Aguardando desbloqueio' : 'Missão disponível'}</small></div>
                      </button>)}
                    </div>
                  </div>;
                })}
              </div>}
            </article>;
          })}
        </div>}
      </section>

      <section style={s.principles}>
        <div><b>Progresso real</b><span>Dinheiro, habilidade, entrega, reserva, autonomia ou outro resultado observável.</span></div>
        <div><b>Desbloqueios honestos</b><span>A próxima fase aparece porque um pré-requisito real foi vencido, não para fabricar dificuldade.</span></div>
        <div><b>Sem punição artificial</b><span>Falhar uma missão não reduz “vida” ou cria culpa. O sistema deve ajudar a recalcular a rota.</span></div>
        <div><b>Você define sucesso</b><span>O Personal OS organiza o caminho; não impõe uma única vida ideal.</span></div>
      </section>
    </div>
  </main>;
}

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div style={{ ...s.metric, gridColumn: wide ? 'span 2' : undefined }}><span>{label}</span><b>{value}</b></div>;
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#080b10', color: '#eef2f8', fontFamily: 'Inter,system-ui,sans-serif', padding: '34px 18px 100px' },
  shell: { maxWidth: 1180, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 22, flexWrap: 'wrap' },
  eyebrow: { fontSize: 10, fontWeight: 900, letterSpacing: '.16em', color: '#86a7ee', margin: '0 0 9px' },
  h1: { fontSize: 'clamp(30px,5vw,48px)', lineHeight: 1, letterSpacing: '-.045em', margin: '0 0 12px', maxWidth: 800 },
  sub: { maxWidth: 760, color: '#8d98a8', fontSize: 14, lineHeight: 1.65, margin: 0 },
  back: { color: '#d1dcf4', textDecoration: 'none', border: '1px solid #293444', borderRadius: 12, padding: '10px 13px', fontSize: 13 },
  error: { border: '1px solid #653d3d', background: '#251719', color: '#f0b3b3', borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13 },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 18 },
  metric: { border: '1px solid #222c39', background: '#0e131a', borderRadius: 16, padding: 15, display: 'grid', gap: 7, minHeight: 76 },
  topGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 },
  panel: { border: '1px solid #232e3a', background: '#0d1218', borderRadius: 20, padding: 21 },
  kicker: { fontSize: 10, fontWeight: 900, letterSpacing: '.15em', color: '#7f9fe8', margin: '0 0 7px' },
  h2: { fontSize: 22, letterSpacing: '-.025em', margin: '0 0 13px' },
  description: { color: '#9aa5b5', fontSize: 13, lineHeight: 1.55, margin: '0 0 15px' },
  note: { color: '#717d8e', fontSize: 11, lineHeight: 1.55, margin: '-4px 0 14px' },
  form: { display: 'grid', gap: 10 },
  input: { border: '1px solid #2a3544', background: '#090d12', color: '#eef2f8', borderRadius: 11, padding: '12px 13px', font: 'inherit' },
  textarea: { border: '1px solid #2a3544', background: '#090d12', color: '#eef2f8', borderRadius: 11, padding: '12px 13px', font: 'inherit', minHeight: 82, resize: 'vertical' },
  primary: { border: 0, borderRadius: 11, padding: '12px 14px', background: '#e4ebf9', color: '#0d1117', fontWeight: 900, cursor: 'pointer' },
  secondary: { border: '1px solid #2a3544', borderRadius: 10, padding: '9px 12px', background: '#10161e', color: '#c5ceda', cursor: 'pointer' },
  chapterPreview: { display: 'grid', gap: 8 },
  previewRow: { display: 'flex', gap: 11, alignItems: 'flex-start', borderBottom: '1px solid #18212c', padding: '9px 0' },
  previewNumber: { color: '#6178aa', fontSize: 11, fontWeight: 900, paddingTop: 2 },
  chips: { display: 'flex', gap: 7, flexWrap: 'wrap' },
  chip: { border: '1px solid #283548', color: '#aebfe2', background: '#101722', borderRadius: 999, padding: '6px 9px', fontSize: 10 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 },
  starters: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 },
  starter: { display: 'flex', gap: 11, alignItems: 'center', textAlign: 'left', border: '1px solid #25303d', background: '#0d1218', color: '#edf2f8', borderRadius: 15, padding: '13px 14px', cursor: 'pointer' },
  journeyList: { display: 'grid', gap: 16 },
  journeyCard: { border: '1px solid #273342', background: '#0d1218', borderRadius: 22, padding: 20 },
  journeyTop: { display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' },
  journeyLabel: { fontSize: 9, fontWeight: 900, letterSpacing: '.15em', color: '#7d9ce2' },
  h3: { fontSize: 25, letterSpacing: '-.03em', margin: '5px 0 7px' },
  goalMeta: { color: '#7e8999', fontSize: 12, lineHeight: 1.5, margin: 0, maxWidth: 760 },
  progressBadge: { minWidth: 68, height: 68, border: '1px solid #34445b', borderRadius: 18, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, background: '#101824' },
  progressBar: { height: 7, borderRadius: 99, background: '#151d27', overflow: 'hidden', marginTop: 15 },
  progressFill: { display: 'block', height: '100%', background: '#dce6f8', borderRadius: 99 },
  journeyStats: { display: 'flex', gap: 12, flexWrap: 'wrap', color: '#697688', fontSize: 10, marginTop: 9 },
  timeline: { display: 'grid', gap: 11, marginTop: 18 },
  chapterCard: { border: '1px solid #202b37', background: '#0a0f15', borderRadius: 16, padding: 14, transition: 'opacity .2s ease' },
  chapterHead: { display: 'flex', gap: 11, alignItems: 'center' },
  chapterDot: { width: 31, height: 31, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900, flex: '0 0 auto' },
  missionList: { display: 'grid', gap: 7, marginTop: 11, paddingLeft: 42 },
  mission: { display: 'flex', gap: 9, alignItems: 'flex-start', textAlign: 'left', border: '1px solid #1c2631', background: '#0d131a', color: '#e8edf5', borderRadius: 11, padding: '10px 11px', width: '100%' },
  missionCheck: { width: 22, height: 22, flex: '0 0 auto', border: '1px solid #38475a', borderRadius: 7, display: 'grid', placeItems: 'center', color: '#0c1118', fontSize: 11, fontWeight: 900 },
  empty: { border: '1px dashed #2b3643', borderRadius: 18, padding: 28, color: '#798596', textAlign: 'center' },
  noChapter: { marginTop: 16, border: '1px dashed #2b3643', borderRadius: 12, padding: 13, color: '#7c8797', fontSize: 12 },
  inlineLink: { color: '#adc2f2' },
  principles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginTop: 28 },
};

Object.assign(s.previewRow, {});
