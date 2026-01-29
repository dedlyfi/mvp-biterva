# Aplicación Móvil Biterva

Esta es la aplicación móvil oficial de **Biterva**, desarrollada en React Native. Está diseñada para ser una billetera de Bitcoin (Lightning Network) extremadamente sencilla, orientada a usuarios de la Galería de Santa Elena.

## Funcionalidades Principales

1.  **Registro Silencioso (Silent Signup)**:
    - No requiere registro con correo ni contraseña.
    - La cuenta se crea automáticamente y se vincula de forma segura al dispositivo del usuario.
    - Acceso inmediato apenas se abre la aplicación.

2.  **Billetera Bitcoin (Lightning)**:
    - **Saldo en Tiempo Real**: Visualiza tus Satoshis disponibles al instante.
    - **Enviar**: Envía pagos pegando códigos de facturas Lightning (QR scanner próximamente).
    - **Recibir**: Genera códigos QR para recibir pagos de forma rápida y segura.

3.  **Integración con Nequi**:
    - **Retiro Fácil**: Funcionalidad exclusiva para convertir tus Satoshis y enviarlos directamente a tu cuenta Nequi en Colombia.

4.  **Experiencia de Usuario (UX)**:
    - Interfaz simplificada y en español.
    - Modo oscuro amigable para la batería y la vista.
    - Diseño de alto impacto visual y fácil navegación.

## Requisitos Previos

- Node.js (v18 o superior)
- React Native CLI
- Android Studio (para emulador o dispositivo Android)
- Xcode (para simulador o dispositivo iOS - solo Mac)
- CocoaPods (solo para iOS)

## Instalación

1.  Clonar el repositorio y navegar a la carpeta de la aplicación:
    ```bash
    cd frontend-app
    ```

2.  Instalar las dependencias del proyecto:
    ```bash
    npm install
    ```

3.  (Solo iOS) Instalar los pods:
    ```bash
    cd ios && pod install && cd ..
    ```

## Cómo Correr la Aplicación

Para ejecutar la aplicación, necesitas dos terminales.

### 1. Iniciar el Metro Bundler
Este servicio empaqueta el código JavaScript.
```bash
npm start
```

### 2. Ejecutar en el Dispositivo

**Para Android:**
Asegúrate de tener un emulador corriendo o un dispositivo conectado por USB.
```bash
npm run android
```

**Para iOS (Solo Mac):**
```bash
npm run ios
```

## Estructura del Proyecto

- `src/screens`: Pantallas principales (Inicio, Enviar, Recibir, Retirar).
- `src/components`: Componentes reutilizables de UI.
- `src/store`: Gestión del estado global (Billetera, Usuario) usando Zustand.
- `src/services`: Lógica de autenticación y analíticas.
- `src/api`: Configuración del cliente Axios para conectar con el Backend.

## Tecnologías

- **React Native**: Framework principal.
- **NativeWind (Tailwind CSS)**: Estilos y diseño.
- **Zustand**: Manejo de estado.
- **React Navigation**: Navegación entre pantallas.
- **Axios**: Comunicación HTTP con el backend de Biterva.
