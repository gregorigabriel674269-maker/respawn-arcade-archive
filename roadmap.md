# Evolução completa do RESPawn

## Parte 1/6 — Auditoria e base
- [x] Importar projeto existente, ler código/migrações/testes; 27 testes aprovados.
- [x] Corrigir vazamento de autoria de pedidos após logout, janela virtual vazia e foco/rótulos do menu móvel.
- [ ] Aplicar .lovable/pending/0015 (datas de histórico/denúncias no servidor): depende de conectar a Lovable Cloud deste projeto.
- [x] Auditar integralmente páginas, catálogo, player, contas, comunidade, saves, controle, dados, segurança e testes; 22 testes aprovados, oito páginas verificadas em PC/celular.
- [ ] Apresentar arquitetura e plano incremental preservando a identidade; confirmar limites antiabuso e conta proprietária do ADMIN.
- [ ] Adaptar backend e autenticação administrativa com permissões e auditoria.
- [ ] Integrar comentários, likes, pedidos com status/duplicidade, avaliações, rankings e XP legítimo.
- [ ] Evoluir Cloud Save com versões/conflitos e compatibilidade explícita.
- [ ] Evoluir controle por celular e QR com conexão, reconexão e compatibilidade real.
- [ ] Exibir “Feito por: GREGORI G.” preservando o layout.
- [ ] Validar PC/celular, segurança e fluxos reais; corrigir regressões e registrar limitações verificadas.

## Pendências anteriores
- [x] Revisar a auditoria relatada: sinalização RTC, GTA duplicado, player bloqueado, filtros, capas, referências e segurança das contas.
- [x] Corrigir bugs confirmados do catálogo, player, contas e status de conexão multiplayer; 22 testes aprovados e player validado em 1280px/411px.
- [x] Perfis e comunidade real, favoritos e histórico sincronizados já implementados e tabelas/políticas conferidas.
- [x] Controle remoto por QR e controles de toque já implementados com sinalização autenticada.
- [x] Desafio diário já implementado com três tentativas e classificação validada.
- [x] Saves privados na nuvem e importação/exportação já implementados; bucket privado conferido.
- [x] Instalação e acesso offline seguro já implementados.
- [ ] Validar fluxos autenticados reais entre aparelhos e contas: depende de uma conta cadastrada; não há usuário para gerar sessão de teste.
- [ ] Confirmar reprodução e bloqueios dos 545 jogos externos: depende de testes individuais nos sites; auditoria local registra disponibilidade desconhecida.
- [x] Conferir arquitetura, catálogo e manifesto existente (manifesto ausente nesta cópia).
- [x] Selecionar 200 jogos reais e documentar critérios.
- [x] Buscar, conferir e otimizar capas originais; registrar pendências honestamente.
- [x] Integrar capas compartilhadas, fallback com uma tentativa e carregamento próximo à tela.
- [x] Auditar arquivos e testar busca, favoritos, histórico, surpresa e tamanhos de tela.
- [x] Documentar resultados, fontes, licenças e problemas restantes em relatório com os 200 jogos.
- [ ] Completar capas restantes: depende de fonte original exata, edição identificável e formato utilizável; não substituir mods/jogos Web por capa do jogo-base.
- [ ] Confirmar licenças de redistribuição: depende de autorização/documentação dos titulares.