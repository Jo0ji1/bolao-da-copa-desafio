# Sistema de Bolao da Copa do Mundo

Projeto completo da atividade "Desafio - Sistema de Bolao da Copa do Mundo", com app mobile, backend em Supabase e documentacao de entrega.

## Funcionalidades implementadas

- Cadastro e login de participantes (Supabase Auth).
- Registro de palpites por partida:
  - placar exato,
  - ou somente vencedor (casa/fora/empate).
- Cadastro de resultados oficiais (tela admin).
- Pontuacao automatica por trigger SQL.
- Ranking geral e ranking por grupo privado.
- Criacao e entrada em grupos por codigo.
- Interface mobile responsiva (Expo + React Native).
- Lembretes de notificacao local para jogos futuros.

## Stack

- Expo + React Native + TypeScript
- Supabase (Postgres, Auth, RLS)
- React Navigation
- expo-notifications

## Estrutura

- src/
  - components/
  - constants/
  - context/
  - lib/
  - navigation/
  - screens/
- supabase/
  - schema.sql
- docs/
  - ARCHITECTURE.md
  - CHECKLIST_ENTREGA.md

## Regras de pontuacao

- 5 pontos: acerto exato do placar.
- 3 pontos: acerto do vencedor/empate.
- 0 pontos: erro.

## Como os palpites funcionam

1. O participante acessa a aba Palpites e escolhe uma partida futura.
2. Pode informar o placar exato ou apenas o vencedor/empate.
3. O sistema bloqueia o envio depois do horario de inicio do jogo.
4. Quando o admin publica o resultado oficial, a pontuacao e recalculada automaticamente.

## Quem e o admin

- O admin nao e um login separado.
- Ele e um usuario comum do app com o campo `profiles.is_admin = true` no Supabase.
- O app mostra a aba Resultados apenas para esse usuario; para os demais, aparece a aba Guia.
- A alteracao e feita diretamente no banco com um update na tabela `profiles`.

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

1. Configure ambiente:

```bash
cp .env.example .env
```

Preencha no .env:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

1. Rode o app:

```bash
npm run android
# ou
npm run ios
# ou
npm run web
```

## Configurar Supabase

1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Execute o script completo em supabase/schema.sql.
4. Crie uma conta de usuario no app.
5. No Supabase, marque esse usuario como admin:

```sql
update public.profiles
set is_admin = true
where id = 'UUID_DO_USUARIO';
```

## Fluxo de uso

1. Usuario cria conta e entra no app.
2. Registra palpites antes do inicio das partidas.
3. Admin publica resultados oficiais.
4. Sistema recalcula pontos automaticamente.
5. Ranking geral e por grupo sao atualizados.
6. Usuarios nao administradores veem a aba Guia com a explicacao do funcionamento.

## Publicar no GitHub

```bash
git init
git add .
git commit -m "feat: sistema completo de bolao da copa"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

## Observacoes de avaliacao

- Projeto atende todos os requisitos obrigatorios da atividade.
- Inclui opcionais: grupos privados e notificacao.
- No Expo Go, os lembretes funcionam de forma local; push remoto exige development build.
- Integracao com API externa de resultados pode ser adicionada em evolucao futura com Edge Functions do Supabase.
