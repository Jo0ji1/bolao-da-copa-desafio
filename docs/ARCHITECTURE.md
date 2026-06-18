# Arquitetura - Sistema de Bolao da Copa

## Visao geral

Aplicativo mobile em React Native (Expo) com backend no Supabase.

- Frontend: Expo + TypeScript + React Navigation.
- Backend: Supabase (Postgres + Auth + RLS).
- Notificações locais podem ser incorporadas futuramente, mas não fazem parte da versão acadêmica final publicada.

## Modulos principais

- Autenticacao
  - Cadastro e login via Supabase Auth.
  - Sessao persistida com AsyncStorage.

- Palpites
  - Usuario pode registrar placar exato e/ou vencedor.
  - Bloqueio de edicao apos horario de inicio da partida.

- Resultados oficiais
  - Tela de administracao para inserir placares oficiais.
  - Atualizacao automatica da pontuacao apos insercao do resultado.

- Ranking
  - Ranking geral (todos os usuarios).
  - Ranking por grupo privado.

- Grupos
  - Criacao de grupos privados com codigo.
  - Entrada em grupo via codigo.

## Regra de pontuacao

- 5 pontos: acerto exato do placar.
- 3 pontos: acerto do vencedor/empate.
- 0 pontos: erro.

## Controle de admin

- O admin e um usuario normal do sistema.
- O privilegio e dado por `profiles.is_admin = true` no Supabase.
- A interface oculta a area de resultados para participantes comuns e mostra um guia explicativo.

A regra e aplicada automaticamente no banco por trigger/funcoes SQL.

## Modelagem de dados

Tabelas:

- profiles
- matches
- predictions
- pools
- pool_members

Views:

- leaderboard_overall
- leaderboard_by_pool

## Seguranca

RLS habilitado em todas as tabelas.

- Usuario so le/escreve os proprios palpites.
- Apenas admin altera resultados oficiais.
- Grupos privados visiveis apenas para membros (ou criador).

## Fluxo de dados

1. Usuario faz login.
2. App carrega partidas e palpites do usuario.
3. Usuario envia palpite.
4. Admin publica resultado oficial.
5. Trigger recalcula pontos automaticamente.
6. Ranking e atualizado via views.
