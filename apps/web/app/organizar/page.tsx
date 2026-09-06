'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePersonalOsIdentity } from '../../components/AuthGate';
import { areasRepository, projectsRepository, tasksRepository, type AreaRecord, type ProjectRecord, type TaskRecord } from '../../lib/data/core-repository';
import { goalsRepository, listArchivedProjects, listArchivedTasks, type GoalRecord } from '../../lib/data/execution-repository';

type Tab = 'goals' | 'projects' | 'tasks';
type Mode = 'active' | 'archived';

const emptyGoal = { title:'', description:'', areaId:'', priority:'medium', targetDate:'', successCriteria:'', status:'active' };
const emptyProject = { title:'', description:'', areaId:'', goalId:'', priority:'medium', startDate:'', targetDate:'', progress:0, status:'active' };
const emptyTask = { title:'', description:'', areaId:'', projectId:'', priority:'medium', dueAt:'', estimatedMinutes:'', energyRequired:'', status:'todo' };

export default function OrganizarPage() {
  const { user, workspace } = usePersonalOsIdentity();
  const actor = useMemo(() => ({ workspaceId: workspace.id, userId: user.id }), [workspace.id, user.id]);
  const [tab, setTab] = useState<Tab>('tasks');
  const [mode, setMode] = useState<Mode>('active');
  const [areas, setAreas] = useState<AreaRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<GoalRecord[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ProjectRecord[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<TaskRecord[]>([]);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [a,g,p,t,ag,ap,at] = await Promise.all([
        areasRepository.list(workspace.id), goalsRepository.list(workspace.id), projectsRepository.list(workspace.id), tasksRepository.list(workspace.id),
        goalsRepository.listArchived(workspace.id), listArchivedProjects(workspace.id), listArchivedTasks(workspace.id),
      ]);
      setAreas(a); setGoals(g); setProjects(p); setTasks(t); setArchivedGoals(ag); setArchivedProjects(ap); setArchivedTasks(at);
    } catch (err:any) { setError(err?.message || 'Não foi possível carregar seus dados.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [workspace.id]);
  useEffect(() => { setEditingId(null); setGoalForm(emptyGoal); setProjectForm(emptyProject); setTaskForm(emptyTask); }, [tab, mode]);

  async function submitGoal(e:FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) await goalsRepository.update({ ...actor, id:editingId, title:goalForm.title, description:goalForm.description, areaId:goalForm.areaId || null, priority:goalForm.priority, targetDate:goalForm.targetDate || null, successCriteria:goalForm.successCriteria, status:goalForm.status });
      else await goalsRepository.create({ ...actor, title:goalForm.title, description:goalForm.description, areaId:goalForm.areaId || undefined, priority:goalForm.priority, targetDate:goalForm.targetDate || undefined, successCriteria:goalForm.successCriteria });
      setEditingId(null); setGoalForm(emptyGoal); await refresh();
    } catch (err:any) { setError(err?.message || 'Não foi possível salvar a meta.'); } finally { setSaving(false); }
  }

  async function submitProject(e:FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) await projectsRepository.update({ ...actor, id:editingId, title:projectForm.title, description:projectForm.description, areaId:projectForm.areaId || null, goalId:projectForm.goalId || null, priority:projectForm.priority, startDate:projectForm.startDate || null, targetDate:projectForm.targetDate || null, progress:Number(projectForm.progress), status:projectForm.status });
      else await projectsRepository.create({ ...actor, title:projectForm.title, description:projectForm.description, areaId:projectForm.areaId || undefined, goalId:projectForm.goalId || undefined, priority:projectForm.priority, startDate:projectForm.startDate || undefined, targetDate:projectForm.targetDate || undefined });
      setEditingId(null); setProjectForm(emptyProject); await refresh();
    } catch (err:any) { setError(err?.message || 'Não foi possível salvar o projeto.'); } finally { setSaving(false); }
  }

  async function submitTask(e:FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const dueAt = taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : null;
      const estimated = taskForm.estimatedMinutes ? Number(taskForm.estimatedMinutes) : null;
      const energy = taskForm.energyRequired ? Number(taskForm.energyRequired) : null;
      if (editingId) await tasksRepository.update({ ...actor, id:editingId, title:taskForm.title, description:taskForm.description, areaId:taskForm.areaId || null, projectId:taskForm.projectId || null, priority:taskForm.priority, dueAt, estimatedMinutes:estimated, energyRequired:energy, status:taskForm.status });
      else await tasksRepository.create({ ...actor, title:taskForm.title, description:taskForm.description, areaId:taskForm.areaId || undefined, projectId:taskForm.projectId || undefined, priority:taskForm.priority, dueAt:dueAt || undefined, estimatedMinutes:estimated ?? undefined, energyRequired:energy ?? undefined });
      setEditingId(null); setTaskForm(emptyTask); await refresh();
    } catch (err:any) { setError(err?.message || 'Não foi possível salvar a tarefa.'); } finally { setSaving(false); }
  }

  function editGoal(goal:GoalRecord) { setEditingId(goal.id); setGoalForm({ title:goal.title, description:goal.description || '', areaId:goal.area_id || '', priority:goal.priority || 'medium', targetDate:goal.target_date || '', successCriteria:goal.success_criteria || '', status:goal.status }); }
  function editProject(project:ProjectRecord) { setEditingId(project.id); setProjectForm({ title:project.title, description:project.description || '', areaId:project.area_id || '', goalId:project.goal_id || '', priority:project.priority || 'medium', startDate:project.start_date || '', targetDate:project.target_date || '', progress:Number(project.progress || 0), status:project.status }); }
  function editTask(task:TaskRecord) { setEditingId(task.id); setTaskForm({ title:task.title, description:task.description || '', areaId:task.area_id || '', projectId:task.project_id || '', priority:task.priority || 'medium', dueAt:task.due_at ? task.due_at.slice(0,16) : '', estimatedMinutes:task.estimated_minutes?.toString() || '', energyRequired:task.energy_required?.toString() || '', status:task.status }); }

  async function archive(kind:Tab,id:string) { setSaving(true); setError(''); try { if(kind==='goals') await goalsRepository.archive({...actor,id}); if(kind==='projects') await projectsRepository.archive({...actor,id}); if(kind==='tasks') await tasksRepository.archive({...actor,id}); await refresh(); } catch(err:any){setError(err?.message||'Não foi possível arquivar.');} finally{setSaving(false);} }
  async function restore(kind:Tab,id:string) { setSaving(true); setError(''); try { if(kind==='goals') await goalsRepository.restore({...actor,id}); if(kind==='projects') await projectsRepository.restore({...actor,id}); if(kind==='tasks') await tasksRepository.restore({...actor,id}); await refresh(); } catch(err:any){setError(err?.message||'Não foi possível restaurar.');} finally{setSaving(false);} }

  return <main style={s.page}><div style={s.shell}>
    <header style={s.header}><div><p style={s.eyebrow}>PERSONAL OS · NÚCLEO OPERACIONAL</p><h1 style={s.h1}>Metas, projetos e tarefas</h1><p style={s.sub}>Aqui o Supabase é a fonte da verdade. Criar, consultar, editar e arquivar acontece diretamente no seu workspace protegido por RLS.</p></div><Link href="/" style={s.back}>← Voltar</Link></header>
    {error ? <div style={s.error}>{error}</div> : null}
    <div style={s.toolbar}><div style={s.tabs}>{(['tasks','projects','goals'] as Tab[]).map(item=><button key={item} style={tab===item?s.tabActive:s.tab} onClick={()=>setTab(item)}>{item==='tasks'?'Tarefas':item==='projects'?'Projetos':'Metas'}</button>)}</div><div style={s.tabs}><button style={mode==='active'?s.tabActive:s.tab} onClick={()=>setMode('active')}>Ativos</button><button style={mode==='archived'?s.tabActive:s.tab} onClick={()=>setMode('archived')}>Arquivados</button></div></div>

    {mode==='active' ? <section style={s.grid}>
      <article style={s.panel}>
        {tab==='goals' && <><h2 style={s.h2}>{editingId?'Editar meta':'Nova meta'}</h2><form style={s.form} onSubmit={submitGoal}><input style={s.input} value={goalForm.title} onChange={e=>setGoalForm({...goalForm,title:e.target.value})} placeholder="Título da meta" required/><textarea style={s.textarea} value={goalForm.description} onChange={e=>setGoalForm({...goalForm,description:e.target.value})} placeholder="Descrição"/><select style={s.input} value={goalForm.areaId} onChange={e=>setGoalForm({...goalForm,areaId:e.target.value})}><option value="">Sem área</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><div style={s.two}><select style={s.input} value={goalForm.priority} onChange={e=>setGoalForm({...goalForm,priority:e.target.value})}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select><input style={s.input} type="date" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm,targetDate:e.target.value})}/></div><textarea style={s.textarea} value={goalForm.successCriteria} onChange={e=>setGoalForm({...goalForm,successCriteria:e.target.value})} placeholder="Critério de sucesso"/>{editingId?<select style={s.input} value={goalForm.status} onChange={e=>setGoalForm({...goalForm,status:e.target.value})}><option value="active">Ativa</option><option value="paused">Pausada</option><option value="achieved">Concluída</option><option value="draft">Rascunho</option></select>:null}<FormActions saving={saving} editing={Boolean(editingId)} cancel={()=>{setEditingId(null);setGoalForm(emptyGoal);}}/></form></>}
        {tab==='projects' && <><h2 style={s.h2}>{editingId?'Editar projeto':'Novo projeto'}</h2><form style={s.form} onSubmit={submitProject}><input style={s.input} value={projectForm.title} onChange={e=>setProjectForm({...projectForm,title:e.target.value})} placeholder="Título do projeto" required/><textarea style={s.textarea} value={projectForm.description} onChange={e=>setProjectForm({...projectForm,description:e.target.value})} placeholder="Resultado esperado"/><select style={s.input} value={projectForm.goalId} onChange={e=>setProjectForm({...projectForm,goalId:e.target.value})}><option value="">Sem meta vinculada</option>{goals.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select><select style={s.input} value={projectForm.areaId} onChange={e=>setProjectForm({...projectForm,areaId:e.target.value})}><option value="">Sem área</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><div style={s.two}><select style={s.input} value={projectForm.priority} onChange={e=>setProjectForm({...projectForm,priority:e.target.value})}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select><select style={s.input} value={projectForm.status} onChange={e=>setProjectForm({...projectForm,status:e.target.value})}><option value="active">Ativo</option><option value="planned">Planejado</option><option value="blocked">Bloqueado</option><option value="paused">Pausado</option><option value="done">Concluído</option></select></div><div style={s.two}><input style={s.input} type="date" value={projectForm.startDate} onChange={e=>setProjectForm({...projectForm,startDate:e.target.value})}/><input style={s.input} type="date" value={projectForm.targetDate} onChange={e=>setProjectForm({...projectForm,targetDate:e.target.value})}/></div>{editingId?<label style={s.label}>Progresso {projectForm.progress}%<input type="range" min="0" max="100" value={projectForm.progress} onChange={e=>setProjectForm({...projectForm,progress:Number(e.target.value)})}/></label>:null}<FormActions saving={saving} editing={Boolean(editingId)} cancel={()=>{setEditingId(null);setProjectForm(emptyProject);}}/></form></>}
        {tab==='tasks' && <><h2 style={s.h2}>{editingId?'Editar tarefa':'Nova tarefa'}</h2><form style={s.form} onSubmit={submitTask}><input style={s.input} value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="Título da tarefa" required/><textarea style={s.textarea} value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} placeholder="Descrição / contexto"/><select style={s.input} value={taskForm.projectId} onChange={e=>setTaskForm({...taskForm,projectId:e.target.value})}><option value="">Sem projeto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><select style={s.input} value={taskForm.areaId} onChange={e=>setTaskForm({...taskForm,areaId:e.target.value})}><option value="">Sem área</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><div style={s.two}><select style={s.input} value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select><select style={s.input} value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})}><option value="todo">A fazer</option><option value="doing">Em andamento</option><option value="blocked">Bloqueada</option><option value="done">Concluída</option><option value="cancelled">Cancelada</option></select></div><input style={s.input} type="datetime-local" value={taskForm.dueAt} onChange={e=>setTaskForm({...taskForm,dueAt:e.target.value})}/><div style={s.two}><input style={s.input} type="number" min="1" value={taskForm.estimatedMinutes} onChange={e=>setTaskForm({...taskForm,estimatedMinutes:e.target.value})} placeholder="Minutos estimados"/><select style={s.input} value={taskForm.energyRequired} onChange={e=>setTaskForm({...taskForm,energyRequired:e.target.value})}><option value="">Energia não definida</option><option value="1">Baixa</option><option value="2">Média</option><option value="3">Alta</option></select></div><FormActions saving={saving} editing={Boolean(editingId)} cancel={()=>{setEditingId(null);setTaskForm(emptyTask);}}/></form></>}
      </article>
      <article style={s.panel}><div style={s.listHead}><h2 style={s.h2}>{tab==='tasks'?'Tarefas':tab==='projects'?'Projetos':'Metas'} ativas</h2><button style={s.secondary} onClick={()=>void refresh()} disabled={loading}>Atualizar</button></div>{loading?<div style={s.empty}>Carregando…</div>:tab==='goals'?<GoalList items={goals} edit={editGoal} archive={id=>void archive('goals',id)} disabled={saving}/>:tab==='projects'?<ProjectList items={projects} goals={goals} edit={editProject} archive={id=>void archive('projects',id)} disabled={saving}/>:<TaskList items={tasks} projects={projects} edit={editTask} archive={id=>void archive('tasks',id)} disabled={saving}/>}</article>
    </section> : <section style={s.panel}><div style={s.listHead}><h2 style={s.h2}>Arquivados</h2><button style={s.secondary} onClick={()=>void refresh()}>Atualizar</button></div>{tab==='goals'?<Archived items={archivedGoals} restore={id=>void restore('goals',id)}/>:tab==='projects'?<Archived items={archivedProjects} restore={id=>void restore('projects',id)}/>:<Archived items={archivedTasks} restore={id=>void restore('tasks',id)}/>}</section>}
  </div></main>;
}

