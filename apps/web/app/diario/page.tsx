'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type JournalEntry = {
  id: string;
  area: string;
  type: string;
  text: string;
  status: string;
  createdAt: string;
};

const seed: JournalEntry[] = [
  {
    id: 'journal-content-collab-2026-08-28',
    area: 'Conteúdo / Parcerias',
    type: 'Ideia de formato',
    text: 'Criar conteúdos online a partir de conversas com outras pessoas — amigos, clientes e parceiros — convidando-as para participar de bate-papos que possam ser gravados presencialmente ou online, por videochamada, e depois transformados em conteúdo.',
    status: 'Ideia em exploração',
    createdAt: '2026-08-28T21:05:00-03:00',
  },
  {
    id: 'journal-relationship-2026-08-28',
    area: 'Relacionamento',
    type: 'Reflexão / Insatisfação',
    text: 'Insatisfação com o que ela tem feito nas LIVES.',
    status: 'Em reflexão',
    createdAt: '2026-08-28T20:59:00-03:00',
  },
];

const areas = ['Relacionamento', 'Conteúdo / Parcerias', 'Trabalho', 'Pessoal', 'Família', 'Emoções', 'Saúde', 'Ideias', 'Reflexões'];
const types = ['Reflexão', 'Insatisfação', 'Ideia de formato', 'Acontecimento', 'Sentimento', 'Aprendizado', 'Conversa', 'Gratidão', 'Nota livre'];

const uid = () => Math.random().toString(36).slice(2, 10);

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(seed);
  const [ready, setReady] = useState(false);
  const [area, setArea] = useState('Relacionamento');
  const [type, setType] = useState('Reflexão');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('personal-os-journal-v1');
      if (saved) {
        const parsed = JSON.parse(saved) as JournalEntry[];
        const missingSeeds = seed.filter(item => !parsed.some(e => e.id === item.id));
        setEntries([...missingSeeds, ...parsed]);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem('personal-os-journal-v1', JSON.stringify(entries));
  }, [entries, ready]);

  const visible = useMemo(
    () => entries.filter(e => filter === 'Todos' || e.area === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries, filter]
  );

  function addEntry(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setEntries(current => [{
      id: uid(),
      area,
      type,
      text: text.trim(),
      status: 'Em reflexão',
      createdAt: new Date().toISOString(),
    }, ...current]);
    setText('');
  }

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>PERSONAL OS · DIÁRIO</p>
          <h1 style={s.title}>Um lugar para perceber antes de decidir.</h1>
          <p style={s.subtitle}>Registrar não cria uma tarefa. Primeiro você observa; depois decide se algo merece ação.</p>
        </div>
        <Link href="/" style={s.back}>← Voltar ao painel</Link>
      </header>

      <section style={s.grid}>
        <article style={{...s.card, gridColumn:'span 5'}}>
          <p style={s.kicker}>NOVO REGISTRO</p>
          <h2 style={s.h2}>Escreva sem transformar tudo em obrigação</h2>
          <form onSubmit={addEntry} style={s.form}>
            <label style={s.label}>Área
              <select value={area} onChange={e=>setArea(e.target.value)} style={s.input}>{areas.map(a=><option key={a}>{a}</option>)}</select>
            </label>
            <label style={s.label}>Tipo
              <select value={type} onChange={e=>setType(e.target.value)} style={s.input}>{types.map(t=><option key={t}>{t}</option>)}</select>
            </label>
            <label style={s.label}>Registro
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="O que aconteceu, o que você sentiu ou o que está percebendo?" style={{...s.input,minHeight:170,resize:'vertical'}} />
            </label>
            <button style={s.primary}>Salvar no diário</button>
          </form>
        </article>

        <article style={{...s.card, gridColumn:'span 7'}}>
          <div style={s.cardHead}>
            <div><p style={s.kicker}>HISTÓRICO</p><h2 style={s.h2}>Registros</h2></div>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...s.input,width:'auto'}}>
              <option>Todos</option>{areas.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={s.entries}>
            {visible.map(entry=><div key={entry.id} style={s.entry}>
              <div style={s.tags}><span style={s.tag}>{entry.area}</span><span style={s.tagMuted}>{entry.type}</span></div>
              <p style={s.entryText}>{entry.text}</p>
              <div style={s.meta}><span>{entry.status}</span><time>{new Date(entry.createdAt).toLocaleString('pt-BR')}</time></div>
            </div>)}
          </div>
        </article>
      </section>
    </main>
  );
}

const s: Record<string, any> = {
  page:{maxWidth:1280,margin:'0 auto',padding:'52px 28px 100px',minHeight:'100vh'},
  header:{display:'flex',justifyContent:'space-between',gap:32,alignItems:'flex-start',marginBottom:34},
  eyebrow:{fontSize:12,fontWeight:800,letterSpacing:'.17em',color:'#9db8ff',margin:'0 0 10px'},
  title:{fontSize:'clamp(38px,6vw,72px)',letterSpacing:'-.045em',lineHeight:.98,maxWidth:780,margin:'0 0 16px'},
  subtitle:{fontSize:17,lineHeight:1.6,color:'#8f98a7',maxWidth:680,margin:0},
  back:{border:'1px solid #242b36',borderRadius:13,padding:'11px 14px',color:'#f2f4f7',textDecoration:'none',whiteSpace:'nowrap'},
  grid:{display:'grid',gridTemplateColumns:'repeat(12,minmax(0,1fr))',gap:18},
  card:{background:'linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.015))',border:'1px solid #242b36',borderRadius:24,padding:24,boxShadow:'0 24px 80px rgba(0,0,0,.18)'},
  kicker:{fontSize:11,fontWeight:800,letterSpacing:'.14em',color:'#8f98a7',margin:'0 0 8px'},
  h2:{fontSize:25,letterSpacing:'-.025em',margin:'0 0 20px'},
  form:{display:'grid',gap:15},
  label:{display:'grid',gap:8,fontSize:13,fontWeight:700,color:'#b7bfca'},
  input:{width:'100%',background:'#0d1117',border:'1px solid #2a313d',borderRadius:12,padding:'12px 13px',color:'#f2f4f7',font:'inherit',outline:'none'},
  primary:{border:0,borderRadius:12,padding:'13px 16px',background:'#e8edf9',color:'#10141b',fontWeight:800,cursor:'pointer'},
  cardHead:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:15},
  entries:{display:'grid',gap:12},
  entry:{padding:18,border:'1px solid #242b36',background:'rgba(255,255,255,.018)',borderRadius:16},
  tags:{display:'flex',gap:8,flexWrap:'wrap'},
  tag:{fontSize:11,fontWeight:800,padding:'5px 8px',borderRadius:999,background:'rgba(157,184,255,.14)',color:'#b8cbff'},
  tagMuted:{fontSize:11,fontWeight:700,padding:'5px 8px',borderRadius:999,background:'#171c24',color:'#9da6b4'},
  entryText:{fontSize:18,lineHeight:1.55,margin:'14px 0 18px'},
  meta:{display:'flex',justifyContent:'space-between',gap:16,fontSize:12,color:'#788393'},
};
