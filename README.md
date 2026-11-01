# GymFlow

PWA de treino em HTML, CSS e JavaScript puros, com Firebase Auth, Firestore e Hosting.

## Rodar e testar

```bash
npx serve .                                # app em servidor local
TZ=America/Sao_Paulo node --test tests/utils.test.js    # testes das funções puras
vercel deploy --prod                       # publica o site
firebase deploy --only firestore:rules     # publica as regras do banco
```

Ao alterar arquivos do app, aumente `CACHE_NAME` em `sw.js` para os celulares receberem a versão nova.

## Estrutura

| Arquivo | Função |
| --- | --- |
| `js/utils.js` | Funções puras: datas, escape de HTML, união de dados |
| `js/storage.js` | Cópia local por usuário e sincronização com a nuvem |
| `js/data.js` | Catálogo de exercícios e histórico de cargas |
| `js/app.js` | Ações (`data-action`), modais e toast |
| `js/home.js`, `planner.js`, `exercises.js`, `workout.js`, `progress.js`, `settings.js`, `auth.js` | Telas |

## Segurança

**A chave do Firebase em `js/firebase-config.js` é pública por natureza**: todo app web precisa enviá-la ao navegador, então escondê-la não é possível. A proteção vem de:

- `firestore.rules`: cada usuário só acessa os próprios dados, e o formato é validado.
- `firebase.json`: CSP sem scripts inline e demais cabeçalhos de segurança.
- `escapeHtml`: todo dado dinâmico é escapado antes de ir para o HTML.
- Logout: remove do aparelho a cópia local e o cache do Firestore.

Nunca coloque no repositório chaves de servidor, contas de serviço ou arquivos `.env`.

### Configuração manual (Console)

1. **Administrador:** no Firestore, crie o documento `admins/{seu-uid}` (pode ficar vazio). O UID está em Authentication > Users.
2. **Restringir a chave:** em Google Cloud > APIs e serviços > Credenciais, limite a chave por referenciador HTTP a `gymflow-henna.vercel.app/*` e `gyn-tracker.firebaseapp.com/*`, e às APIs Identity Toolkit, Token Service e Firestore.
3. **App Check (opcional):** ative com reCAPTCHA para rejeitar chamadas de fora do app.
