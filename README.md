# Amigo secreto

Salas com senha no Supabase. O dono gera um link, todo mundo entra com a senha e, depois do sorteio, cada pessoa vê só o próprio amigo secreto.

```bash
cp .env.example .env
npm install
npm run dev
```

No `.env`, coloque a URL e a chave anon do projeto. No SQL Editor do Supabase, rode `supabase/schema.sql`. Em Authentication → Providers → Email, desative a confirmação de e-mail.
