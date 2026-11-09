# Manual de gestão e continuidade de projetos

**Versão documental:** 1.1 — 2026-11-09  
**Aplicação:** projetos transversais conduzidos a partir do Personal OS.  
**Situação:** regras documentadas; integração da agenda e automações ainda não implementadas.

## 1. Objetivo e princípios

Garantir continuidade entre conversas, agentes e projetos sem perder decisões, duplicar trabalho ou encerrar pendências sem verificação.

- **Uma fonte de verdade por conceito.** Este manual explica o processo; não é uma segunda base de tarefas.
- **Captura não implica compromisso.** Ideias continuam ideias até que sejam priorizadas.
- **Decisão explícita prevalece.** Uma decisão anterior só é substituída por nova decisão registrada e autorizada.
- **Evidência antes de concluído.** Intenção, proposta, código escrito, deploy e funcionalidade validada são estados diferentes.
- **Privacidade por padrão.** Dados operacionais e pessoais não devem ser publicados no repositório público.
- **Leitura primeiro, alteração depois.** Análises não destrutivas podem instruir propostas; escritas exigem aprovação aplicável.

Este manual complementa a [arquitetura](../architecture.md) e o [roadmap](../product/implementation-roadmap-v1.md), sem revogar regras técnicas ou políticas existentes.

## 2. Fonte de verdade e responsabilidade

| Conceito | Registro oficial / localização | Regra |
|---|---|---|
| Projetos, tarefas e decisões transversais | Tabelas `personal_os.projects`, `personal_os.tasks`, `personal_os.decisions`, sob workspace autorizado | Usar quando a Fase 2 habilitar o cadastro e verificar o ciclo persistente; não importar automaticamente |
| Trilha de alterações pessoais | `personal_os.activity_log` | Auditar alterações autorizadas; não inventar eventos passados |
| Sistemas gerenciados | `public.managed_projects` no Croma Hub | Catálogo de sistemas, não cópia da agenda |
| Evolução técnica do Croma Hub | `public.system_evolution_areas` / `items` / `dependencies` | Manter no módulo Evolução existente |
| Código, arquitetura e decisões técnicas específicas | Repositório do sistema, ADRs e documentos existentes | O repositório dono da funcionalidade prevalece |
| Artes, arquivos e evidências de produção | Repositórios ou pastas oficiais com acesso autorizado | Guardar referência, versão e origem; não copiar binários para este manual |

Quando duas fontes divergirem, apresentar a diferença com data e origem e aguardar decisão antes de corrigir. Evitar espelhamentos bidirecionais sem contrato, identidade estável e estratégia de conflito.

## 3. Registro mínimo de acompanhamento (contrato lógico)

Ao consultar ou cadastrar um trabalho no sistema oficial, identificar:

- **Identidade:** referência canônica/ID, nome, sistema/área e responsável.
- **Objetivo:** resultado desejado, escopo e critérios de aceite.
- **Situação confirmada:** estado, data de verificação e evidência/link.
- **Continuidade:** próxima ação específica, dependências, bloqueios e prazo se aprovado.
- **Governança:** decisões vigentes, hipótese não verificada, aprovação e seus limites.
- **Rastreabilidade:** origem da demanda e registro das alterações/validações.

Não significa criar essas colunas agora. Preferir campos existentes; mudanças de schema dependem de análise e autorização posterior.

**Estados conceituais:** ideia, planejado, em andamento, bloqueado, concluído validado e cancelado. Na Fase 2, mapear esses conceitos aos valores realmente aceitos nos sistemas existentes, sem inventar enumerações nem modificar dados antigos.

## 3.1 Triagem e registro contextual de conversas (regra aprovada em 2026-11-09)

A cada demanda relevante em conversas e agentes, avaliar **empresa**, **assunto**, **projeto relacionado**, **registro existente** e **fonte de verdade**. Não criar registros paralelos: primeiro consultar o módulo responsável, recuperar o ID canônico e classificar se a demanda é projeto, tarefa, proposta, decisão, acompanhamento ou interação pontual.

