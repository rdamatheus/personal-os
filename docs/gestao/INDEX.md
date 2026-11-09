# Central de Projetos — índice e ponto de entrada

**Etapa:** Fase 1 — fundação documental.  
**Atualização de referência:** 2026-11-08.  
**Repositório:** [Personal OS](https://github.com/rdamatheus/personal-os).  
**Importante:** este documento não representa uma agenda sincronizada nem um inventário completo de pendências.

**Automações externas (09/11/2026):** cinco agentes ChatGPT foram reorganizados e agendados de hora em hora, com funções de Tecnologia, Comercial, Administração, Marketing e Coordenação. Consulte o [catálogo de agentes](AGENTES.md) para horários e identificadores. Isso não implementa a Fase 2/3 da agenda nativa do Personal OS nem sincroniza automaticamente os dados.

## Objetivo

Oferecer um ponto de orientação comum a chats, pessoas e futuros agentes para retomar trabalhos, consultar decisões e localizar o estado **validado** dos projetos. A agenda e o estado operacional devem morar nas fontes canônicas, não em cópias deste índice.

## Navegação

| Documento | Finalidade |
|---|---|
| [AGENTS.md](../../AGENTS.md) | Entrada obrigatória para agentes e chats técnicos |
| [MANUAL.md](MANUAL.md) | Regras, ciclo de projeto, decisões e validação |
| [AGENTES.md](AGENTES.md) | Papéis, autonomia, monitoramento planejado |
| [INTEGRACOES.md](INTEGRACOES.md) | Fontes oficiais, permissões e limites |
| [Arquitetura](../architecture.md) | Arquitetura do próprio Personal OS |
| [Roadmap do Personal OS](../product/implementation-roadmap-v1.md) | Plano técnico existente, não substituído por este índice |

## Mapa inicial dos sistemas (somente referências)

| Sistema | Fonte de implementação | Fonte do estado |
|---|---|---|
| Personal OS | [rdamatheus/personal-os](https://github.com/rdamatheus/personal-os) | `personal_os.projects` / `tasks` / `decisions`, após a persistência e cadastro autorizados |
| Croma Hub | [rdamatheus/croma-hub](https://github.com/rdamatheus/croma-hub) | Evolução técnica em `public.system_evolution_*`; catálogo de sistemas em `public.managed_projects` |
| LUFF Store | [rdamatheus/LuffStore](https://github.com/rdamatheus/LuffStore) | Documentação e estado do sistema proprietário; confirmar dados operacionais antes de consolidar |
| Liberty Haul | [rdamatheus/LibertyHaul](https://github.com/rdamatheus/LibertyHaul) | Documentação e estado no repositório; cadastro transversal pendente de análise/autorização |

O catálogo `public.managed_projects` foi verificado com registros de Croma Hub, Personal OS e LUFF Store. **Isso não significa que as agendas desses sistemas estejam sincronizadas.** Incluir Liberty ou outros projetos nesse cadastro exige uma fase posterior e aprovação.

## Iniciativas que podem ser vinculadas no futuro

Croma — operação gráfica e papelaria, marketing, coworking e loja automatizada; desenvolvimento do Croma Hub; LUFF Store; Liberty Haul; desenvolvimento do Personal OS. Esses são **temas de organização**, não projetos novos criados neste commit, nem declaração de avanço.

## Ordem de consulta ao retomar qualquer trabalho

1. Identificar empresa/sistema, solicitação atual e restrições aprovadas.
2. Ler o [Manual](MANUAL.md) e o [mapa de integrações](INTEGRACOES.md).
3. Consultar o registro canônico de projeto/tarefa/decisão, caso exista e esteja acessível.
4. Verificar artefatos e evidências na documentação, GitHub e ferramentas autorizadas.
5. Resumir: estado confirmado, pendências/bloqueios, próxima ação e se exige aprovação.
6. Após uma mudança autorizada, verificar o resultado e atualizar **a mesma fonte oficial**, não uma lista paralela.

Se faltar identificação ou acesso, declarar a lacuna. Não converter lembranças, prints ou protótipos em execução comprovada.

## Ativações futuras, fora da Fase 1

- Fase 2: consolidar a agenda e os registros existentes sem duplicação, após conferir workspace, acesso e fluxos de persistência.
- Fase 3: configurar Coordenador de Projetos e revisões programadas após nova autorização.

**Nenhum agente ou agendamento é ativado por estes arquivos.**
