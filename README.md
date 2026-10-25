# Respawn Arcade Archive

RESPawn — PARTE 1/6: AUDITORIA E BASE



Feito por: GREGORI G.



Este é um projeto EXISTENTE. O ZIP contém o RESPawn atual. Não recrie, redesenhe ou substitua o site. Preserve os 545 jogos, URLs, capas, player, visual, navegação e funcionalidades.



Antes de alterar, leia o código, rotas, componentes, catálogo, banco/migrações, autenticação, saves, WebRTC e testes. Use também os arquivos de auditoria/documentação existentes como contexto.



Corrija primeiro apenas problemas reais encontrados, principalmente:



- vazamento de dados após logout/troca de conta;

- timestamps e limites manipuláveis pelo cliente;

- avaliações pessoais afetando indevidamente rankings;

- pedidos duplicados/sem status;

- problemas de favoritos/filtros;

- virtualização do catálogo;

- acessibilidade do menu móvel.



Mantenha o catálogo-base de 545 jogos intacto. Overrides administrativos devem continuar separados.



Não implemente novas funcionalidades grandes nesta etapa.



Execute os testes existentes e verifique build/lint quando disponíveis.



Não avance para outras etapas automaticamente. Informe o que foi corrigido e o que ficou pendente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4895b59b-fec8-47ac-9a26-1c1adcf31bb3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