- **Intenção de registro:** quando não estiver explícita, perguntar de forma breve: “Deseja registrar isso no painel correspondente ou tratar apenas nesta conversa?”. Se a solicitação for claramente pontual, evitar perguntar mecanicamente; se já houver autorização específica para registrar, não repeti-la.
- **Autorização e alcance:** classificar e propor destino não concede permissão de escrita. Antes de inserir, atualizar ou sincronizar qualquer dado, apresentar alteração, impactos e riscos aplicáveis e obter aprovação explícita, respeitando o escopo autorizado. Registrar uma demanda não autoriza executá-la.
- **Roteamento por responsabilidade:** cotações e propostas da Croma no módulo comercial já existente; OS e produção na operação gráfica; financeiro na área oficial da empresa correspondente; marketing na central de marketing de cada empresa; projetos, tarefas e decisões transversais nas entidades canônicas do Personal OS, com vínculo à empresa/sistema. LUFF Store e Liberty Haul mantêm fontes operacionais próprias. Confirmar a existência e os nomes reais dos módulos antes de escrever; não inventar telas ou tabelas.
- **Registro mínimo:** incluir, conforme o contrato da seção 3, referência estável, empresa/área, contexto e objetivo, situação verificada, decisão/aprovação vigente, origem, responsável se conhecido, dependências e próximo passo. Preservar o histórico, sem duplicar demandas ou transformar hipótese em fato.
- **Agentes e continuidade:** agentes consultam os mesmos registros oficiais, identificam bloqueios, atrasos e oportunidades e **propõem** melhorias para revisão. Não ampliam autonomia ou alteram estado sem autorização própria; cadências e integrações continuam sujeitas às fases aprovadas.
- **Confirmação obrigatória:** somente informar “registrado no painel” após escrita autorizada e leitura/verificação do registro persistido. Se a integração não estiver habilitada ou o registro não puder ser confirmado, informar “não sincronizado” e oferecer o conteúdo organizado para futura inclusão, sem alegar sucesso.
- **Privacidade e segregação:** proteger informações financeiras, pessoais, comerciais e de clientes; respeitar workspace/RLS e limites entre empresas. Não colocar esses dados neste manual ou em repositório público.

**Exemplo de aplicação:** o planejamento do coworking criativo, reforma e frente autônoma gradual da Croma deve ser vinculado como iniciativa da Croma na gestão transversal, sem substituir a documentação específica nem presumir que já esteja cadastrado ou sincronizado.

## 4. Ciclo de trabalho

1. **Identificar:** localizar o registro existente antes de propor outro; verificar se a origem é conversa, painel, banco, documento ou issue.
2. **Entender:** confirmar objetivo, situação, decisões, arquitetura, impacto, dependências e riscos.
3. **Planejar:** delimitar ação e critérios objetivos de conclusão.
4. **Aprovar:** antes de qualquer escrita em arquivos, código, dados, integrações, configurações, automações ou regras, detalhar mudança, riscos e consequências; aguardar autorização explícita.
5. **Executar somente o autorizado:** preservar interfaces existentes, histórico e limites entre projetos.
6. **Validar:** ler o resultado real, executar testes pertinentes quando disponíveis e reportar lacunas.
7. **Registrar:** atualizar o registro canônico e a documentação proporcional à mudança, desde que isso esteja abrangido pela aprovação; se não estiver, solicitar autorização específica.
8. **Retomar:** apresentar estado validado, próxima ação e bloqueios, em vez de reiniciar o raciocínio ou declarar conclusão sem evidência.

Aprovar planejamento **não** autoriza automaticamente implementação; aprovar uma fase não autoriza fases seguintes.

## 5. Passagem entre chats ou agentes

Usar um resumo curto, com links, sem transcrever indiscriminadamente todo o histórico:

| Campo | Pergunta orientadora |
|---|---|
| Projeto e referência | Que sistema e registro oficial são afetados? |
| Objetivo atual | O que deve ser entregue? |
| Feito e validado | Qual evidência comprova? |
| Decisões e restrições | O que permanece obrigatório? |
| Bloqueios | O que impede avançar? |
| Próximo passo | Qual é a menor ação útil? |
| Autorização | A próxima ação modifica estado? Está aprovada? |

Se não houve escrita e confirmação na ferramenta oficial, classificar o registro como **não sincronizado**. Conversas não substituem persistência; uma citação ao chat ou memória não comprova uma alteração no banco.

## 6. Critérios de validação e encerramento

- **Planejado:** não implica criação ou deploy.
- **Implementado:** implica mudança verificável em fonte autorizada.
- **Publicado:** requer confirmação no ambiente de destino.
- **Concluído:** requer critérios de aceite atendidos, validação comprovada e pendências relevantes resolvidas ou explicitamente destacadas.
- **Bloqueado:** manter causa, responsável pelo desbloqueio e próxima revisão; não marcar como finalizado.

Registrar a limitação quando não houver acesso ou teste. Não preencher lacunas com hipóteses.

## 7. Cadência prevista — ainda inativa

- Checagem diária proposta: 8h30, incluindo pendências, prioridades e bloqueios.
- Revisão semanal proposta: projetos parados, duplicidades, melhorias e decisões pendentes.
- Relatórios: breves, com destaque para itens críticos e resumo final se extensos.

Esses horários **não** constituem automações configuradas. A ativação, permissões, fontes e custos pertencem à Fase 3.

## 8. Limites da Fase 1

Este commit cria somente documentação dentro de `rdamatheus/personal-os`. Não altera tabelas, registros, autenticação, agendamentos, agentes ativos ou outros repositórios. A Fase 2 requer validação do workspace e da persistência vigente antes de qualquer importação.

Revisões deste manual devem manter histórico versionado no GitHub, linkar decisões relevantes e não sobrescrever silenciosamente políticas anteriores.
