# Auditoria inicial — RESPawn

## Escopo e evidências
- Revisão de todas as oito rotas, navegação, componentes de catálogo/player, dados, busca/filtros, preferências, armazenamento local, autenticação, comunidade, saves, controle, dependências, cinco migrações e testes existentes.
- 22 testes existentes passaram em cinco arquivos.
- Navegação real nas oito páginas em 1280 × 1800 e 390 × 844: respostas 200, nenhum erro JavaScript observado e nenhum transbordamento horizontal. Busca “Portal” navegou para o catálogo e mostrou o jogo em ambos os tamanhos.
- Lovable Cloud respondeu normalmente. Contas, perfis, avaliações, pedidos, votos e partidas estão vazios; nenhuma conta foi criada artificialmente para parecer usuário real.
- Funções SQL, políticas, índices e configuração do bucket foram consultados no ambiente atual. Configurações hospedadas de cadastro, provedores, confirmação, redirects e recuperação não foram consultadas: permanecem não verificadas.

## Preservar
- Catálogo estático com 545 jogos retidos e URLs atuais, filtros e capas por nome exato.
- Identidade visual atual, cores, fontes, cards, navegação, player e modo escola.
- Contas reais, perfis privados, favoritos/histórico por conta, importação de dados de visitante e limpeza no logout.
- Isolamento de jogos externos por iframe sem allow-same-origin.
- Sinalização WebRTC autenticada por RPC no banco; limite atual de quatro participantes e expiração.
- Desafio próprio com pontuação e tentativas impostas no banco.

## Lacunas e riscos confirmados
1. **Saves:** respostas antigas podem mostrar nomes/metadados de uma conta após troca/logout; falta proteção de identidade em todas as continuações. O bucket é privado, mas não possui limite de tamanho nem MIME configurados; limite de 10 MB está apenas na interface. Não há associação estruturada a jogo, versões/conflitos ou paginação além de 100 arquivos.
2. **Contagens e abuso:** partidas podem aceitar timestamps fornecidos pelo cliente e concorrência no limite; abrir um iframe não comprova jogar. Pedidos/feedback também aceitam timestamps e limites baseados em linhas que podem ser apagadas. Não usar essas contagens como XP autoritativo.
3. **Comunidade:** não existem comentários públicos/likes/moderação/denúncias. Avaliação única por usuário/jogo já existe, mas carregamento agregado dos 20 jogos pode ocultar a avaliação pessoal de outros jogos. Pedidos carecem de status e prevenção de duplicidade; carregar os 100 recentes antes de ordenar votos pode omitir pedidos populares antigos.
4. **Privacidade:** pedidos públicos retornam UUID de conta; resumos expõem nomes de autores sem consentimento separado para publicação. Mostrar somente projeção pública mínima e recuperar propriedade de forma privada. O brief permite autoria pública de pedidos, não exige UUID público.
5. **ADMIN e XP:** não existem papéis administrativos, autorização reforçada por código, logs administrativos ou ledger XP. Não atribuir administrador ao primeiro cadastro ou por metadados editáveis.
6. **Controle:** QR/conexão funcionam como arquitetura de laboratório próprio; não integram jogos externos. Falta TURN para redes restritivas, ciclo de convite revogável/host, controles completos e endurecimento de mensagens/filas. Botão Start não produz ação na arena; controles só possuem eventos de ponteiro.
7. **Desafio:** sequência determinística permite automação; contador local pode divergir no background, reinício de treino reutiliza identidade e requisições antigas podem chegar em outra partida. Falta finalização idempotente de partidas expiradas.
8. **Catálogo e acessibilidade:** janela virtual pode ficar vazia após redução de favoritos/histórico em rolagem profunda; menu móvel “Mais” não possui controle completo de foco/Escape. Busca poderia melhorar navegação por teclado sem mudar visual.
9. **Provisionamento/performance:** migrações SQL são o histórico real; modelo/snapshots Drizzle vazios não devem ser usados para regenerar o banco. Offline deve excluir futuras rotas administrativas. Não há medição de bundle nem auditoria de vulnerabilidades de dependências nesta etapa.

## Limites reais
- Os 545 jogos externos possuem disponibilidade remota não verificada; testes estruturais não garantem reprodução, licenças ou compatibilidade.
- Cloud Save atual é envio/baixar arquivos privados, não sincronização automática universal.
- Controle atual é arena própria, não controle universal dos jogos externos; não enfraquecer o sandbox para simular compatibilidade.
- Sem contas existentes, não foram verificados login real, recuperação por email, RLS entre duas contas, saves autenticados, desafio autenticado ou conexão entre aparelhos reais.
- Lovable Cloud não oferece primitiva padrão de rate limiting; limites específicos transacionais exigem aceite do proprietário e não substituem proteção geral de infraestrutura contra DDoS.

## Estratégia incremental
1. Corrigir isolamento, timestamps, concorrência, avaliações pessoais, virtualização e ciclo de desafio antes de acrescentar recompensas.
2. Migrações aditivas para papéis separados, autorização administrativa, auditoria, comentários/likes/denúncias, pedidos/status, XP idempotente e metadados/versões de saves.
3. Reusar auth atual; código ADMIN armazenado como secret e validado no servidor com liberação curta vinculada à sessão. Conta proprietária precisa ser indicada e verificada antes de conceder papel.
4. Catálogo base permanece em JSON. Edições administrativas ficam em revisões/overrides persistidos, com histórico e validação; nada apaga ou substitui o catálogo original.
5. Introduzir comentários e progressão reais, paginação e rankings com critérios auditáveis; métricas externas continuam identificadas como abertura/participação, não desempenho comprovado.
6. Saves imutáveis/versionados com seleção de jogo, checksum e detecção de conflito; adaptadores automáticos só para integrações aprovadas e tecnicamente verificadas.
7. Controles completos e sessões reais para experiências próprias; compatibilidade externa exige contrato/adaptador validado. TURN requer serviço real e credenciais temporárias, não inventadas.
8. Pequenas melhorias móveis, autoria “Feito por: GREGORI G.” e testes de regressão após cada bloco.

## Próximas decisões
- Aceitar limites antiabuso específicos implementados no banco/servidor, sem prometer rate limiting universal.
- Indicar email da conta proprietária que poderá receber ADMIN; nunca solicitar senha ou código em texto de chat.
- Apresentar plano de implementação antes de alterações funcionais.