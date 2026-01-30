# 🏦 Biterva LNBits Infrastructure Documentation

Este directorio contiene la configuración para el despliegue de la infraestructura de Biterva en AWS, enfocada en un entorno de producción local/demos resiliente y de bajo costo.

## 🏗️ Arquitectura
La solución utiliza tres contenedores Docker corriendo en una instancia EC2:
1.  **LNBits (v1.4.1-rc2):** La plataforma de pagos y gestión de carteras.
2.  **LND (v0.17.3-beta):** El nodo de Lightning Network corriendo en modo **Neutrino** (ligero).
3.  **Tor:** Túnel de red para saltarse bloqueos de ISP y permitir conexiones P2P sin necesidad de abrir puertos complejos en AWS.

## 📁 Archivos de Configuración
*   `template.yml`: CloudFormation para crear la instancia EC2, Security Groups y la **Elastic IP** (IP Fija).
*   `docker-compose.yml`: Orquestación de los servicios. Está optimizado para la nube.
*   `deploy.sh`: Script de automatización para lanzar la infraestructura y configurar el servidor.

## 🛡️ Mejores Prácticas Implementadas
*   **Etiquetado (Tagging):** Todos los recursos en AWS están marcados con el nombre `Biterva-LNBits-Production` para fácil gestión en la consola.
*   **IP Elástica:** Se utiliza una IP estática (`3.132.82.187`) para que el Backend y el APK no necesiten cambios de configuración si el servidor se reinicia.
*   **Seguridad:** Los Security Groups están restringidos a los puertos estrictamente necesarios:
    *   `22`: SSH
    *   `7777`: LNBits UI
    *   `9735`: Lightning P2P
    *   `8080`: LND REST API
*   **Persistencia:** Los datos de la wallet y de LNBits se guardan en volúmenes EBS persistentes de 30GB.

## 🚀 Comandos Útiles
*   **Entrar al servidor:** `ssh -i biterva-lnbits-key.pem ubuntu@3.132.82.187`
*   **Ver Logs:** `sudo docker logs -f lnbits-lnd`
*   **Reiniciar Todo:** `sudo docker compose restart`

## 💰 Gestión de Costos
Para ahorrar, puedes apagar la instancia desde la consola de AWS. Al encenderla:
1.  La IP se mantendrá igual.
2.  LND tardará ~2-5 minutos en sincronizar los bloques faltantes.
3.  LNBits estará disponible inmediatamente.
