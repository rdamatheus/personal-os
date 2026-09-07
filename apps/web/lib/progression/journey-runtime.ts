import { getArchetypeDefinition } from './goal-framework';
import type { GoalArchetype } from './model';

export type JourneyChapterTemplate = {
  title: string;
  purpose: string;
  missions: string[];
};

const missions: Record<GoalArchetype, string[][]> = {
  acquire: [
    ['Clarificar uso, necessidade e requisitos', 'Registrar o que já existe hoje', 'Definir o que significa uma boa aquisição'],
    ['Definir orçamento máximo sustentável', 'Calcular custo total e custos recorrentes', 'Comparar comprar agora, esperar ou usar alternativa'],
    ['Definir critérios objetivos de escolha', 'Pesquisar opções e riscos', 'Montar uma lista curta de opções válidas'],
    ['Validar a opção final antes de comprometer dinheiro', 'Negociar e conferir documentação/condições', 'Executar a aquisição e registrar o resultado'],
    ['Planejar manutenção e custos recorrentes', 'Criar margem para imprevistos', 'Revisar depois se a aquisição entregou o valor esperado'],
  ],
  learn: [
    ['Definir a competência prática desejada', 'Mapear sub-habilidades e pré-requisitos', 'Registrar o nível atual'],
    ['Escolher uma fonte principal de fundamentos', 'Estudar o mínimo necessário para começar', 'Criar notas/checklist de fundamentos essenciais'],
    ['Executar exercícios pequenos e frequentes', 'Registrar erros e dúvidas recorrentes', 'Buscar feedback sobre a execução'],
    ['Concluir um projeto real do começo ao fim', 'Repetir o processo com menos ajuda', 'Documentar o que ainda exige consulta'],
    ['Executar um teste ou desafio prático', 'Comparar resultado com o nível desejado', 'Identificar lacunas restantes'],
    ['Definir prática de manutenção', 'Escolher próximo nível ou especialização', 'Registrar evidências do que já consegue fazer'],
  ],
  build: [
    ['Definir o resultado final e para quem ele serve', 'Definir versão mínima útil', 'Listar restrições e critérios de sucesso'],
    ['Resolver dependências e recursos essenciais', 'Montar estrutura mínima de trabalho', 'Eliminar bloqueios de início'],
    ['Construir a primeira versão funcional', 'Evitar funcionalidades não essenciais', 'Registrar decisões e pendências'],
    ['Colocar a versão diante de uso real', 'Coletar feedback objetivo', 'Corrigir os problemas que impedem o uso'],
    ['Priorizar melhorias por impacto', 'Consolidar o que funcionou', 'Definir próximo ciclo conscientemente'],
  ],
  improve: [
    ['Medir a situação atual', 'Identificar gargalos e desperdícios', 'Definir a métrica que precisa melhorar'],
    ['Listar hipóteses de melhoria', 'Priorizar por impacto x esforço', 'Escolher o primeiro experimento'],
    ['Executar teste controlado', 'Medir antes e depois', 'Registrar efeitos colaterais'],
    ['Transformar ganho comprovado em padrão', 'Documentar o novo processo', 'Treinar/automatizar quando fizer sentido'],
    ['Comparar resultado com a linha de base', 'Decidir o que manter ou desfazer', 'Definir a próxima oportunidade de melhoria'],
  ],
  stabilize: [
    ['Identificar o risco mais urgente', 'Interromper deterioração evitável', 'Definir o mínimo necessário para atravessar o curto prazo'],
    ['Garantir recursos essenciais', 'Organizar compromissos obrigatórios', 'Criar uma rotina mínima de acompanhamento'],
    ['Resolver pendências estruturais prioritárias', 'Eliminar fontes recorrentes de instabilidade', 'Documentar o novo estado'],
    ['Criar reserva de tempo, dinheiro ou capacidade', 'Definir gatilhos de alerta', 'Testar a resiliência do plano'],
    ['Retomar crescimento sem comprometer a base', 'Escolher uma frente de avanço', 'Revisar periodicamente a estabilidade'],
  ],
  decide: [
    ['Escrever exatamente qual decisão precisa ser tomada', 'Definir prazo e consequências de não decidir', 'Definir critérios de decisão'],
    ['Listar alternativas reais', 'Incluir a opção de não agir', 'Eliminar falsas opções'],
    ['Pesquisar as incertezas que realmente mudam a escolha', 'Separar fato, estimativa e preferência', 'Registrar premissas'],
    ['Comparar todas as opções pelos mesmos critérios', 'Testar cenários e trade-offs', 'Identificar a opção reversível quando houver'],
    ['Registrar a decisão e o motivo', 'Definir o primeiro passo pós-decisão', 'Agendar uma revisão quando houver incerteza relevante'],
  ],
  experience: [
    ['Definir o que faria a experiência valer a pena', 'Escolher pessoas/datas relevantes', 'Definir limites de orçamento e tempo'],
    ['Validar logística e requisitos', 'Estimar custo total', 'Definir plano B para riscos importantes'],
    ['Fazer reservas/compras necessárias', 'Organizar documentos e itens', 'Concluir preparativos sem excesso de checklist'],
    ['Viver a experiência com espaço para improviso', 'Cuidar dos pontos críticos de segurança/logística', 'Evitar transformar execução em produtividade'],
    ['Registrar memórias e aprendizados úteis', 'Fechar pendências financeiras/logísticas', 'Decidir se há algo que merece virar nova jornada'],
  ],
  habit: [
    ['Definir comportamento, gatilho e frequência', 'Criar uma versão mínima para dias difíceis', 'Remover uma fonte óbvia de fricção'],
    ['Executar a rotina por uma semana', 'Observar horários e contextos que funcionam', 'Registrar obstáculos sem punição'],
    ['Ajustar duração e ambiente', 'Simplificar onde houve abandono', 'Definir como retomar depois de falhar'],
    ['Acumular repetições sustentáveis', 'Priorizar aderência sobre perfeição', 'Verificar se a rotina ainda serve ao objetivo'],
    ['Escolher forma leve de manutenção', 'Reduzir acompanhamento quando já estiver natural', 'Revisar periodicamente o propósito'],
  ],
  financial: [
    ['Levantar valores, obrigações e fluxo atual', 'Definir valor/condição alvo', 'Definir horizonte e limites de risco'],
    ['Proteger despesas essenciais e reservas necessárias', 'Evitar compromissos incompatíveis com a base', 'Definir o que não será sacrificado'],
    ['Definir aportes, cortes ou aumento de renda', 'Criar marcos intermediários', 'Simular cenários conservador e provável'],
    ['Executar e registrar resultados reais', 'Comparar realizado x planejado', 'Corrigir desvios sem abandonar a meta automaticamente'],
    ['Revisar premissas e prazo', 'Confirmar se a meta continua relevante', 'Definir próximo ciclo financeiro'],
  ],
  career_business: [
    ['Definir problema, cliente e resultado oferecido', 'Escolher um recorte inicial de mercado', 'Escrever uma oferta simples e testável'],
    ['Garantir habilidade e recursos mínimos para entregar', 'Definir padrão mínimo de qualidade', 'Eliminar dependências que impedem a primeira entrega'],
    ['Criar uma prova, amostra ou caso demonstrável', 'Testar a entrega ponta a ponta', 'Documentar evidências do resultado'],
    ['Construir uma lista de oportunidades', 'Fazer abordagem/prospecção', 'Conduzir a primeira negociação com escopo claro'],
    ['Entregar com qualidade', 'Registrar tempo, custo e resultado', 'Pedir feedback e transformar entrega em prova'],
    ['Padronizar o que se repetiu', 'Delegar/automatizar somente o validado', 'Aumentar capacidade sem perder margem ou qualidade'],
  ],
  custom: [
    ['Definir o que precisa mudar no mundo real', 'Registrar o estado atual', 'Definir como saberemos que deu certo'],
    ['Listar dependências e recursos', 'Resolver o maior bloqueio inicial', 'Definir primeira sequência executável'],
    ['Executar as ações de maior impacto', 'Registrar evidências', 'Ajustar quando a realidade divergir do plano'],
    ['Comparar resultado com o critério de sucesso', 'Identificar lacunas e efeitos colaterais', 'Decidir concluir, ajustar ou criar novo ciclo'],
    ['Consolidar o aprendizado', 'Registrar capacidade conquistada', 'Escolher conscientemente o próximo passo'],
  ],
};

export function buildJourneyTemplate(archetype: GoalArchetype): JourneyChapterTemplate[] {
  const definition = getArchetypeDefinition(archetype);
  return definition.defaultChapters.map((chapter, index) => ({
    title: chapter.title,
    purpose: chapter.purpose,
    missions: missions[archetype][index] ?? [
      `Entender o que precisa acontecer em ${chapter.title}`,
      `Executar a ação principal de ${chapter.title}`,
      `Validar o resultado de ${chapter.title}`,
    ],
  }));
}

export function formatChapterTitle(index: number, title: string) {
  return `${String(index + 1).padStart(2, '0')} · ${title}`;
}

export function chapterIndex(title: string) {
  const match = title.match(/^(\d{1,2})\s*·/);
  return match ? Number(match[1]) - 1 : Number.MAX_SAFE_INTEGER;
}

export function plainChapterTitle(title: string) {
  return title.replace(/^\d{1,2}\s*·\s*/, '');
}
