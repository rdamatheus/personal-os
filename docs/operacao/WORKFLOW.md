# Fluxo operacional: da ideia à entrega

> **Etapa 1:** procedimento documental. Nenhum gatilho, webhook, monitoramento de PR, agenda automática ou mudança no Supabase foi implantado.

## Estados

| Estado | Significado | Saída permitida |
| --- | --- | --- |
| `capturado` | Ideia ou pedido ainda sem compromisso | Investigar e classificar |
| `analisado` | Contexto, alternativas, riscos e escopo descritos | Propor decisão |
| `aguardando_aprovacao` | Existe mudança de estado proposta, não autorizada | Somente leitura/revisão |
| `aprovado` | Autorização explícita para escopo delimitado | Executar o escopo aprovado |
| `em_execucao` | Trabalho autorizado em andamento | Testar, registrar evidências |
| `bloqueado` | Impedimento ou dependência identificada | Desbloquear com decisão apropriada |
| `em_revisao` | Entrega preparada, testes descritos, PR ou proposta submetida | Aguardar decisão |
| `concluido` | Resultado validado e encerrado | Registrar resultado, acompanhar efeito quando previsto |
| `cancelado` | Decisão de não continuar | Registrar justificativa, não apagar histórico |

Nomes acima são **vocabulário de coordenação**, não enum já gravado no banco. Não alterar valores existentes nas tabelas até a modelagem ser aprovada. Estados de execução podem ser refletidos em uma futura projeção, sem duplicar o registro autoritativo.

## Fluxo com portas de aprovação

```text
pedido/ideia
  -> análise e contexto (somente leitura)
  -> proposta com impactos e riscos
  -> autorização explícita
  -> execução isolada da etapa aprovada
  -> testes e evidências
  -> revisão/PR (sem merge automático)
  -> aprovação específica de merge/deploy, quando aplicável
  -> validação em destino autorizado
  -> conclusão registrada + próximo passo
```

**Regra de mudança:** criar branches, commits, arquivos ou PRs também são alterações de estado; exigem autorização, mesmo que não afetem produção. Se a pessoa aprovar uma PR para documentação, não significa autorizar code changes, migrations ou merge. Aprovação de implementação não equivale à aprovação de deploy.

## Trabalho de desenvolvimento

- Verificar o repositório, branch padrão, artefatos existentes e PRs em aberto.
- Criar branch por funcionalidade delimitada **após aprovação**. Usar nomes descritivos (`docs/`, `feat/`, `fix/`).
- Desenvolver somente no branch, com mocks/dados sintéticos quando houver dependência de dados reais.
- Validar sintaxe, coerência de links, testes adequados ao tipo de alteração e escopo do diff.
- Abrir PR com resumo, justificativa, riscos, validações, evidências, dependências, rollback e aprovação pendente.
- Não ativar auto-merge nem vincular deploy de produção à branch. Se um CI ou preview automático disparar, verificar seu alcance; não considerar isso autorização de produção.
- Após aprovação do merge, verificar novamente requisitos e riscos antes de executá-lo; nunca presumir que a aprovação da documentação autoriza produção.

## Registro de continuidade

Cada atualização aprovada no destino persistente deverá incluir:

- ID estável do projeto e, se existir, da tarefa no Personal OS;
- origem do evento (`chat`, `work`, `github_pr`, sistema de negócio etc.) e URL/ID externo;
- data, ator, observação factual e referência da evidência;
- estado anterior e novo estado, se houve alteração autorizada;
- escopo autorizado e referência da decisão;
- próximo passo, dono, dependências e bloqueio;
- validação realizada ou justificativa de impossibilidade.

Não criar tarefa paralela quando uma entidade preexistente puder ser ligada por identificador e URL. Não registrar as mesmas OS, clientes ou produtos em `personal_os.tasks`.

## Rotina de revisão proposta (não agendada)

- **Diária quando houver uso:** revisar aprovações, bloqueios e próximos passos.
- **Semanal:** examinar PRs abertas e projetos sem atualização, comparar com fontes originais e propor replanejamento.
- **Ao fechar uma entrega:** atualizar manual quando houver nova decisão estrutural, via branch/PR com aprovação.

Essas frequências são sugestões de processo, **não automações ativas**.

## Evidências e validação

Para documentação: conferir que somente arquivos previstos mudaram, caminhos relativos resolvem, dados públicos não incluem segredos e PR aponta para branch correta. Para código: além disso, rodar testes/CI pertinentes. Para integrações: validar autenticação, isolamento, idempotência, reconciliação e auditoria em ambiente autorizado antes de liberar produção.

O estado `concluido` não deve ser usado se a implementação não tiver validação razoável; registrar precisamente o que falta.

## Notificações

PRs podem oferecer eventos e alertas no GitHub conforme configurações de conta/repositório. Avisos via ChatGPT, e-mail, calendário ou painel dependem de integração explícita, autorização e validação da entrega. Nenhum agente deve prometer monitorar ou avisar posteriormente sem um agendamento/serviço realmente configurado.
