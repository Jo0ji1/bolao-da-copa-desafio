# Checklist de Entrega

## 1. Supabase

1. Criar projeto no Supabase.
2. Abrir SQL Editor.
3. Executar o arquivo supabase/schema.sql.
4. Em Authentication > Providers, manter Email habilitado.
5. Criar um usuario admin e marcar is_admin = true na tabela profiles.

## 2. App

1. Copiar .env.example para .env.
2. Preencher EXPO_PUBLIC_SUPABASE_URL.
3. Preencher EXPO_PUBLIC_SUPABASE_ANON_KEY.
4. Rodar npm install.
5. Rodar npm run android (ou npm run ios / npm run web).

## 3. Validacao funcional

1. Criar conta e fazer login.
2. Cadastrar palpites para partidas futuras.
3. Inserir resultado oficial usando conta admin.
4. Verificar pontos atualizados no ranking.
5. Criar grupo e entrar com outro usuario usando codigo.
6. Verificar ranking por grupo.
7. Ativar lembretes de notificacao.
8. Confirmar que usuarios comuns veem a aba Guia e o admin ve a aba Resultados.

## 4. Publicacao no GitHub

1. git init
2. git add .
3. git commit -m "feat: sistema completo de bolao da copa"
4. Criar repositorio no GitHub.
5. git remote add origin <URL_DO_REPOSITORIO>
6. git branch -M main
7. git push -u origin main

## 5. Entrega academica

Anexar:

- Link do repositorio no GitHub.
- Video curto de demonstracao (opcional, recomendado).
- Evidencias (prints) de:
  - login/cadastro,
  - palpites,
  - resultados,
  - ranking,
  - grupos.
