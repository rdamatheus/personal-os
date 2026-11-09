# Protocolo e catálogo de agentes — planejamento

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
