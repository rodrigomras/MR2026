#!/usr/bin/env python3
"""
Gera fotos/lista.json — a lista de fotografias que o site usa na
galeria rotativa da secção "Nós".

Corre este script sempre que adicionares ou tirares fotos desta pasta:

    python3 gerar-lista.py

Não precisas de seguir nenhum nome específico (foto-1.jpg, etc.) —
qualquer .jpg, .jpeg, .png ou .webp é aceite, exceto:
  - foto-0.* (fica reservada para o fundo do topo do site)
  - ficheiros que terminem em ".orig.jpg" (cópias de segurança)
  - ficheiros .heic / .HEIC (ver aviso abaixo)

Sobre fotos HEIC (formato do iPhone)
-------------------------------------
Os navegadores não conseguem mostrar ficheiros .heic. Se tiveres fotos
nesse formato, converte-as primeiro para .jpg — no iPhone: Definições
> Câmara > Formatos > "Mais Compatível", ou exporta a foto como JPEG
a partir da app Fotos (Partilhar > Guardar Imagem, ou "Duplicar como
JPEG"). Depois volta a correr este script.
"""
import json
import os

PASTA = os.path.dirname(os.path.abspath(__file__))
EXTENSOES_OK = {'.jpg', '.jpeg', '.png', '.webp'}

fotos = []
avisos_heic = []

for nome in sorted(os.listdir(PASTA)):
    caminho = os.path.join(PASTA, nome)

    if not os.path.isfile(caminho) or nome.startswith('.'):
        continue
    if nome.lower().endswith(('.orig.jpg', '.orig.jpeg', '.orig.png')):
        continue

    raiz, ext = os.path.splitext(nome)
    ext = ext.lower()

    if raiz.lower().startswith('foto-0'):
        continue
    if ext in ('.heic', '.heif'):
        avisos_heic.append(nome)
        continue
    if ext not in EXTENSOES_OK:
        continue

    fotos.append(nome)

# Escreve dois ficheiros com a mesma lista:
#   lista.js    → lido pelo site mesmo sem servidor (duplo clique)
#   lista.json  → usado quando o site está publicado
with open(os.path.join(PASTA, 'lista.json'), 'w', encoding='utf-8') as f:
    json.dump(fotos, f, ensure_ascii=False, indent=2)

with open(os.path.join(PASTA, 'lista.js'), 'w', encoding='utf-8') as f:
    f.write('/* Gerado automaticamente por gerar-lista.py. Não editar à mão. */\n')
    f.write('window.FOTOS = ')
    json.dump(fotos, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f"lista.js e lista.json atualizadas com {len(fotos)} fotografia(s).")

if avisos_heic:
    print("\nAtenção — estes ficheiros HEIC foram ignorados (não aparecem em navegadores):")
    for nome in avisos_heic:
        print(f"  - {nome}")
    print("Converte-os para .jpg e corre o script outra vez.")
