#!/bin/bash

# lnd-logs.sh - Visualización de logs de LND con coloreado semántico
# Uso: ./lnd-logs.sh

echo "🔍 Iniciando monitoreo de logs para el contenedor 'lnbits-lnd'..."
echo "Leyenda: [ERR]=🔴 Rojo, [WRN]=🟡 Amarillo, [INF]=🟢 Verde"
echo "---------------------------------------------------------"

# Usamos docker logs con -f (follow) y --tail para no saturar al inicio
# Redirigimos stderr a stdout (2>&1) para capturar todo
# Usamos awk para colorear línea por línea según el patrón encontrado

docker logs -f --tail 100 lnbits-lnd 2>&1 | awk '
    # Si la línea contiene [ERR] -> ROJO
    /\[ERR\]/ { 
        print "\033[0;31m" $0 "\033[0m"
        fflush() 
        next 
    }
    
    # Si la línea contiene [WRN] -> AMARILLO
    /\[WRN\]/ { 
        print "\033[0;33m" $0 "\033[0m"
        fflush() 
        next 
    }
    
    # Si la línea contiene [INF] -> VERDE (o Cian \033[0;36m)
    /\[INF\]/ { 
        print "\033[0;32m" $0 "\033[0m"
        fflush() 
        next 
    }
    
    # Resto de líneas -> Color por defecto
    { 
        print $0 
        fflush() 
    }
'
