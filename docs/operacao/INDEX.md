# Diretório central de projetos e agentes — Personal OS

> **Estado:** documentação proposta em branch isolada; não publicada em `main` até aprovação da Pull Request.  
> **Referência inicial:** 2026-11-08.  
> **Escopo da etapa 1:** governança documental, sem integrações, migrations, alterações de dados ou deploy.

## Finalidade

Este é o ponto de entrada **documental** para os chats, agentes e colaboradores que atuem nos projetos. O Personal OS será o **painel de coordenação** (projetos, tarefas, decisões, pendências e revisões); cada sistema de negócio continua responsável por seus dados operacionais. O índice não é um banco de tarefas nem sincroniza os sistemas automaticamente.

**Antes de atuar:** leia este índice, [AGENTS.md](./AGENTS.md), [WORKFLOW.md](./WORKFLOW.md) e, se houver integração envolvida, [INTEGRATIONS.md](./INTEGRATIONS.md). Para cadastrar ou documentar projeto, use [PROJECT-TEMPLATE.md](./PROJECT-TEMPLATE.md).

## Inventário de projetos

| Projeto | Código / repositório | Papel / domínio | Fonte para estado operacional |
| --- | --- | --- | --- |
| Personal OS | [rdamatheus/personal-os](https://github.com/rdamatheus/personal-os) | Gestão pessoal e futura orquestração transversal | Workspace protegido no schema `personal_os`; verificar disponibilidade antes de uso |
| Croma Hub | [rdamatheus/croma-hub](https://github.com/rdamatheus/croma-hub) | Loja, catálogo e operação da Croma | Croma Hub (Supabase, schema `public`) e integrações de negócio; não presumir sincronismo com o Bling |
| LUFF Store | [rdamatheus/LuffStore](https://github.com/rdamatheus/LuffStore) | Canal digital e processos próprios da LUFF | Sistema LUFF e integrações autorizadas; verificar configuração ativa |
| Liberty Haul | [rdamatheus/LibertyHaul](https://github.com/rdamatheus/LibertyHaul) | Site e catálogo da Liberty Haul | Sistema Liberty e integrações autorizadas; cadastro central ainda a confirmar |

**Inventário, não implantação:** a existência do repositório não prova que seu site, rotinas ou integrações estejam operacionais. O cadastro `public.managed_projects` verificado em 2026-11-08 continha Croma Hub, Personal OS e LUFF Store; **Liberty Haul ainda não aparecia naquele cadastro**. Não inserir registros nem preencher estados presumidos sem autorização.

## Onde registrar cada tipo de informação

| Informação | Local de referência | Regra |
| --- | --- | --- |
| Políticas, arquitetura de coordenação e instruções de agentes | GitHub, `docs/operacao/` | Versionar por PR; evitar conteúdo pessoal, credenciais e dados de clientes em repo público |
| Situação de projetos, tarefas, prazos, aprovações e decisões particulares | Personal OS / workspace autorizado | Futuro painel canônico; não afirmar sincronização antes de implementar e validar |
| PRs, commits, issues e resultados de CI | GitHub do projeto | Links e evidências, não cópias de código em outros bancos |
| Pedidos, OS, propostas, clientes, estoque e rotinas comerciais da Croma | Croma Hub / Bling conforme a entidade | Integração específica define autoridade e reconciliação; nunca replicar indiscriminadamente |
| Pedidos, catálogo e configurações da LUFF e Liberty | Sistemas correspondentes | Sem cross-write entre projetos por padrão |

Consulte [INTEGRATIONS.md](./INTEGRATIONS.md) para o mapa de conexões e limitações.

## Ficha mínima de continuidade

Para cada projeto que receber trabalho, o registro privado operacional deverá permitir responder:

1. **Objetivo e escopo aprovado:** o que se pretende alcançar e o que está proibido mudar.
2. **Estado observado:** data de verificação, fonte e evidência (não confundir com hipótese).
3. **Decisões em vigor:** responsável, justificativa e referência.
4. **Próxima ação concreta:** responsável, prazo se definido, dependências e bloqueadores.
5. **Trabalho em revisão:** PR, testes e autorização pendente.
6. **Última atualização:** quem registrou, quando, e o que efetivamente foi validado.

Não transformar sugestões em tarefas aprovadas; não marcar concluído por inferência. A ficha detalhada segue [PROJECT-TEMPLATE.md](./PROJECT-TEMPLATE.md).

## Continuidade entre chats e agentes

1. Identificar o projeto e a solicitação atual.
2. Consultar este diretório e as fontes primárias autorizadas; se não houver acesso, declarar a limitação.
3. Preservar decisões anteriores até que outra decisão explícita as substitua.
4. Separar fatos observados, hipóteses, propostas, aprovações e implementações testadas.
5. Antes de encerrar um ciclo, registrar as pendências e o ponto exato de retomada **somente no destino para o qual houver autorização de gravação**.
6. Na próxima sessão, retomar pelo registro verificado mais recente, sem reexecutar mudanças.

## Links estruturais do Personal OS

- [Arquitetura existente](../architecture.md)
- [Roadmap de implementação existente](../product/implementation-roadmap-v1.md)
- [Auditoria de persistência/CRUD](../implementation/crud-audit-v0.5.md)
- [Papel de assistente estratégico](../product/ai-chief-of-staff.md)

**Limite:** estes documentos estabelecem instruções; eles não criam automações, acesso compartilhado, sincronização nem notificações.
