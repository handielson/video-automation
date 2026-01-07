# 🎬 Instalação do FFmpeg - Guia Rápido

## Opção 1: Instalador Automático (RECOMENDADO) ⭐

Execute o script de instalação automática:

```bash
python install_ffmpeg.py
```

**O que ele faz:**
1. ✅ Baixa FFmpeg automaticamente
2. ✅ Extrai para `C:\ffmpeg`
3. ✅ Te guia para adicionar ao PATH

**Depois da instalação:**
1. Adicione `C:\ffmpeg\bin` ao PATH do Windows (o script te mostra como)
2. **REINICIE o terminal/PowerShell**
3. Teste: `ffmpeg -version`

---

## Opção 2: Instalação Manual

### Passo 1: Download
Baixe: [FFmpeg Essentials](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip)

### Passo 2: Extrair
Extraia para: `C:\ffmpeg`

### Passo 3: Adicionar ao PATH

**Método Rápido (PowerShell Admin):**
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", "Machine")
```

**Método Manual:**
1. Pressione `Win + R`
2. Digite: `sysdm.cpl`
3. Vá em **Avançado** → **Variáveis de Ambiente**
4. Em **Variáveis do Sistema**, encontre **Path** → **Editar**
5. Clique em **Novo**
6. Cole: `C:\ffmpeg\bin`
7. Clique **OK** em todas as janelas
8. **REINICIE o terminal**

### Passo 4: Verificar
```bash
ffmpeg -version
```

---

## Opção 3: Package Managers

### Chocolatey (se instalado):
```bash
choco install ffmpeg
```

### Winget (Windows 11):
```bash
winget install Gyan.FFmpeg
```

### Scoop:
```bash
scoop install ffmpeg
```

---

## ✅ Depois de Instalar

**Teste o sistema completo:**
```bash
python generate_video.py --topic "Curiosidade sobre o espaço"
```

**Vai gerar automaticamente:**
- ✅ Roteiro com IA
- ✅ Narração com voz
- ✅ Vídeos de fundo
- ✅ Música
- ✅ **VÍDEO MP4 COMPLETO!** 🎉

---

## 🐛 Troubleshooting

### "ffmpeg não é reconhecido"
- Verifique se adicionou ao PATH
- **REINICIE o terminal**
- Verifique: `echo %PATH%` (deve conter `C:\ffmpeg\bin`)

### Erro de permissão
- Execute PowerShell/CMD como **Administrador**

### Download falha
- Baixe manualmente o ZIP
- Coloque em `C:\ffmpeg`
- Adicione `C:\ffmpeg\bin` ao PATH

---

## 📞 Suporte

FFmpeg instalado? Teste agora:
```bash
python generate_video.py --topic "Por que o céu é azul"
```

Sistema vai gerar vídeo completo em menos de 2 minutos! 🚀
