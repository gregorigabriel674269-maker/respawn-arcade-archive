# Evolução do RESPawn sem recriar o site

## Auditoria concluída
- As oito páginas existentes abriram em PC e celular, sem erros JavaScript observados ou transbordamento horizontal; busca por Portal funcionou nos dois tamanhos.
- Os 22 testes existentes passaram. Contas, comunidade e partidas estão vazias nesta versão; fluxos autenticados ainda não foram comprovados.
- Catálogo atual: 545 jogos retidos. Preservar nomes, URLs, capas, cores, fontes, cards, player, navegação e funcionalidades existentes.
- Principais correções necessárias: isolamento dos saves após troca de conta, timestamps/limites manipuláveis, avaliações pessoais fora do ranking, pedidos sem status/duplicidade, timer do desafio e janela do catálogo após remover favoritos.
- Comentários, likes, XP e ADMIN ainda não existem. Saves atuais são arquivos privados enviados manualmente; controle atual é uma arena própria. Não apresentar essas funções como integração universal de jogos externos.

## 1. Fundação e correções
Corrigir os riscos encontrados antes de adicionar recompensas ou administração. Proteger respostas antigas após logout/troca de conta, impor datas no servidor, serializar limites e preservar avaliações pessoais. Ajustar ciclo/finalização do desafio, virtualização e acessibilidade do menu móvel sem mudar o visual.

Adicionar discretamente **Feito por: GREGORI G.** ao site.

## 2. Contas e ADMIN
Reutilizar cadastro, login, logout, recuperação e perfil existentes; acrescentar página da conta com atividade, estatísticas e progressão reais.

Criar ADMIN adaptado à navegação atual, solicitando email, senha e código administrativo. A senha usa o serviço de autenticação existente; o código será fornecido por campo seguro de segredo, nunca pelo chat ou código público.

A conta proprietária será **gregorigabriel16@gmail.com**, somente após confirmação da conta. Não conceder permissões ao primeiro cadastro, por nome ou metadados editáveis. Todo comando administrativo verifica papel e liberação administrativa temporária no servidor.

## 3. Comunidade e progressão
- Pedidos persistidos com posição, votos, autor público mínimo, data e status: aberto, em análise, resolvido ou rejeitado.
- Prevenção de duplicidade por título normalizado e sugestões para votar em solicitações semelhantes. Administração gerencia status e duplicatas.
- Uma avaliação por conta/jogo, média e quantidade reais; editar/remover a própria avaliação.
- Comentários paginados com edição/exclusão pelo autor, likes únicos, ordenação, denúncias e moderação.
- XP registrado pelo servidor em eventos únicos, com limites diários e reversões auditáveis. Repetir, apagar e recriar uma ação não devolve recompensa. Abertura de jogo externo não comprova desempenho e não gera XP competitivo ilimitado.
- Rankings baseados em avaliações com amostra, participação legítima e XP validado; desempenho competitivo apenas onde o RESPawn controla as regras.

## 4. Segurança e administração
Implementar os limites específicos aprovados pelo proprietário para ações sociais, pedidos, votos, XP, sessões de controle e acesso administrativo. Registrar tentativas relevantes e bloqueios temporários. Esses limites não substituem proteção geral contra ataques de infraestrutura; tentativas do serviço de login também exigem conferir as proteções disponíveis no serviço hospedado.

ADMIN terá pedidos, moderação, usuários/permissões, estatísticas, eventos de segurança e auditoria. Edições do catálogo serão revisões persistidas sobre o catálogo base, mantendo URLs atuais até alteração administrativa validada e registrada. Alterações destrutivas exigem confirmação e histórico.

## 5. Saves
Preservar envio/baixar arquivos, acrescentando jogo associado, data, versões imutáveis, checksum, quota e detecção de conflitos. Usuário só lê e modifica seus próprios saves; versões antigas permitem recuperação sem sobrescrita silenciosa.

Sincronização automática somente para jogos próprios ou integrações aprovadas que realmente exponham exportação/importação. Nenhum jogo externo será marcado compatível sem verificação; não relaxar o isolamento do player para acessar progresso.

## 6. Celular como controle
Evoluir a sala atual com convite revogável, expiração, encerramento pelo anfitrião, reconexão e estados claros. Preservar o limite de quatro participantes totais até testes demonstrarem segurança maior.

Adicionar direcional, dois analógicos, botões principais/superiores, gatilhos, Menu/View e vibração quando disponível; interface adaptada à orientação e acessível por toque/teclado.

Integrar comandos em experiências próprias compatíveis e disponibilizar uma camada de adaptadores para jogos externos autorizados. Não simular teclas em qualquer iframe. Conexões em redes restritivas exigem serviço TURN real com credenciais temporárias; sem ele, informar a limitação em vez de prometer conexão universal.

## 7. Revisão e testes
Após cada bloco, executar regressões existentes e testes das novas regras. Verificar PC e celular, busca/filtros, player, favoritos, contas, avaliações/comentários/likes, pedidos/votos, XP/rankings, saves/versões e ADMIN.

Testar diretamente que usuário comum não pode chamar comandos administrativos, alterar XP/pontuação ou acessar save alheio. Testar concorrência, repetição de ações e limites. Verificar fluxo autenticado com contas de teste isoladas, sem colocá-las nos rankings reais; recuperação por email e aparelhos físicos serão relatados como pendentes se não houver evidência real.

## Detalhes técnicos
- Migrações aditivas na Lovable Cloud; GRANT, RLS e índices explícitos. Não apagar tabelas existentes.
- Papéis em tabela separada; código administrativo em secret; liberações curtas vinculadas à sessão e auditadas. Operações privilegiadas verificam autorização antes de usar acesso elevado.
- Funções internas autenticadas em TanStack Start; preservar bearer middleware e CSRF. Nenhuma confiança em IDs locais, pontuação declarada ou papéis enviados pelo navegador.
- Ledger XP e contabilização antiabuso duráveis/idempotentes; timestamps imutáveis e proteção concorrente no banco.
- Catálogo base continua em JSON; overrides/revisões administrativas são separados e validados. Componentes visuais e tokens existentes são reutilizados.
- Saves privados e versionados; respostas assíncronas protegidas contra mudança de identidade. Paginação e consultas direcionadas evitam carregar tudo repetidamente.
- Sinalização WebRTC continua autenticada no banco; mensagens e filas limitadas. Offline nunca armazena auth, ADMIN ou respostas privadas.

## Dependências reais
- Criar e verificar a conta proprietária antes de liberar ADMIN; pedir o código apenas por ferramenta de segredo.
- TURN depende de serviço real e eventual custo aprovado, caso necessário para redes restritivas.
- Reprodução dos 545 jogos, autorização das fontes/capas e integração automática de cada jogo externo exigem verificações individuais; não serão declaradas concluídas por testes locais.

**Resultado esperado:** uma evolução reconhecível do RESPawn, com recursos reais e limitações explícitas, sem redesign, catálogo fictício ou perda das funções atuais.