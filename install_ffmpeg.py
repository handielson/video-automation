"""
Instalador automático do FFmpeg para Windows.
Baixa, extrai e configura FFmpeg automaticamente.
"""

import os
import sys
import urllib.request
import zipfile
import shutil
from pathlib import Path
import subprocess

def check_ffmpeg_installed():
    """Verifica se FFmpeg já está instalado."""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except:
        return False

def download_ffmpeg():
    """Baixa FFmpeg essentials."""
    print("📥 Baixando FFmpeg...")
    
    # URL do FFmpeg essentials (versão estática, menor)
    url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    
    download_path = Path("ffmpeg.zip")
    
    try:
        # Download com progress
        def reporthook(count, block_size, total_size):
            percent = int(count * block_size * 100 / total_size)
            sys.stdout.write(f"\r   Progresso: {percent}%")
            sys.stdout.flush()
        
        urllib.request.urlretrieve(url, download_path, reporthook)
        print("\n✅ Download concluído!")
        return download_path
        
    except Exception as e:
        print(f"\n❌ Erro no download: {e}")
        print("\n💡 Alternativa: Baixe manualmente de:")
        print("   https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip")
        return None

def extract_ffmpeg(zip_path: Path):
    """Extrai FFmpeg."""
    print("\n📦 Extraindo FFmpeg...")
    
    extract_dir = Path("C:/ffmpeg_temp")
    extract_dir.mkdir(exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        print("✅ Extração concluída!")
        return extract_dir
        
    except Exception as e:
        print(f"❌ Erro na extração: {e}")
        return None

def install_ffmpeg(extract_dir: Path):
    """Move FFmpeg para C:/ffmpeg e adiciona ao PATH."""
    print("\n⚙️  Instalando FFmpeg...")
    
    # Encontrar pasta extraída (nome varia com versão)
    extracted_folders = [f for f in extract_dir.iterdir() if f.is_dir()]
    
    if not extracted_folders:
        print("❌ Pasta do FFmpeg não encontrada")
        return False
    
    source_dir = extracted_folders[0]
    target_dir = Path("C:/ffmpeg")
    
    try:
        # Remover instalação antiga se existir
        if target_dir.exists():
            print("   Removendo instalação antiga...")
            shutil.rmtree(target_dir)
        
        # Copiar para C:/ffmpeg
        print("   Copiando arquivos...")
        shutil.copytree(source_dir, target_dir)
        
        # Adicionar ao PATH
        bin_path = str(target_dir / "bin")
        
        print(f"\n⚠️  IMPORTANTE: Adicione ao PATH do Windows:")
        print(f"   {bin_path}")
        print("\n📝 Como adicionar ao PATH:")
        print("   1. Pressione Win + R")
        print("   2. Digite: sysdm.cpl")
        print("   3. Vá em 'Avançado' → 'Variáveis de Ambiente'")
        print("   4. Em 'Variáveis do Sistema', encontre 'Path' e clique em 'Editar'")
        print("   5. Clique em 'Novo' e cole o caminho acima")
        print("   6. Clique em 'OK' em todas as janelas")
        print("   7. REINICIE o terminal/PowerShell")
        
        print(f"\n✅ FFmpeg instalado em: {target_dir}")
        return True
        
    except Exception as e:
        print(f"❌ Erro na instalação: {e}")
        return False

def cleanup(zip_path: Path, extract_dir: Path):
    """Remove arquivos temporários."""
    print("\n🧹 Limpando arquivos temporários...")
    
    try:
        if zip_path and zip_path.exists():
            zip_path.unlink()
        
        if extract_dir and extract_dir.exists():
            shutil.rmtree(extract_dir)
        
        print("✅ Limpeza concluída!")
    except:
        pass

def main():
    """Instalação principal."""
    print("=" * 60)
    print("🎬 INSTALADOR AUTOMÁTICO DO FFMPEG")
    print("=" * 60)
    print()
    
    # Verificar se já está instalado
    if check_ffmpeg_installed():
        print("✅ FFmpeg já está instalado e funcionando!")
        print("\nVerificando versão:")
        subprocess.run(['ffmpeg', '-version'])
        return
    
    print("FFmpeg não detectado. Iniciando instalação...\n")
    
    # Baixar
    zip_path = download_ffmpeg()
    if not zip_path:
        return
    
    # Extrair
    extract_dir = extract_ffmpeg(zip_path)
    if not extract_dir:
        cleanup(zip_path, None)
        return
    
    # Instalar
    success = install_ffmpeg(extract_dir)
    
    # Limpar
    cleanup(zip_path, extract_dir)
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 INSTALAÇÃO CONCLUÍDA!")
        print("=" * 60)
        print("\n⚠️  NÃO ESQUEÇA:")
        print("   1. Adicione C:\\ffmpeg\\bin ao PATH (instruções acima)")
        print("   2. REINICIE o terminal/PowerShell")
        print("   3. Teste: ffmpeg -version")
        print("\n📝 Depois:")
        print("   python generate_video.py --topic 'Sua curiosidade'")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  Instalação cancelada pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
