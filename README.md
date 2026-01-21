# Biterva MVP

Biterva es una plataforma que permite a los usuarios enviar y recibir Satoshis, integrando una pasarela de pagos y servicios financieros simplificados.

## Estructura del Proyecto

El repositorio está organizado en tres componentes principales:

### 1. Frontend (Web App)
- **Tecnología**: React.js (Next.js framework)
- **Despliegue**: Vercel (biterva.com)
- **Descripción**: Interfaz de usuario donde se gestionan las cuentas, envíos y recepciones de dinero.

### 2. Backend (Lógica de Negocio)
- **Tecnología**: Node.js con Serverless Framework.
- **Despliegue**: AWS Lambda.
- **Descripción**: Maneja la lógica de negocio, orquestación de transacciones y comunicación entre el frontend, LNBits y servicios externos.

### 3. LNBits (Banco / Cajero)
- **Tecnología**: LNBits (Customizado).
- **Despliegue**: AWS EC2.
- **Descripción**: Actúa como el ledger y gestor de wallets de los usuarios.
- **Configuración de Liquidez**:
  - Configurado con **Neutrino** para manejo de liquidez ligera.
  - Conexión con **BlueWallet** o **LNPlay** para fuentes de liquidez externas.
  - Aquí residen la "Wallet Administradora de Biterva" y las wallets individuales de los usuarios.

---

## Flujo de Trabajo V1.0

### Objetivo Principal
Permitir a los usuarios enviar y recibir Satoshis de manera fluida, con capacidad de conversión a moneda local (COP) vía Nequi.

### Componentes de Liquidez y Gestión
1.  **LNBits (Local/Docker)**: Sirve como el "banco" interno. Aquí se crean las wallets de los usuarios.
2.  **Trokera**: Plataforma externa utilizada para el fondeo, swap (intercambio) de monedas y dispersión a Nequi.
    - **APIs usadas**:
        - `Create Invoice`: Para crear solicitudes de pago.
        - `Swap`: SATS → USDT y USDT → COP.
        - `Ramp Off / Enviar a Nequi`: Dispersión de fondos a cuentas bancarias.

### Caso de Uso: Retiro a Nequi (Bajar Cripto)
El flujo para que un usuario retire sus fondos a su cuenta Nequi es el siguiente:

1.  **Solicitud**: El usuario ingresa el monto a retirar y su número de Nequi en la App (Frontend).
2.  **Verificación**: El sistema calcula la cantidad de Satoshis necesaria y verifica fondos.
3.  **Transferencia Interna (Biterva)**:
    - Los Satoshis se mueven desde la wallet del usuario a la **Wallet Administradora de Biterva** (en LNBits).
4.  **Transferencia a Proveedor (Trokera)**:
    - Desde la Wallet Administradora de Biterva, se envían los fondos a la **Wallet Administradora de Trokera**.
5.  **Validación**: Se verifica que los fondos hayan llegado correctamente a ambas wallets administradoras.
6.  **Swap y Dispersión**:
    - Trokera ejecuta el swap internamente (SATS → USDT → COP).
    - Trokera envía el dinero final al Nequi del titular de la cuenta (Desarrollador/Administrador).
    - *Nota: En esta versión MVP, el administrador dispersa manualmente desde su Nequi al Nequi del usuario final.* 

---

## Stack Tecnológico Detallado

| Componente | Stack | Infraestructura |
|------------|-------|-----------------|
| **Frontend** | React.js, Next.js, TailwindCSS | Vercel |
| **Backend** | Node.js, TypeScript, Serverless | AWS Lambda |
| **LNBits** | Python, Quart, Vue.js | AWS EC2 (Docker) |
| **Integraciones** | Trokera API | - |
