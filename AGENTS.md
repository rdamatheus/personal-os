# Guia de entrada para agentes e chats — Personal OS

> Documento de roteamento e segurança. Não é uma automação e não concede permissões de escrita.
> Fase 1 da Central de Projetos — 2026-11-08.

## Ordem de leitura obrigatória

1. [Índice da Central de Projetos](docs/gestao/INDEX.md): escopo, mapa de fontes e fase vigente.
2. [Manual de gestão](docs/gestao/MANUAL.md): continuidade, registros, evidências, decisões e aprovações.
3. [Protocolo dos agentes](docs/gestao/AGENTES.md): autonomia, revisões e limites.
4. [Mapa das integrações](docs/gestao/INTEGRACOES.md): fontes oficiais e fronteiras.
5. [Arquitetura](docs/architecture.md), [roadmap](docs/product/implementation-roadmap-v1.md) e documentação técnica específica do repositório envolvido.

Não tomar apenas este arquivo como contexto suficiente para uma alteração.

## Regras operacionais

- Consultar fontes oficiais antes de propor mudanças. Distinguir fato verificado, hipótese, recomendação, aprovação e implementação validada.
- Retomar itens pelo identificador e histórico existentes; não recriar projetos, tarefas, decisões ou cadastros já existentes.
- Preservar arquitetura, RLS, limites entre sistemas, regras de negócio, decisões vigentes e contratos de integração.
- Ler, pesquisar e diagnosticar é permitido dentro do acesso autorizado. **Antes de alterar código, arquivos, dados, serviços, integrações, configurações, permissões, automações ou estados**, apresentar escopo, impacto, riscos e solicitar aprovação explícita. Não ampliar o escopo aprovado.
- Conclusão exige evidência de validação; caso não exista, relatar a limitação e manter a pendência aberta.
- Documentar decisões estruturais na fonte apropriada sem criar um roadmap paralelo.
- Nenhuma conversa do ChatGPT sincroniza automaticamente com o Personal OS. Uma atualização só pode ser considerada registrada depois de escrita autorizada na fonte oficial e verificação.
- Nunca expor dados pessoais, segredos, chaves, tokens, credenciais ou documentos internos em repositório público, logs ou respostas.

## Fontes de responsabilidade

- Gestão transversal de metas, projetos, tarefas e decisões: entidades canônicas do esquema `personal_os` no Supabase, **quando houver dados persistidos e fluxo autorizado**.
- Registro técnico dos sistemas: `public.managed_projects` (Croma Hub), sem transformá-lo em agenda duplicada.
- Backlog de evolução do Croma Hub: `public.system_evolution_*` e [normas próprias](https://github.com/rdamatheus/croma-hub/blob/main/docs/EVOLUCAO_CROMA_HUB.md).
- Código e arquitetura: repositório/documentação do projeto dono da implementação. Documentos desta pasta orientam e vinculam, mas não substituem fontes operacionais.

## Limite da Fase 1

Somente estabelecimento documental da Central de Projetos neste repositório. **Não executar agente, agendar tarefa, alterar banco, sincronizar aplicativos, editar outros repositórios ou importar projetos nesta fase.** A rotina diária às 8h30 e a revisão semanal são propostas para fases futuras, não processos ativos.

Para iniciar uma tarefa, identificar sistema afetado, objetivo, estado confirmado, fonte da verdade, decisão vigente, dependências, próxima ação e autorização aplicável.
