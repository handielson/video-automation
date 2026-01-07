# 📺 Como Configurar YouTube e TikTok para Upload Automático

## 📺 YouTube - Configuração Completa

### Passo 1: Criar Projeto no Google Cloud Console

1. **Acesse:** https://console.cloud.google.com/
2. **Crie um novo projeto:**
   - Clique em "Selecionar projeto" → "Novo projeto"
   - Nome: `Video Automation` (ou qualquer nome)
   - Clique em "Criar"

### Passo 2: Ativar YouTube Data API v3

1. **No menu lateral**, vá em: `APIs e Serviços` → `Biblioteca`
2. **Pesquise:** `YouTube Data API v3`
3. **Clique** na API e depois em **"Ativar"**

### Passo 3: Criar Credenciais OAuth 2.0

1. **No menu lateral:** `APIs e Serviços` → `Credenciais`
2. **Clique em:** `+ CRIAR CREDENCIAIS` → `ID do cliente OAuth`
3. **Configure a tela de consentimento OAuth:**
   - Tipo: `Externo`
   - Nome do app: `Video Automation`
   - Email de suporte: seu email
   - Domínios autorizados: pode deixar vazio
   - **Salvar e continuar**

4. **Adicione escopos:**
   - Clique em "Adicionar ou remover escopos"
   - Pesquise e adicione: `https://www.googleapis.com/auth/youtube.upload`
   - **Salvar e continuar**

5. **Adicione usuários de teste:**
   - Adicione seu email do YouTube
   - **Salvar e continuar**

6. **Criar credenciais:**
   - Tipo de aplicativo: `Aplicativo de computador`
   - Nome: `Video Automation Desktop`
   - **Criar**

7. **Baixe as credenciais:**
   - Clique no botão **"Baixar JSON"**
   - Salve como: `client_secrets.json`
   - **Importante:** Guarde esse arquivo em local seguro!

### Passo 4: Obter Channel ID

1. **Acesse:** https://www.youtube.com/account_advanced
2. **Copie** o "ID do canal" (algo como `UCxxxxxxxxxxxxxxxxxx`)

### Passo 5: Configurar no Sistema

**Opção 1: Via Dashboard (Recomendado)**
1. Acesse: http://localhost:5000/settings
2. **YouTube:**
   - ✅ Marque "Habilitar upload automático"
   - **ID do Canal:** Cole o ID copiado
   - **Caminho do client_secrets.json:** `C:/caminho/completo/client_secrets.json`
3. **Salvar Configurações**

**Opção 2: Arquivo .env**
```env
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxx
YOUTUBE_CLIENT_SECRETS=C:/caminho/client_secrets.json
```

---

## 🎵 TikTok - Configuração Completa

### Método 1: Session ID (Mais Fácil)

1. **Faça login no TikTok:**
   - Acesse: https://www.tiktok.com/
   - Faça login na sua conta

2. **Abra as Ferramentas do Desenvolvedor:**
   - Pressione `F12` (Chrome/Edge)
   - Ou `Ctrl+Shift+I` (Firefox)

3. **Vá para a aba "Application" (Chrome) ou "Armazenamento" (Firefox)**

4. **Encontre os Cookies:**
   - No menu lateral: `Cookies` → `https://www.tiktok.com`
   - Procure por: `sessionid`
   - **Copie o valor** (algo como: `7a0af...grande string...`)

5. **Configure no Sistema:**
   - Dashboard: http://localhost:5000/settings
   - **TikTok:**
     - ✅ Marque "Habilitar upload automático"
     - **Nome de usuário:** @seunome
     - **Session ID:** Cole o valor copiado
   - **Salvar**

### Método 2: TikTok API Oficial (Avançado)

1. **Criar Conta de Desenvolvedor:**
   - Acesse: https://developers.tiktok.com/
   - Clique em "Get Started"
   - Complete o registro

2. **Criar Aplicação:**
   - No painel: "My Apps" → "Create an App"
   - Nome: `Video Automation`
   - Categoria: `Content Posting`

3. **Obter Credenciais:**
   - **Client Key:** Copie da tela do app
   - **Client Secret:** Copie da tela do app

4. **Configurar Redirect URI:**
   - Adicione: `http://localhost:8080/callback`

5. **Salvar no .env:**
```env
TIKTOK_CLIENT_KEY=awxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxx
```

---

## 🚀 Testando Upload Automático

### YouTube
```bash
python upload_to_youtube.py --video output/video.mp4 --title "Título" --description "Descrição"
```

### TikTok
```bash
python upload_to_tiktok.py --video output/video.mp4 --caption "Legenda #hashtag"
```

---

## ⚠️ Avisos Importantes

### YouTube:
- **Limite de quota:** 10.000 unidades/dia (suficiente para ~6 uploads diários)
- **Primeira autenticação:** Abrirá navegador para autorizar
- **Token salvo em:** `data/youtube_token.json`

### TikTok:
- **Session ID expira:** Pode precisar renovar após alguns dias
- **Limite de uploads:** Depende da sua conta (geralmente 3-10 por dia)
- **Vídeos curtos:** TikTok prefere vídeos de 15-60 segundos

---

## 🔐 Segurança

**NUNCA compartilhe:**
- ❌ `client_secrets.json`
- ❌ Session IDs
- ❌ Access Tokens
- ❌ Arquivo `.env`

**Adicione ao .gitignore:**
```
client_secrets.json
youtube_token.json
.env
data/settings.json
```

---

## ❓ Problemas Comuns

### YouTube: "Quota Exceeded"
**Solução:** Aguarde 24h ou crie outro projeto no Google Cloud

### TikTok: "Session Invalid"
**Solução:** Copie um novo Session ID seguindo o Método 1

### YouTube: "Insufficient Permission"
**Solução:** 
1. Delete `data/youtube_token.json`
2. Execute novamente para reautorizar

---

## 📚 Links Úteis

- **YouTube API Console:** https://console.cloud.google.com/
- **YouTube API Docs:** https://developers.google.com/youtube/v3
- **TikTok Developers:** https://developers.tiktok.com/
- **Obter Channel ID:** https://www.youtube.com/account_advanced

---

## ✅ Checklist de Configuração

**YouTube:**
- [ ] Projeto criado no Google Cloud
- [ ] YouTube Data API v3 ativada
- [ ] Credenciais OAuth criadas
- [ ] `client_secrets.json` baixado
- [ ] Channel ID copiado
- [ ] Configurado no dashboard

**TikTok:**
- [ ] Session ID copiado
- [ ] Nome de usuário configurado
- [ ] Testado upload manual

**Sistema:**
- [ ] Dashboard acessível
- [ ] Configurações salvas
- [ ] Teste de upload realizado

---

**Pronto! Agora você pode fazer uploads automáticos!** 🎉
