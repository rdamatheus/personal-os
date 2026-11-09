# Protocolo e catálogo de agentes — planejamento e automações ativas

**Atualização em 09/11/2026:** cinco automações ChatGPT existentes foram reorganizadas e tiveram suas frequências alteradas para **uma execução por hora, cada**, o máximo permitido pela ferramenta. Os agendamentos foram conferidos após a atualização. Isso NÃO significa que o Coordenador nativo do Personal OS, a sincronização dos chats ou as Fases 2–3 do sistema tenham sido implantados. Este arquivo documenta as automações externas, não ativa integrações.

## Estado confirmado: cinco agentes ChatGPT

| Função | Automação existente (ID) | Horário a cada hora (America/Sao_Paulo) |
|---|---|---|
| Tecnologia e desenvolvimento | `6af11feedecc8191a812f50a219c3597` | minuto **00** |
| Comercial, produtos e fornecedores | `6af11fe04a688191ac103bd3818b51ae` | minuto **12** |
| Administração e financeiro | `6aafe26443d08191ac27b222d8266906` | minuto **24** |
| Marketing e comunicação | `6abb2b8f845081919a89706ae6319abc` | minuto **36** |
| Coordenação geral e continuidade | `6ad824403a8c8191a27c42561fe1c756` | minuto **48** |

Os horários são de agendamento; a execução efetiva pode variar conforme o serviço. As cinco rotinas cobrem Croma, Liberty Haul e LUFF Store, cada qual respeitando as regras e fontes do negócio. As automações legadas `Bastidores da Croma` e `Revisar aprovações Croma` permanecem pausadas e suas funções foram incorporadas ao Marketing sem reativação.

### Controle de duplicações, aprovações e custo

- Em cada execução horária, buscar primeiro **novidades verificáveis**; evitar estudos completos e notificações repetidas quando não houver mudança material.
- O check-in do Instagram deve acontecer no máximo uma vez por dia; o briefing semanal da Croma, no máximo uma vez por segunda-feira.
- Cada agente mantém **sua responsabilidade funcional**, sem recriar cadastros, decisões, propostas e tarefas de outro.
- A autorização especial da ISA Liberty de propor sugestões **pending** em `liberty.suggestions`, e a manutenção factual estritamente limitada a três arquivos `docs/gestao/` na Liberty, continuam válidas somente naquele escopo. Nenhuma autonomia de escrita foi automaticamente concedida a outras empresas ou agentes.
- Publicações, pagamentos, contratações, alterações de produção, dados, preços, sistemas e permissões continuam exigindo as aprovações correspondentes.
- Dados pessoais do Personal OS não são copiados para diários ou repositórios empresariais; apenas índices e vínculos permitidos.
- A cadência horária pode aumentar custo/consumo de ferramentas e gerar repetição; reavaliar após observação de execuções reais.

### Fontes e situação de implementação

O Personal OS permanece a **referência transversal de roteamento** e a fonte canônica planejada para agenda e decisões quando persistência/autorização forem implementadas e verificadas. O Croma Hub mantém seus registros proprietários e o Diretório Mestre em desenvolvimento na PR #105. A Liberty mantém seu diretório local e a LUFF, sua documentação e fontes próprias. Os prompts reais das cinco automações ChatGPT são as instruções operacionais executáveis; este documento é um mapa, não a substituição desses prompts.

---

## Histórico documental anterior (08/11/2026)

**Estado em 2026-11-08:** especificação documental. Nenhum novo agente é criado ou ativado por este arquivo.

## 1. Coordenador de Projetos (proposto para Fase 3)

**Objetivo:** ajudar a manter continuidade dos projetos, identificar bloqueios, trabalhos esquecidos, riscos e melhorias comprováveis, e preparar propostas para decisão humana.

**Fontes previstas:** contexto autorizado de `personal_os`, catálogo de sistemas em `public.managed_projects`, documentação dos repositórios envolvidos e fontes oficiais adicionais somente quando conectadas e autorizadas.

**Cadência sugerida (não configurada):** diária às 8h30 no fuso America/Sao_Paulo; revisão semanal consolidada.

**Permissão inicial sugerida:** leitura e análise. Não escrever em bancos, repositórios, quadros, calendário, sites ou aplicações. Não publicar, enviar mensagens em nome do usuário nem ativar outros agentes.

**Entregável por revisão:** resumo de (1) bloqueios críticos e prazos, (2) itens que ficaram sem avanço comprovado, (3) próximas ações executáveis, (4) melhorias propostas com justificativa, riscos, dependências e aprovação necessária.

A análise deve distinguir **sem atualização visível** de **trabalho não realizado**; a primeira condição não comprova a segunda.

## 2. Agentes especializados — candidatos, não ativos

| Agente | Escopo futuro | Fronteira |
|---|---|---|
| Projetos e prioridades | Revisão transversal, agenda e dependências | Não duplicar as tarefas oficiais |
| Desenvolvimento | Análise de código, arquitetura, testes, segurança | Não alterar repositórios/deploys sem autorização |
| Marketing | Avaliar campanhas e preparar propostas de conteúdo | Não publicar ou mudar preços/estoque sem autorização |
| Operações Croma | Acompanhar demandas comerciais e produção com fontes oficiais | Não alterar OS, pedidos ou ERP sem autorização |
| Auditoria e qualidade | Identificar inconsistências, regressões e melhorias | Não corrigir automaticamente dados/segurança |

Cada agente herda o [manual global](MANUAL.md) e [AGENTS.md](../../AGENTS.md). Instruções específicas devem conter apenas objetivo, responsabilidades, dados acessíveis, ações permitidas, autonomia, restrições e critérios de qualidade próprios do domínio.

## 3. Protocolo de execução, quando ativado

1. Verificar identidade, acesso autorizado e fontes disponíveis no momento.
2. Consultar o [índice](INDEX.md), o [manual](MANUAL.md) e o [mapa de integrações](INTEGRACOES.md).
3. Recuperar o último estado canônico e evidências, sem presumir que mensagens foram sincronizadas.
4. Encontrar duplicidades por ID/fonte e apresentar conflitos; não fundir registros automaticamente.
5. Distinguir fatos, hipóteses e sugestões. Priorizar risco operacional, bloqueio de dependência, prazo e valor potencial.
6. Elaborar proposta **sem escrever** em fontes persistentes, salvo quando houver aprovação explícita para essa ação específica.
7. Após execução autorizada, validar e registrar evidências no local oficial. Nunca relatar sucesso não verificado.

## 4. Controles obrigatórios

- **Segurança:** workspace/RLS respeitados; dados pessoais e credenciais não devem ir para este repositório público.
- **Mudança de escopo:** nova autorização quando o trabalho atingir outro sistema, integração ou fase.
- **Falhas:** reportar erro e consequência; não repetir alterações arriscadas nem mascarar falhas.
- **Custo:** estimar e submeter à aprovação consumo novo de APIs, agendamentos pagos ou novos serviços.
- **Auditoria:** registrar origem, decisão e evidência nos sistemas aprovados; não inventar logs.
- **Conflitos:** não transformar hipótese em verdade nem uma proposta em decisão já aprovada.

## 5. Implantação por fases

- **Fase 1 (esta entrega):** manual, roteamento e mapa documental.
- **Fase 2:** agenda e registros canônicos integrados, após revisão de autenticação, contratos, estados e migração.
- **Fase 3:** agendamentos, agente Coordenador, alertas, relatórios e conexões com ações permitidas; requer aprovação própria e validação.

Este catálogo **não** habilita ferramentas, automações, disparos ou políticas de acesso.
