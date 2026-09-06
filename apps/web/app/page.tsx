'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type View = 'copilot' | 'today' | 'tasks' | 'projects' | 'inbox' | 'routines' | 'wellbeing' | 'decisions' | 'history';
type Task = { id:string; title:string; area:string; done:boolean; priority:'high'|'medium'|'low'; due?:string };
type Idea = { id:string; title:string; area:string; createdAt:string };
type Project = { id:string; title:string; area:string; progress:number; status:'active'|'paused'|'done' };
type Log = { id:string; kind:string; item:string; amount?:string; note?:string; at:string };
type CheckIn = { id:string; focus:number; energy:number; mood:number; stress:number; at:string };
type Decision = { id:string; title:string; reason:string; review?:string; at:string };
type Route = { icon:string; title:string; steps:number; progress?:number };

type Store = {
  tasks:Task[]; ideas:Idea[]; projects:Project[]; logs:Log[]; checkins:CheckIn[]; decisions:Decision[]; routines:Record<string,boolean>;
};

const initial:Store = {
  tasks:[
    {id:'t1',title:'Definir as 3 prioridades reais do dia',area:'Pessoal',done:false,priority:'high'},
    {id:'t2',title:'Mover um projeto importante por 30 minutos',area:'Trabalho',done:false,priority:'high'},
    {id:'t3',title:'Encerrar o dia com a próxima ação definida',area:'Organização',done:false,priority:'medium'},
  ],
  ideas:[],
  projects:[
    {id:'p1',title:'Personal OS',area:'Pessoal',progress:38,status:'active'},
    {id:'p2',title:'Operação e crescimento',area:'Trabalho',progress:24,status:'active'},
    {id:'p3',title:'Formação: Análise de Dados',area:'Formação',progress:40,status:'active'},
  ],
  logs:[], checkins:[], decisions:[],
  routines:{'Planejar o dia':false,'Beber água':false,'Alimentação consciente':false,'Revisar prioridades':false,'Fechamento do dia':false},
};

const nav:{id:View;label:string;icon:string}[] = [
  {id:'today',label:'Início',icon:'⌂'},
  {id:'tasks',label:'Tarefas',icon:'✓'},
  {id:'projects',label:'Projetos',icon:'▱'},
  {id:'inbox',label:'Metas e ideias',icon:'◎'},
  {id:'routines',label:'Hábitos',icon:'◌'},
  {id:'wellbeing',label:'Bem-estar',icon:'♡'},
  {id:'decisions',label:'Decisões',icon:'◇'},
  {id:'copilot',label:'Copiloto IA',icon:'✦'},
  {id:'history',label:'Histórico',icon:'≡'},
];

const routes:Route[] = [
  {icon:'🏍️',title:'Comprar uma moto',steps:9,progress:8},
  {icon:'🔧',title:'Aprender conserto de celular',steps:8},
  {icon:'💻',title:'Vender sites (negócio digital)',steps:10,progress:25},
  {icon:'🪧',title:'Melhorar placas de trilhas',steps:9},
  {icon:'🎓',title:'Fazer uma formação nova',steps:8,progress:40},
];

const nowIso = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2,9);

