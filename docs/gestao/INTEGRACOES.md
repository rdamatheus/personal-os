# Mapa de sistemas, dados e integrações

**Referência de leitura:** 2026-11-08.  
**Escopo da Fase 1:** documentação de fontes e fronteiras; nenhuma integração é criada, modificada ou executada.

## 1. Sistemas existentes

| Sistema | Localização verificada | Responsabilidade |
|---|---|---|
| Personal OS | [GitHub: rdamatheus/personal-os](https://github.com/rdamatheus/personal-os) | Aplicação pessoal, arquitetura e documentação transversal |
| Supabase `croma-hub` | Projeto ativo; esquema `personal_os` separado de `public` | Persistência do Personal OS e dos módulos da Croma com RLS |
| Croma Hub | [GitHub: rdamatheus/croma-hub](https://github.com/rdamatheus/croma-hub) | Site Croma e operações específicas; mantém seu próprio backlog |
| LUFF Store | [GitHub: rdamatheus/LuffStore](https://github.com/rdamatheus/LuffStore) | Aplicação e documentação própria |
| Liberty Haul | [GitHub: rdamatheus/LibertyHaul](https://github.com/rdamatheus/LibertyHaul) | Aplicação e documentação própria |

O antigo projeto Supabase denominado `personal-os` foi observado **inativo** na verificação de 2026-11-08. Não reativar, migrar ou apagar nada sem análise e autorização.

## 2. Contratos de informação existentes

### Gestão pessoal / transversal

- `personal_os.workspaces` e `workspace_members`: fronteira de autenticação e isolamento entre usuários.
- `personal_os.projects`: projeto/objetivo operacional transversal.
- `personal_os.tasks`: tarefas relacionadas por referência ao projeto.
- `personal_os.decisions`: decisões, justificativas, hipóteses, alternativas e vínculo com projeto.
- `personal_os.activity_log`: eventos e histórico de alteração onde implementados.

Na inspeção de 2026-11-08, `personal_os.workspaces`, `projects`, `tasks` e `decisions` estavam sem registros. A existência de tabelas **não** significa que o usuário esteja cadastrado, que o ciclo de escrita esteja pronto ou que dados de conversas tenham sido importados.

Antes da Fase 2: verificar conta e workspace autorizados; testar a persistência do fluxo já existente; revisar RLS, vínculos, ciclo de arquivamento e compatibilidade com o dashboard. O README do Personal OS informa que algumas telas continuam protótipos e que o Copiloto real ainda não está habilitado.

### Evolução e catálogo técnico da Croma

- `public.managed_projects` contém registros de Croma Hub, Personal OS e LUFF Store, com URLs e metadados. É catálogo de sistemas, não acompanhamento geral de tarefas.
- `public.system_evolution_areas`, `system_evolution_items` e `system_evolution_dependencies` são a fonte oficial do backlog de evolução técnica do Croma Hub.
- Respeitar [EVOLUCAO_CROMA_HUB.md](https://github.com/rdamatheus/croma-hub/blob/main/docs/EVOLUCAO_CROMA_HUB.md): uma fonte por conceito, evidência antes de concluído e atualização da própria estrutura vigente.
- Outras tabelas operacionais (pedidos, produtos, integrações de ERP e marketing) permanecem sob as regras do sistema proprietário, sem sincronização automática pela Central de Projetos.

## 3. Outras ferramentas e conectores

| Ferramenta | Uso potencial | Estado nesta fase |
|---|---|---|
| GitHub | Fontes de código, documentação, PRs e evidências | Leitura dos repositórios; somente os documentos desta Fase 1 serão escritos |
| Google Drive | Arquivos, artes, kits de identidade, materiais e provas | Apenas referência para consulta futura autorizada |
| Google Calendar / tarefas | Prazos e compromissos | Integração não implementada nesta fase |
| Bling / Nuvemshop e outros ERPs | Operações de cada negócio | Sem novas sincronizações; contratos exigem projeto e aprovação próprios |
| Conversas e memória do ChatGPT | Contexto de descoberta e continuação | Não são fonte de escrita automática nem prova de persistência |

O acesso conectado à plataforma não implica autorização para alterar seus dados.

## 4. Regras de integração futura

1. **Reutilizar antes de criar:** verificar IDs, tabelas e cadastros canônicos.
2. **Definir direção e dono:** origem, destino, evento, leitura/escrita, autoridade do dado e resolução de conflito.
3. **Proteger dados:** RLS e separação de workspace, privilégios mínimos, segredos apenas em ambiente seguro, nunca no navegador ou GitHub público.
4. **Evitar loops:** usar referências externas estáveis e controles de idempotência em sincronizações aprovadas.
5. **Observar custos e quotas:** não ativar processamento recorrente ou serviços pagos sem aprovação.
6. **Validar antes de escalar:** amostra não destrutiva, tratamento de erro, rollback, auditoria e comparação pós-mudança.
7. **Preservar governança:** documentação transversal encaminha para a fonte oficial em vez de substituir histórico de pedidos, catálogo, backlog ou artefatos existentes.

## 5. Limites e pendências

**Implementado na Fase 1:** identificação e documentação das referências.  
**Ainda não implementado:** agenda unificada, importação de projetos, cadastro da Liberty em tabelas, sincronização entre chats e banco, agente programado, alertas, conexões bidirecionais.

A criação de cada integração deve ser analisada e aprovada na fase correspondente; não presumir atualização automática só porque um serviço está disponível.