function FormActions({saving,editing,cancel}:{saving:boolean;editing:boolean;cancel:()=>void}) { return <div style={{display:'flex',gap:8}}><button style={s.primary} disabled={saving}>{saving?'Salvando…':editing?'Salvar alterações':'Criar'}</button>{editing?<button type="button" style={s.secondary} onClick={cancel}>Cancelar</button>:null}</div>; }
function GoalList({items,edit,archive,disabled}:{items:GoalRecord[];edit:(g:GoalRecord)=>void;archive:(id:string)=>void;disabled:boolean}) { if(!items.length)return <div style={s.empty}>Nenhuma meta ativa.</div>; return <div style={s.list}>{items.map(g=><Item key={g.id} title={g.title} meta={`${statusLabel(g.status)} · ${priorityLabel(g.priority)}${g.target_date?` · até ${new Date(g.target_date+'T12:00:00').toLocaleDateString('pt-BR')}`:''}`} body={g.success_criteria||g.description||''} edit={()=>edit(g)} archive={()=>archive(g.id)} disabled={disabled}/>)}</div>; }
function ProjectList({items,goals,edit,archive,disabled}:{items:ProjectRecord[];goals:GoalRecord[];edit:(p:ProjectRecord)=>void;archive:(id:string)=>void;disabled:boolean}) { if(!items.length)return <div style={s.empty}>Nenhum projeto ativo.</div>; return <div style={s.list}>{items.map(p=><Item key={p.id} title={p.title} meta={`${statusLabel(p.status)} · ${Math.round(Number(p.progress||0))}%${p.goal_id?` · ${goals.find(g=>g.id===p.goal_id)?.title||'Meta vinculada'}`:''}`} body={p.description||''} edit={()=>edit(p)} archive={()=>archive(p.id)} disabled={disabled}/>)}</div>; }
function TaskList({items,projects,edit,archive,disabled}:{items:TaskRecord[];projects:ProjectRecord[];edit:(t:TaskRecord)=>void;archive:(id:string)=>void;disabled:boolean}) { if(!items.length)return <div style={s.empty}>Nenhuma tarefa ativa.</div>; return <div style={s.list}>{items.map(t=><Item key={t.id} title={t.title} meta={`${statusLabel(t.status)} · ${priorityLabel(t.priority)}${t.project_id?` · ${projects.find(p=>p.id===t.project_id)?.title||'Projeto vinculado'}`:''}`} body={t.description||''} edit={()=>edit(t)} archive={()=>archive(t.id)} disabled={disabled}/>)}</div>; }
function Archived({items,restore}:{items:Array<{id:string;title?:string;name?:string;archived_at:string|null}>;restore:(id:string)=>void}) { if(!items.length)return <div style={s.empty}>Nada arquivado nesta seção.</div>; return <div style={s.list}>{items.map(item=><div key={item.id} style={s.row}><div><b>{item.title||item.name}</b><span style={s.meta}>Arquivado {item.archived_at?new Date(item.archived_at).toLocaleString('pt-BR'):''}</span></div><button style={s.secondary} onClick={()=>restore(item.id)}>Restaurar</button></div>)}</div>; }
function Item({title,meta,body,edit,archive,disabled}:{title:string;meta:string;body:string;edit:()=>void;archive:()=>void;disabled:boolean}) { return <div style={s.row}><div style={{minWidth:0}}><b>{title}</b><span style={s.meta}>{meta}</span>{body?<p style={s.body}>{body}</p>:null}</div><div style={{display:'flex',gap:7,flexShrink:0}}><button style={s.secondary} onClick={edit} disabled={disabled}>Editar</button><button style={s.danger} onClick={archive} disabled={disabled}>Arquivar</button></div></div>; }
function priorityLabel(value:string|null){return value==='high'?'Alta':value==='low'?'Baixa':'Média';}
function statusLabel(value:string){return ({active:'Ativo',paused:'Pausado',achieved:'Concluído',draft:'Rascunho',planned:'Planejado',blocked:'Bloqueado',done:'Concluído',todo:'A fazer',doing:'Em andamento',cancelled:'Cancelado'} as Record<string,string>)[value]||value;}