export default function HomePage(){
  const [view,setView]=useState<View>('copilot');
  const [store,setStore]=useState<Store>(initial);
  const [ready,setReady]=useState(false);
  const [capture,setCapture]=useState('');
  const [taskTitle,setTaskTitle]=useState('');
  const [ideaTitle,setIdeaTitle]=useState('');
  const [logKind,setLogKind]=useState('Alimentação');
  const [logItem,setLogItem]=useState('');
  const [decisionTitle,setDecisionTitle]=useState('');
  const [decisionReason,setDecisionReason]=useState('');
  const [check,setCheck]=useState({focus:5,energy:5,mood:5,stress:5});
  const [copilotPrompt,setCopilotPrompt]=useState('');
  const [copilotMessage,setCopilotMessage]=useState('');

  useEffect(()=>{
    try { const saved=localStorage.getItem('personal-os-v1'); if(saved) setStore({...initial,...JSON.parse(saved)}); } catch{}
    setReady(true);
  },[]);
  useEffect(()=>{ if(ready) localStorage.setItem('personal-os-v1',JSON.stringify(store)); },[store,ready]);

  const today = new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const openTasks=store.tasks.filter(t=>!t.done);
  const doneToday=store.tasks.filter(t=>t.done).length;
  const lastCheck=store.checkins[0];
  const routineDone=Object.values(store.routines).filter(Boolean).length;
  const activeProjects=store.projects.filter(p=>p.status==='active');
  const attention = useMemo(()=>{
    if(lastCheck?.stress>=8) return 'Seu estresse está alto. Reduza o escopo antes de aumentar a velocidade.';
    if(openTasks.filter(t=>t.priority==='high').length>3) return 'Há prioridades demais competindo entre si. Escolha no máximo três para hoje.';
    if(store.ideas.length>6) return 'Sua caixa de ideias está crescendo. Hoje vale revisar antes de começar algo novo.';
    if(lastCheck?.energy<=3) return 'Energia baixa registrada. Prefira tarefas curtas e decisões simples.';
    return 'Proteja sua atenção: avance o que já está em movimento antes de abrir novas frentes.';
  },[lastCheck,openTasks,store.ideas.length]);

  function quickCapture(e:FormEvent){ e.preventDefault(); const v=capture.trim(); if(!v)return; setStore(s=>({...s,ideas:[{id:uid(),title:v,area:'Inbox',createdAt:nowIso()},...s.ideas]})); setCapture(''); }
  function addTask(e:FormEvent){e.preventDefault();if(!taskTitle.trim())return;setStore(s=>({...s,tasks:[{id:uid(),title:taskTitle.trim(),area:'Pessoal',done:false,priority:'medium'},...s.tasks]}));setTaskTitle('');}
  function addIdea(e:FormEvent){e.preventDefault();if(!ideaTitle.trim())return;setStore(s=>({...s,ideas:[{id:uid(),title:ideaTitle.trim(),area:'Inbox',createdAt:nowIso()},...s.ideas]}));setIdeaTitle('');}
  function addLog(e:FormEvent){e.preventDefault();if(!logItem.trim())return;setStore(s=>({...s,logs:[{id:uid(),kind:logKind,item:logItem.trim(),at:nowIso()},...s.logs]}));setLogItem('');}
  function addDecision(e:FormEvent){e.preventDefault();if(!decisionTitle.trim())return;setStore(s=>({...s,decisions:[{id:uid(),title:decisionTitle.trim(),reason:decisionReason.trim(),at:nowIso()},...s.decisions]}));setDecisionTitle('');setDecisionReason('');}
  function saveCheck(){setStore(s=>({...s,checkins:[{id:uid(),...check,at:nowIso()},...s.checkins]}));}
  function askCopilot(e:FormEvent){
    e.preventDefault();
    const v=copilotPrompt.trim();
    if(!v)return;
    setCopilotMessage(`Entendi: “${v}”. A integração com a IA será conectada na próxima etapa. O painel e o fluxo de contexto já estão preparados para receber a resposta.`);
    setCopilotPrompt('');
  }

  const heading = view==='today'?'Bom dia. Vamos escolher o que importa.':view==='copilot'?'Copiloto IA':nav.find(n=>n.id===view)?.label;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">⌁</div><div><b>Personal OS</b><small>Vida intencional, resultados reais.</small></div></div>
      <nav>{nav.map(n=><button key={n.id} className={view===n.id?'nav-item active':'nav-item'} onClick={()=>setView(n.id)}><span>{n.icon}</span>{n.label}{n.id==='inbox'&&store.ideas.length>0?<em>{store.ideas.length}</em>:null}</button>)}</nav>
      <div className="sidebar-quote">“Disciplina hoje.<br/>Liberdade amanhã.”</div>
    </aside>

    <main className={view==='copilot'?'workspace workspace-copilot':'workspace'}>
      <header className={view==='copilot'?'topbar compact':'topbar'}>
        <div><p className="eyebrow">PERSONAL OS · {view==='copilot'?'IA':view.toUpperCase()}</p><h1>{heading}</h1>{view==='copilot'?<p className="date">Seu parceiro de planejamento, decisão e execução.</p>:<p className="date">{today}</p>}</div>
        {view==='copilot'?<div className="ai-budget"><div><span>Uso da IA este mês</span><b>US$ 1,84 <small>/ US$ 10,00</small></b></div><div className="budget-bar"><i style={{width:'18%'}}/></div><em>18%</em></div>:<form className="capture" onSubmit={quickCapture}><input value={capture} onChange={e=>setCapture(e.target.value)} placeholder="Capture uma ideia, pensamento ou lembrete…"/><button>＋</button></form>}
      </header>

      {view==='copilot' && <CopilotDashboard prompt={copilotPrompt} setPrompt={setCopilotPrompt} onSubmit={askCopilot} message={copilotMessage} setView={setView} projects={store.projects}/>} 

      {view==='today' && <>
        <section className="stats-row"><Stat label="Em aberto" value={openTasks.length} hint="tarefas"/><Stat label="Concluídas" value={doneToday} hint="neste painel"/><Stat label="Rotina" value={`${routineDone}/${Object.keys(store.routines).length}`} hint="checkpoints"/><Stat label="Projetos" value={activeProjects.length} hint="ativos"/></section>
        <section className="dashboard-grid">
          <Panel cls="span-7" title="Foco de hoje" kicker="EXECUÇÃO"><div className="task-stack">{openTasks.slice(0,5).map(t=><TaskRow key={t.id} task={t} toggle={()=>setStore(s=>({...s,tasks:s.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))}/>)}</div><button className="text-btn" onClick={()=>setView('tasks')}>Ver todas as tarefas →</button></Panel>
          <Panel cls="span-5 chief" title="Chief of Staff" kicker="CLAREZA"><div className="orb">✦</div><p className="chief-text">{attention}</p><div className="recommendation"><b>Próxima melhor ação</b><span>{openTasks[0]?.title || 'Faça um check-in e escolha uma prioridade.'}</span></div></Panel>
          <Panel cls="span-4" title="Estado atual" kicker="CHECK-IN"><div className="state-grid">{(['focus','energy','mood','stress'] as const).map(k=><div key={k}><span>{({focus:'Foco',energy:'Energia',mood:'Humor',stress:'Estresse'} as const)[k]}</span><b>{lastCheck?lastCheck[k]:'—'}</b><small>/10</small></div>)}</div><button className="primary" onClick={()=>setView('wellbeing')}>Fazer check-in</button></Panel>
          <Panel cls="span-4" title="Projetos em movimento" kicker="PROGRESSO">{activeProjects.slice(0,3).map(p=><div className="project-mini" key={p.id}><div><b>{p.title}</b><span>{p.area}</span></div><em>{p.progress}%</em><div className="bar"><i style={{width:`${p.progress}%`}}/></div></div>)}<button className="text-btn" onClick={()=>setView('projects')}>Abrir projetos →</button></Panel>
          <Panel cls="span-4" title="Rotina de hoje" kicker="RITMO">{Object.entries(store.routines).slice(0,5).map(([r,v])=><label className="routine-line" key={r}><input type="checkbox" checked={v} onChange={()=>setStore(s=>({...s,routines:{...s.routines,[r]:!v}}))}/><span>{r}</span></label>)}</Panel>
        </section>
      </>}

      {view==='tasks' && <section className="content-grid"><Panel cls="span-8" title="Tarefas" kicker="EXECUÇÃO"><form className="inline-form" onSubmit={addTask}><input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Nova tarefa…"/><button className="primary">Adicionar</button></form><div className="task-stack">{store.tasks.map(t=><TaskRow key={t.id} task={t} toggle={()=>setStore(s=>({...s,tasks:s.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))}/>)}</div></Panel><Panel cls="span-4" title="Regra de prioridade" kicker="SISTEMA"><p className="body-copy">Uma boa ideia não vira compromisso automaticamente. Hoje só entram aqui tarefas que merecem execução.</p><div className="rule">Máximo recomendado<br/><b>3 prioridades altas</b></div></Panel></section>}

      {view==='projects' && <section className="content-grid">{store.projects.map(p=><Panel key={p.id} cls="span-6 project-card" title={p.title} kicker={p.area.toUpperCase()}><div className="project-big"><b>{p.progress}%</b><span>{p.status==='active'?'Em andamento':'Pausado'}</span></div><div className="bar large"><i style={{width:`${p.progress}%`}}/></div><input className="range" type="range" min="0" max="100" value={p.progress} onChange={e=>setStore(s=>({...s,projects:s.projects.map(x=>x.id===p.id?{...x,progress:+e.target.value}:x)}))}/></Panel>)}</section>}

      {view==='inbox' && <section className="content-grid"><Panel cls="span-8" title="Metas e ideias" kicker="CAPTURAR ≠ COMPROMETER"><form className="inline-form" onSubmit={addIdea}><input value={ideaTitle} onChange={e=>setIdeaTitle(e.target.value)} placeholder="O que você quer conquistar ou explorar?"/><button className="primary">Capturar</button></form>{store.ideas.length===0?<Empty text="Sua cabeça pode soltar as ideias aqui. Elas não viram tarefas até você decidir."/>:store.ideas.map(i=><div className="idea-row" key={i.id}><div><b>{i.title}</b><span>{i.area} · {new Date(i.createdAt).toLocaleDateString('pt-BR')}</span></div><button onClick={()=>{setStore(s=>({...s,tasks:[{id:uid(),title:i.title,area:'Pessoal',done:false,priority:'medium'},...s.tasks],ideas:s.ideas.filter(x=>x.id!==i.id)}))}}>Virar tarefa</button></div>)}</Panel><Panel cls="span-4" title="Filtro mental" kicker="CHIEF OF STAFF"><p className="body-copy">Antes de promover uma ideia, pergunte: isso serve a um objetivo atual ou é apenas interessante?</p><div className="big-number">{store.ideas.length}</div><span className="muted">ideias aguardando revisão</span></Panel></section>}

      {view==='routines' && <section className="content-grid"><Panel cls="span-7" title="Ritmo diário" kicker="HÁBITOS"><div className="routine-list">{Object.entries(store.routines).map(([r,v])=><label className={v?'routine-card done':'routine-card'} key={r}><input type="checkbox" checked={v} onChange={()=>setStore(s=>({...s,routines:{...s.routines,[r]:!v}}))}/><div><b>{r}</b><span>{v?'Concluído hoje':'Aguardando'}</span></div><strong>{v?'✓':'○'}</strong></label>)}</div></Panel><Panel cls="span-5" title="Princípio" kicker="CONSISTÊNCIA"><p className="quote">“Rotina boa não aperta. Ela reduz decisões desnecessárias.”</p><div className="completion"><b>{Math.round(routineDone/Object.keys(store.routines).length*100)}%</b><span>do ritmo de hoje</span></div></Panel></section>}

      {view==='wellbeing' && <section className="content-grid"><Panel cls="span-7" title="Check-in" kicker="COMO VOCÊ ESTÁ AGORA?"><div className="sliders">{(['focus','energy','mood','stress'] as const).map(k=><label key={k}><span>{({focus:'Foco',energy:'Energia',mood:'Humor',stress:'Estresse'} as const)[k]} <b>{check[k]}/10</b></span><input type="range" min="1" max="10" value={check[k]} onChange={e=>setCheck({...check,[k]:+e.target.value})}/></label>)}</div><button className="primary" onClick={saveCheck}>Salvar check-in</button></Panel><Panel cls="span-5" title="Registrar consumo" kicker="CONTEXTO, NÃO JULGAMENTO"><form className="stack-form" onSubmit={addLog}><select value={logKind} onChange={e=>setLogKind(e.target.value)}><option>Alimentação</option><option>Hidratação</option><option>Medicamento</option><option>Estimulante</option><option>Substância</option><option>Álcool</option><option>Cafeína</option><option>Açúcar</option><option>Suplemento</option></select><input value={logItem} onChange={e=>setLogItem(e.target.value)} placeholder="Item / descrição"/><button className="primary">Registrar</button></form><p className="microcopy">O sistema registra contexto e percepção. Ele não substitui orientação médica.</p></Panel><Panel cls="span-12" title="Registros recentes" kicker="TIMELINE">{store.logs.length===0?<Empty text="Nenhum consumo registrado ainda."/>:store.logs.slice(0,10).map(l=><div className="history-row" key={l.id}><span className="tag">{l.kind}</span><b>{l.item}</b><time>{new Date(l.at).toLocaleString('pt-BR')}</time></div>)}</Panel></section>}

      {view==='decisions' && <section className="content-grid"><Panel cls="span-7" title="Registro de decisões" kicker="DECIDIR UMA VEZ"><form className="stack-form" onSubmit={addDecision}><input value={decisionTitle} onChange={e=>setDecisionTitle(e.target.value)} placeholder="Qual decisão foi tomada?"/><textarea value={decisionReason} onChange={e=>setDecisionReason(e.target.value)} placeholder="Por quê? Qual contexto levou a ela?"/><button className="primary">Registrar decisão</button></form></Panel><Panel cls="span-5" title="Por que registrar?" kicker="MEMÓRIA EXTERNA"><p className="body-copy">Decisões registradas evitam reabrir mentalmente o mesmo problema toda semana. Se algo mudar, você revisa com contexto.</p></Panel><Panel cls="span-12" title="Decisões anteriores" kicker="LOG">{store.decisions.length===0?<Empty text="Nenhuma decisão registrada."/>:store.decisions.map(d=><div className="decision-row" key={d.id}><div><b>{d.title}</b><p>{d.reason}</p></div><time>{new Date(d.at).toLocaleDateString('pt-BR')}</time></div>)}</Panel></section>}

      {view==='history' && <section className="content-grid"><Panel cls="span-12" title="Linha do tempo" kicker="APRENDER COM PADRÕES">{[...store.checkins.map(c=>({at:c.at,type:'Check-in',text:`Foco ${c.focus} · Energia ${c.energy} · Humor ${c.mood} · Estresse ${c.stress}`})),...store.logs.map(l=>({at:l.at,type:l.kind,text:l.item})),...store.decisions.map(d=>({at:d.at,type:'Decisão',text:d.title}))].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,30).map((e,i)=><div className="timeline" key={e.at+i}><i/><div><span>{e.type}</span><b>{e.text}</b><time>{new Date(e.at).toLocaleString('pt-BR')}</time></div></div>)}</Panel></section>}
    </main>

    <nav className="mobile-nav">{nav.slice(0,5).map(n=><button key={n.id} className={view===n.id?'active':''} onClick={()=>setView(n.id)}><span>{n.icon}</span><small>{n.label}</small></button>)}</nav>
  </div>;
}

function CopilotDashboard({prompt,setPrompt,onSubmit,message,setView,projects}:{prompt:string;setPrompt:(v:string)=>void;onSubmit:(e:FormEvent)=>void;message:string;setView:(v:View)=>void;projects:Project[]}){
  return <div className="copilot-layout">
    <div className="copilot-main">
      <section className="ai-hero">
        <div className="hero-copy"><span>✦ Boa noite!</span><h2>O que você quer conquistar, resolver<br/>ou entender hoje?</h2></div>
        <form className="ai-prompt" onSubmit={onSubmit}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={'Ex.: “Quero comprar uma moto. Me ajude a criar um plano com etapas, custos e checklist.”'}/><div className="prompt-actions"><div><button type="button">＋</button><button type="button" className="tool-chip">⚒ Ferramentas⌄</button><button type="button">◎</button></div><button className="send-btn" aria-label="Enviar">➤</button></div></form>
        <div className="quick-actions"><button onClick={()=>setPrompt('Qual é minha próxima melhor ação hoje?')}>▣ Sugerir próxima ação</button><button onClick={()=>setPrompt('Quero criar uma nova rota para um objetivo.')}>▣ Criar uma rota</button><button onClick={()=>setPrompt('Analise minha situação atual e meus principais bloqueios.')}>♙ Analisar minha situação</button><button onClick={()=>setPrompt('Compare duas opções para mim com critérios e trade-offs.')}>◫ Comparar opções</button><button onClick={()=>setPrompt('Resuma meus principais aprendizados recentes.')}>▤ Resumir aprendizados</button></div>
        {message&&<div className="demo-response"><span>✦</span><p>{message}</p></div>}
      </section>

      <section className="section-block"><div className="section-title"><div><h3>Rotas populares</h3><p>Comece com um modelo ou crie a sua.</p></div><button>Ver todas →</button></div><div className="route-grid">{routes.map(r=><button className="route-card" key={r.title} onClick={()=>setPrompt(`Crie uma rota completa para: ${r.title}`)}><span>{r.icon}</span><b>{r.title}</b><small>{r.steps} etapas</small></button>)}<button className="route-card create-route" onClick={()=>setPrompt('Quero criar uma rota personalizada.')}><span>＋</span><b>Criar rota personalizada</b></button></div></section>

      <div className="copilot-cards">
        <article className="copilot-card next-action"><div className="card-title"><span>💡</span><div><h3>Minha próxima melhor ação</h3><p>Com base nos seus objetivos e contexto atual.</p></div></div><div className="next-action-inner"><span className="action-icon">🏍️</span><div className="action-copy"><b>Pesquisar modelos de moto dentro do seu orçamento</b><p>Você já definiu sua faixa de orçamento. Agora é hora de comparar modelos que atendem suas necessidades.</p><div className="chips"><span>Comprar uma moto</span><span className="hot">Alta prioridade</span><span>◷ ~ 30 min</span></div></div></div><div className="card-actions"><button className="primary glow">✧ Ver checklist completo</button><button>◉ Marcar como concluída</button></div></article>
        <article className="copilot-card radar-card"><div className="card-title"><span>◈</span><div><h3>Radar da vida</h3><p>Pontos de atenção e oportunidades.</p></div></div><div className="radar-list"><button><i className="red">●</i><span>3 projetos travados</span><b>→</b></button><button><i className="yellow">●</i><span>2 metas sem progresso há 14 dias</span><b>→</b></button><button><i className="green">●</i><span>Finanças estáveis</span><b>→</b></button><button><i className="red">●</i><span>5 tarefas importantes em atraso</span><b>→</b></button><button><i className="green">●</i><span>Hábitos em boa fase</span><b>→</b></button></div></article>
      </div>

      <div className="copilot-cards bottom-cards"><article className="copilot-card"><div className="section-title tight"><div><h3>Em andamento</h3><p>Suas rotas e planos ativos.</p></div><button onClick={()=>setView('projects')}>Ver todos →</button></div><div className="progress-list">{projects.slice(0,3).map((p,i)=><div className="progress-row" key={p.id}><span>{['🏍️','💻','🎓'][i]||'◆'}</span><div><b>{p.title}</b><div className="bar"><i style={{width:`${p.progress}%`}}/></div></div><em>{p.progress}%</em><small>Atualizado hoje</small><strong>›</strong></div>)}</div></article><article className="copilot-card evolution"><div className="card-title"><span>◉</span><div><h3>Evolução recente</h3><p>Seu progresso nos últimos 30 dias.</p></div></div><div className="evolution-grid"><div><b>12</b><span>tarefas concluídas</span><em>↑ 20%</em></div><div><b>4</b><span>metas em progresso</span><em>↑ 33%</em></div><div><b>18</b><span>dias de hábitos</span><em>↑ 50%</em></div><div><b>3</b><span>novos aprendizados</span><em>↑ 200%</em></div></div></article></div>
    </div>

    <aside className="copilot-side">
      <article className="side-card transparency"><div className="side-title"><span>◉</span><h3>Resposta da IA</h3></div><p>Sempre que eu sugerir algo, você verá:</p><ul><li>⚭ O que estou recomendando</li><li>▣ Por que estou recomendando</li><li>▤ Fontes e boas práticas (quando houver)</li><li>◷ Suposições que considerei</li><li>♟ Nível de confiança</li></ul><div className="approval-note"><b>🛡 Você sempre decide.</b><span>Nada será executado sem sua aprovação.</span></div></article>
      <article className="side-card examples"><h3>Exemplos do que você pode pedir</h3>{['Crie um plano para comprar uma moto','Quais são os melhores cursos para aprender conserto de celular?','Me ajude a estruturar a venda de sites','Analise minha situação financeira','Qual é minha próxima melhor ação hoje?'].map(x=><button key={x} onClick={()=>setPrompt(x)}>› “{x}”</button>)}</article>
      <article className="side-card knowledge"><div className="side-title"><span>◉</span><h3>Base de conhecimento</h3></div><p>Respostas baseadas em:</p><ul><li>✓ Boas práticas e referências reconhecidas</li><li>✓ Livros e metodologias comprovadas</li><li>✓ Seu contexto e dados do Personal OS</li><li>✓ Análise transparente e explicável</li></ul><button>Saiba mais sobre a IA no Personal OS →</button></article>
      <div className="mountain-signature"><div>⛰</div><span>Mais clareza.<br/><b>Melhores decisões.</b><br/>Uma vida mais intencional.</span></div>
    </aside>
  </div>
}

function Panel({title,kicker,children,cls=''}:{title:string;kicker:string;children:React.ReactNode;cls?:string}){return <article className={`panel ${cls}`}><div className="panel-head"><div><span>{kicker}</span><h2>{title}</h2></div><i>•••</i></div>{children}</article>}
function Stat({label,value,hint}:{label:string;value:string|number;hint:string}){return <div className="stat"><span>{label}</span><b>{value}</b><small>{hint}</small></div>}
function TaskRow({task,toggle}:{task:Task;toggle:()=>void}){return <label className={task.done?'task-row done':'task-row'}><input type="checkbox" checked={task.done} onChange={toggle}/><div><b>{task.title}</b><span>{task.area} · <i className={`priority ${task.priority}`}>{task.priority==='high'?'alta':task.priority==='medium'?'média':'baixa'}</i></span></div><em>›</em></label>}
function Empty({text}:{text:string}){return <div className="empty"><span>✦</span><p>{text}</p></div>}
