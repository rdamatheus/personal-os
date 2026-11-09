# Mapa de integrações e fronteiras de dados

> **Estado:** catálogo de referências observadas em 2026-11-08 e arquitetura proposta. **Nenhuma integração foi criada, ativada, modificada ou testada funcionalmente nesta etapa 1.**

## Princípio

O Personal OS é a **camada de coordenação**. Não deve virar uma cópia de bases comerciais, nem gerenciar sessões/tokens de outros sistemas diretamente no front-end. O manual público é referência versionada; o estado operacional, quando implementado, deve estar em workspace autenticado. Cada sistema conserva a fonte primária do próprio domínio.

```text
chats / agentes / Work — acesso condicionado a ferramentas e permissões
                     |
                     v
          manual versionado (GitHub)
                     |
         [integração futura, não ativa]
                     v
        Personal OS / workspace privado
          projetos · tarefas · decisões
          aprovações · histórico · agenda
                     |
          [links / eventos autorizados]
           /             |             \
       GitHub         Croma Hub       LUFF / Liberty
     PR / commit      operação         domínios próprios
                         |
                  Bling (integração
                  específica a validar)
```

## Referências verificadas

| Sistema | Evidência / localização | Limite de responsabilidade |
| --- | --- | --- |
| Personal OS (código) | [rdamatheus/personal-os](https://github.com/rdamatheus/personal-os), `main` | Interface Next.js e documentação da plataforma; configuração runtime por variáveis de ambiente |
| Personal OS (dados planejados) | Supabase `croma-hub`, schema `personal_os`: `workspaces`, `projects`, `tasks`, `decisions`, `activity_log` | Modelos e RLS existentes; no levantamento, workspaces/projetos/tarefas/decisões com 0 registros; autenticação e bootstrap precisam de verificação antes de utilização |
| Projeto Supabase legado `personal-os` | Status `INACTIVE` na inspeção | Não reativar, apagar, migrar ou reconfigurar sem autorização e plano de validação |
| Cadastro técnico transversal | `public.managed_projects` em Supabase `croma-hub` | 3 registros observados: `croma-hub`, `personal-os`, `luff-store`; usar como referência quando autorizado; evitar criar cópia concorrente |
| Croma Hub | [rdamatheus/croma-hub](https://github.com/rdamatheus/croma-hub); Supabase `croma-hub`, schema `public` | Catálogo, propostas, pedidos, clientes e demais processos da Croma; não duplicar entidades transacionais |
| LUFF Store | [rdamatheus/LuffStore](https://github.com/rdamatheus/LuffStore) | Operação do projeto LUFF; conexões e endpoints devem ser verificados no próprio sistema antes de usar |
| Liberty Haul | [rdamatheus/LibertyHaul](https://github.com/rdamatheus/LibertyHaul) | Projeto existente no GitHub; não estava nos 3 registros de `managed_projects` observados; registro futuro sujeito a aprovação |
| GitHub PR/CI | PRs/commits/checks nos respectivos repositórios | Fonte original para revisão de alterações de código; não confundir PR aberta com integração ou publicação |
| Bling / fontes externas | Dependências relacionadas ao Croma Hub | Autoridade por entidade precisa de regra de sincronização, idempotência, conflito e auditoria; não afirmar sync ativa sem verificar |

## Regras de integração futura

1. **Identidades:** entidade do Personal OS recebe um ID interno e links externos explícitos (`provider`, `external_id`, `url`); nunca assumir que IDs entre sistemas coincidem.
2. **Autoridade:** definir para cada entidade quem cria, atualiza e resolve conflitos; não introduzir escrita bidirecional genérica.
3. **Segurança:** serviço intermediário autenticado para operações privilegiadas, mínimo privilégio, RLS por workspace, trilha de auditoria, segredos somente em backend autorizado.
4. **Integridade:** eventos idempotentes, controle de duplicidade, retries limitados, reconciliação e status de erro visível.
5. **Custos:** avaliar volume, egress, cron, disponibilidade e limites de plano Free antes de agendar polling.
6. **Privacidade:** nunca incorporar dados privados ou tokens nos arquivos deste diretório ou em logs públicos; dados pessoais e de negócios mantidos separados.
7. **Governança:** novo conector deve ter proposta, impacto, autorização, teste e operação documentados; nenhum webhook ou cron implícito.

## Pendências técnicas para a próxima fase (não aprovadas)

- Confirmar ambiente Supabase usado pelo frontend Personal OS em produção, configuração do schema `personal_os` e bootstrap de workspace / autenticação; não assumir que a existência de tabelas prova funcionamento.
- Revisar permissões de `public.managed_projects` e `personal_os.*`, escopos de RLS e eventual necessidade de endpoints seguros de leitura agregada.
- Escolher IDs de correlação para projetos Croma Hub, LUFF, Liberty e projetos privados, sem transferir dados de negócio.
- Definir UX de agenda, caixa de aprovações, log de agente, lembretes e comportamento de notificações; validar a capacidade real de envio antes de prometer alertas.
- Preparar migrações, deploys, integrações e automações **somente após aprovação de etapas próprias**.

Para procedimentos de aprovação e registros, consulte [WORKFLOW.md](./WORKFLOW.md). Para navegação, consulte [INDEX.md](./INDEX.md).
