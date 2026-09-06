import type { GoalArchetype } from './model';

export type ArchetypeDefinition = {
  id: GoalArchetype;
  label: string;
  description: string;
  discoveryQuestions: string[];
  defaultChapters: Array<{ title: string; purpose: string }>;
  preferredMetrics: string[];
};

const definitions: Record<GoalArchetype, ArchetypeDefinition> = {
  acquire: {
    id: 'acquire',
    label: 'Adquirir algo',
    description: 'Comprar, conquistar ou obter um bem, acesso ou recurso.',
    discoveryQuestions: ['O que exatamente você quer adquirir?', 'Qual orçamento existe hoje?', 'Existe prazo?', 'Quais custos recorrentes vêm depois da aquisição?'],
    defaultChapters: [
      { title: 'Prontidão', purpose: 'Entender necessidade, requisitos e condição atual.' },
      { title: 'Viabilidade', purpose: 'Validar orçamento, alternativas, riscos e custo total.' },
      { title: 'Pesquisa', purpose: 'Comparar opções com critérios objetivos.' },
      { title: 'Aquisição', purpose: 'Executar a compra/obtenção com segurança.' },
      { title: 'Sustentação', purpose: 'Integrar o novo recurso à vida e controlar custos posteriores.' },
    ],
    preferredMetrics: ['valor acumulado', 'percentual do orçamento', 'opções validadas', 'custo mensal pós-aquisição'],
  },
  learn: {
    id: 'learn',
    label: 'Aprender uma habilidade',
    description: 'Desenvolver conhecimento e competência comprovável.',
    discoveryQuestions: ['Qual habilidade e em que nível?', 'Para que você quer usá-la?', 'Quanto tempo por semana existe?', 'Como a competência poderá ser demonstrada na prática?'],
    defaultChapters: [
      { title: 'Mapa da habilidade', purpose: 'Definir o que precisa ser aprendido e o nível desejado.' },
      { title: 'Fundamentos', purpose: 'Construir base mínima sem excesso de teoria.' },
      { title: 'Prática guiada', purpose: 'Executar exercícios reais e receber feedback.' },
      { title: 'Projetos reais', purpose: 'Aplicar a habilidade em situações completas.' },
      { title: 'Validação', purpose: 'Demonstrar competência e identificar lacunas.' },
      { title: 'Continuidade', purpose: 'Consolidar e manter a habilidade.' },
    ],
    preferredMetrics: ['horas de prática', 'projetos concluídos', 'erros resolvidos', 'nível de autonomia'],
  },
  build: {
    id: 'build',
    label: 'Construir / criar',
    description: 'Criar um produto, sistema, projeto ou resultado concreto.',
    discoveryQuestions: ['O que deve existir no final?', 'Quem vai usar?', 'Qual é a versão mínima útil?', 'Quais recursos e dependências existem?'],
    defaultChapters: [
      { title: 'Definição', purpose: 'Definir resultado, usuário e critério de sucesso.' },
      { title: 'Fundação', purpose: 'Preparar arquitetura, recursos e dependências.' },
      { title: 'Versão mínima', purpose: 'Entregar a menor versão que resolve o problema.' },
      { title: 'Validação', purpose: 'Testar o resultado no mundo real.' },
      { title: 'Evolução', purpose: 'Corrigir lacunas e ampliar o que demonstrou valor.' },
    ],
    preferredMetrics: ['marcos entregues', 'itens validados', 'tempo até primeira versão', 'feedback útil'],
  },
  improve: {
    id: 'improve',
    label: 'Melhorar algo existente',
    description: 'Aumentar desempenho, qualidade, eficiência ou resultado de algo que já existe.',
    discoveryQuestions: ['O que está ruim hoje?', 'Qual resultado deve melhorar?', 'Qual é a linha de base?', 'O que não pode piorar no processo?'],
    defaultChapters: [
      { title: 'Diagnóstico', purpose: 'Medir a situação atual e localizar gargalos.' },
      { title: 'Hipóteses', purpose: 'Escolher mudanças com maior impacto provável.' },
      { title: 'Experimentos', purpose: 'Testar melhorias em escala controlada.' },
      { title: 'Padronização', purpose: 'Incorporar o que funcionou.' },
      { title: 'Revisão', purpose: 'Comparar resultado final com a linha de base.' },
    ],
    preferredMetrics: ['baseline', 'ganho percentual', 'tempo economizado', 'qualidade', 'custo'],
  },
  stabilize: {
    id: 'stabilize',
    label: 'Estabilizar uma situação',
    description: 'Sair de um estado instável e criar uma base sustentável.',
    discoveryQuestions: ['O que está instável?', 'Qual risco precisa ser reduzido primeiro?', 'Qual é o mínimo aceitável de estabilidade?', 'Quais compromissos não podem ser interrompidos?'],
    defaultChapters: [
      { title: 'Contenção', purpose: 'Reduzir riscos e interromper deterioração.' },
      { title: 'Base mínima', purpose: 'Garantir recursos essenciais e previsibilidade.' },
      { title: 'Regularização', purpose: 'Resolver pendências estruturais.' },
      { title: 'Reserva', purpose: 'Criar margem contra novos imprevistos.' },
      { title: 'Crescimento', purpose: 'Só então retomar expansão.' },
    ],
    preferredMetrics: ['risco reduzido', 'reserva', 'pendências resolvidas', 'previsibilidade'],
  },
  decide: {
    id: 'decide',
    label: 'Tomar uma decisão',
    description: 'Escolher entre alternativas com critérios, evidências e trade-offs explícitos.',
    discoveryQuestions: ['Qual decisão precisa ser tomada?', 'Quais opções existem?', 'Quais critérios importam?', 'Até quando a decisão precisa acontecer?'],
    defaultChapters: [
      { title: 'Enquadramento', purpose: 'Definir a decisão e o que realmente está em jogo.' },
      { title: 'Alternativas', purpose: 'Construir opções reais, inclusive não agir.' },
      { title: 'Evidências', purpose: 'Buscar informação suficiente para reduzir incerteza.' },
      { title: 'Comparação', purpose: 'Avaliar opções pelos mesmos critérios.' },
      { title: 'Decisão e revisão', purpose: 'Registrar escolha, premissas e data de revisão.' },
    ],
    preferredMetrics: ['alternativas avaliadas', 'incertezas críticas', 'critérios atendidos'],
  },
  experience: {
    id: 'experience',
    label: 'Viver uma experiência',
    description: 'Planejar e realizar uma experiência, viagem, evento ou marco pessoal.',
    discoveryQuestions: ['Qual experiência?', 'Com quem?', 'Quando?', 'Qual orçamento e quais restrições existem?'],
    defaultChapters: [
      { title: 'Intenção', purpose: 'Definir o que faria a experiência valer a pena.' },
      { title: 'Viabilidade', purpose: 'Checar datas, custos, logística e requisitos.' },
      { title: 'Preparação', purpose: 'Reservar, comprar e organizar o necessário.' },
      { title: 'Experiência', purpose: 'Executar sem transformar tudo em checklist.' },
      { title: 'Registro', purpose: 'Guardar aprendizados e memórias úteis.' },
    ],
    preferredMetrics: ['orçamento', 'itens preparados', 'reservas concluídas'],
  },
  habit: {
    id: 'habit',
    label: 'Criar uma rotina',
    description: 'Construir consistência com baixa fricção e adaptação ao contexto.',
    discoveryQuestions: ['Qual comportamento?', 'Por que ele importa?', 'Qual frequência é realista?', 'Qual é a versão mínima para dias ruins?'],
    defaultChapters: [
      { title: 'Desenho', purpose: 'Definir gatilho, frequência e versão mínima.' },
      { title: 'Primeira semana', purpose: 'Reduzir fricção e observar obstáculos.' },
      { title: 'Ajuste', purpose: 'Adaptar duração, horário e ambiente.' },
      { title: 'Consistência', purpose: 'Acumular repetições sem punição por falhas.' },
      { title: 'Manutenção', purpose: 'Manter útil e evitar rotina automática sem propósito.' },
    ],
    preferredMetrics: ['repetições', 'taxa de aderência', 'fricção percebida', 'versão mínima usada'],
  },
  financial: {
    id: 'financial',
    label: 'Objetivo financeiro',
    description: 'Atingir uma condição financeira mensurável sem confundir recomendação com garantia.',
    discoveryQuestions: ['Qual valor ou condição?', 'Qual horizonte?', 'Qual capacidade mensal atual?', 'Quais obrigações e reservas precisam ser respeitadas?'],
    defaultChapters: [
      { title: 'Linha de base', purpose: 'Entender números atuais e restrições.' },
      { title: 'Proteção', purpose: 'Evitar que a meta destrua a estabilidade necessária.' },
      { title: 'Plano', purpose: 'Definir aportes, redução de custos ou aumento de renda.' },
      { title: 'Execução', purpose: 'Acompanhar resultados reais.' },
      { title: 'Revisão', purpose: 'Recalibrar premissas e prazo.' },
    ],
    preferredMetrics: ['valor atual', 'valor alvo', 'aporte mensal', 'taxa de progresso', 'reserva'],
  },
  career_business: {
    id: 'career_business',
    label: 'Carreira / negócio',
    description: 'Criar renda, serviço, operação, carreira ou negócio com progressão por capacidade real.',
    discoveryQuestions: ['Qual resultado profissional?', 'Qual competência/oferta existe hoje?', 'Quem é o cliente ou mercado?', 'Qual renda ou marco define sucesso?'],
    defaultChapters: [
      { title: 'Posicionamento', purpose: 'Definir problema, cliente, oferta e diferencial.' },
      { title: 'Capacidade', purpose: 'Garantir competência e recursos para entregar.' },
      { title: 'Prova', purpose: 'Criar portfólio, teste ou primeira entrega.' },
      { title: 'Aquisição', purpose: 'Encontrar e converter oportunidades.' },
      { title: 'Entrega', purpose: 'Executar com qualidade e registrar resultado.' },
      { title: 'Escala', purpose: 'Padronizar, delegar ou aumentar capacidade somente após validação.' },
    ],
    preferredMetrics: ['leads', 'clientes', 'receita', 'margem', 'capacidade', 'entregas concluídas'],
  },
  custom: {
    id: 'custom',
    label: 'Objetivo personalizado',
    description: 'Objetivo que não cabe com segurança em um arquétipo único.',
    discoveryQuestions: ['O que precisa mudar no mundo real?', 'Como saberemos que deu certo?', 'Qual é o estado atual?', 'Quais restrições existem?'],
    defaultChapters: [
      { title: 'Entender', purpose: 'Definir objetivo, contexto e critério de sucesso.' },
      { title: 'Preparar', purpose: 'Resolver pré-requisitos e dependências.' },
      { title: 'Executar', purpose: 'Realizar as ações de maior impacto.' },
      { title: 'Validar', purpose: 'Comparar o resultado com o objetivo.' },
      { title: 'Adaptar', purpose: 'Ajustar ou encerrar conscientemente.' },
    ],
    preferredMetrics: ['marcos', 'critério de sucesso', 'dependências resolvidas'],
  },
};

export function getArchetypeDefinition(archetype: GoalArchetype) {
  return definitions[archetype];
}

export function listArchetypeDefinitions() {
  return Object.values(definitions);
}