const s:Record<string,React.CSSProperties>={
  page:{minHeight:'100vh',background:'#080b10',color:'#edf1f7',fontFamily:'Inter,system-ui,sans-serif',padding:'34px 18px 90px'},shell:{maxWidth:1180,margin:'0 auto'},header:{display:'flex',justifyContent:'space-between',gap:22,alignItems:'flex-start',marginBottom:20},eyebrow:{fontSize:10,fontWeight:900,letterSpacing:'.16em',color:'#91a9e8',margin:'0 0 8px'},h1:{fontSize:36,letterSpacing:'-.04em',margin:'0 0 9px'},sub:{maxWidth:760,color:'#8e98a8',lineHeight:1.55,fontSize:14,margin:0},back:{color:'#c7d5f6',textDecoration:'none',border:'1px solid #293241',borderRadius:12,padding:'10px 13px',fontSize:13},error:{border:'1px solid #663b3b',background:'#251516',color:'#efb1b1',borderRadius:12,padding:'12px 14px',marginBottom:14,fontSize:13},toolbar:{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:16},tabs:{display:'flex',gap:7,flexWrap:'wrap'},tab:{border:'1px solid #27313f',background:'#0e131a',color:'#8995a5',borderRadius:999,padding:'9px 13px',cursor:'pointer'},tabActive:{border:'1px solid #4a5f82',background:'#182235',color:'#e4ebf9',borderRadius:999,padding:'9px 13px',cursor:'pointer'},grid:{display:'grid',gridTemplateColumns:'minmax(300px,.8fr) minmax(420px,1.2fr)',gap:16},panel:{border:'1px solid #232c38',background:'#0d1218',borderRadius:20,padding:20},h2:{fontSize:21,margin:'0 0 14px'},form:{display:'grid',gap:10},input:{border:'1px solid #293342',background:'#090d12',color:'#edf1f7',borderRadius:11,padding:'11px 12px',font:'inherit',minWidth:0},textarea:{border:'1px solid #293342',background:'#090d12',color:'#edf1f7',borderRadius:11,padding:'11px 12px',font:'inherit',minHeight:82,resize:'vertical'},two:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9},label:{fontSize:12,color:'#9aa5b4',display:'grid',gap:7},primary:{border:0,borderRadius:10,padding:'11px 14px',background:'#e3e9f6',color:'#0d1117',fontWeight:900,cursor:'pointer'},secondary:{border:'1px solid #2a3544',borderRadius:10,padding:'9px 11px',background:'#10161e',color:'#c5ceda',cursor:'pointer'},danger:{border:'1px solid #57363a',borderRadius:10,padding:'9px 11px',background:'#1a1113',color:'#dca7aa',cursor:'pointer'},listHead:{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'},list:{display:'grid',gap:9},row:{border:'1px solid #202a36',background:'#0a0f15',borderRadius:13,padding:'13px 14px',display:'flex',justifyContent:'space-between',gap:14,alignItems:'center'},meta:{display:'block',color:'#758193',fontSize:11,marginTop:4},body:{color:'#929dab',fontSize:12,lineHeight:1.5,margin:'8px 0 0'},empty:{border:'1px dashed #2a3441',borderRadius:14,padding:24,color:'#7d8897',textAlign:'center'}
};
