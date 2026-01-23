#!/bin/bash

# colorlogs.sh - Script para visualizar logs de Docker con colores usando ccze
# Uso: ./colorlogs.sh

# Verificar si Homebrew está instalado (para sugerir instalación)
HAS_BREW=false
if command -v brew &> /dev/null; then
    HAS_BREW=true
fi

# Verificar si ccze está instalado
if ! command -v ccze &> /dev/null; then
    echo "❌ Error: La herramienta 'ccze' no está instalada."
    echo "Es necesaria para colorear los logs."
    echo ""
    
    if [ "$HAS_BREW" = true ]; then
        echo "🍺 Puedes instalarla fácilmente con Homebrew:"
        echo "   brew install ccze"
    else
        echo "💡 Por favor instala 'ccze' usando tu gestor de paquetes."
        echo "   Ejemplo (Mac/Linux con Homebrew): brew install ccze"
        echo "   Ejemplo (Debian/Ubuntu): sudo apt-get install ccze"
    fi
    exit 1
fi

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q lnbits-lnd; then
    echo "⚠️  Advertencia: El contenedor 'lnbits-lnd' no parece estar corriendo."
    echo "   Intentando obtener logs de todos modos..."
fi

echo "🎨 Mostrando logs de lnbits-lnd con colores (Presiona Ctrl+C para salir)..."
echo "---"

# Ejecutar logs y pipear a ccze
# -f: follow output
# --tail 100: mostrar solo las últimas 100 líneas al iniciar para no saturar
docker logs -f --tail 100 lnbits-lnd 2>&1 | ccze -A
