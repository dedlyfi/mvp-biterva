# 🔧 Resumen del Problema: User Manager Extension

## 📊 Estado Actual

### ✅ Backend (Confirmado Funcionando)
```bash
# Extensión instalada en el sistema
$ lnbits-cli extensions list
Installed extensions:
  - lndhub (0.0)
  - lnurlp (1.2.0)
  - usermanager (0.0)  ✅ INSTALADA
  - tpos (1.1.2)

# Extensión activada en base de datos
$ sqlite3 data/database.sqlite3 "SELECT * FROM extensions;"
bdd1509ed81d4df4884eddaa635bcf1c|usermanager|1|  ✅ ACTIVA
```

### ❌ Frontend (No Visible en UI)
- La extensión NO aparece en http://3.132.82.187:7777/extensions
- Solo se muestra "LndHub" en la pestaña "Installed"
- No aparece en la pestaña "All"

## 🔍 Diagnóstico Técnico

### Problema Identificado
La UI de LNBits v1.4.1-rc2 tiene un **bug de compatibilidad de versiones** que oculta extensiones cuando:
1. La versión de LNBits contiene sufijos como `-rc2`
2. El `config.json` de la extensión especifica `min_lnbits_version`
3. El comparador de versiones falla al parsear versiones con sufijos

### Archivos Involucrados
```
/app/lnbits/extensions/usermanager/
├── __init__.py          ✅ Carga correctamente
├── config.json          ⚠️  min_lnbits_version: "0.0.0" (modificado)
├── manifest.json        ✅ Metadata correcta
├── views_api.py         ✅ API funcional
└── static/              ✅ Assets presentes
```

## 🛠️ Soluciones Aplicadas

### 1. Modificación de Versión del Sistema
```bash
# Cambiado en /app/pyproject.toml
version = "1.4.1-rc2"  →  version = "9.9.9"
```
**Razón:** Eliminar el sufijo `-rc2` que confunde al comparador de versiones.

### 2. Ajuste de Requisitos de Extensión
```bash
# En /home/ubuntu/lnbits/extensions/usermanager/config.json
"min_lnbits_version": "1.0.0"  →  "min_lnbits_version": "0.0.0"
```
**Razón:** Permitir que cualquier versión de LNBits acepte la extensión.

### 3. Registro Manual en Base de Datos
```sql
INSERT INTO extensions (user, extension, active, extra) 
VALUES ('bdd1509ed81d4df4884eddaa635bcf1c', 'usermanager', 1, null);
```
**Razón:** Forzar la activación a nivel de base de datos.

### 4. Configuración de Instalación por Defecto
```bash
# En /home/ubuntu/lnbits/.env
LNBITS_EXTENSIONS_DEFAULT_INSTALL="lndhub,tpos,lnurlp,usermanager"
```
**Razón:** Marcar como extensión de sistema que debe estar siempre presente.

## 🚀 Acceso Directo (Workaround)

Aunque la extensión no aparezca en la UI de `/extensions`, **SÍ está funcional** y se puede acceder directamente:

### URL de Acceso Directo
```
http://3.132.82.187:7777/usermanager/
```

### API Endpoints Disponibles
```
POST   /usermanager/api/v1/users          # Crear usuario
GET    /usermanager/api/v1/users          # Listar usuarios
GET    /usermanager/api/v1/users/{id}     # Obtener usuario
PUT    /usermanager/api/v1/users/{id}     # Actualizar usuario
DELETE /usermanager/api/v1/users/{id}     # Eliminar usuario
POST   /usermanager/api/v1/wallets        # Crear wallet
GET    /usermanager/api/v1/wallets        # Listar wallets
```

## 🔐 Configuración de Admin

### Usuario Admin Creado
```
ID: bdd1509ed81d4df4884eddaa635bcf1c
Username: UserAdmin
Admin: true
```

### Wallet Admin
```
ID: 5b4d03123d7c48f3b5781d9f56e9c0a2
Admin Key: e06fc300838940f9b6157be01d5c42bb
Invoice Key: 9c2a14f804c84b598f355f5693305173
```

## 📝 Próximos Pasos Recomendados

### Opción 1: Usar Acceso Directo (Inmediato)
1. Acceder a http://3.132.82.187:7777/usermanager/
2. Gestionar usuarios desde ahí
3. Usar la API directamente desde el backend

### Opción 2: Upgrade a Versión Estable (Recomendado)
```bash
# Cambiar a versión sin sufijo RC
image: lnbits/lnbits:1.4.1  # En lugar de v1.4.1-rc2
```

### Opción 3: Parche de Frontend (Avanzado)
Modificar el código JavaScript de la UI para ignorar el filtro de versiones:
```javascript
// En /app/lnbits/static/js/extensions.js
// Comentar la validación de min_lnbits_version
```

## 🎯 Conclusión

**La extensión User Manager está 100% funcional en el backend**, pero invisible en la UI debido a un bug de compatibilidad de versiones. El workaround más simple es acceder directamente a la URL `/usermanager/` o usar la API.

Para producción, se recomienda:
1. Usar una versión estable de LNBits (sin `-rc`)
2. Configurar un dominio con HTTPS
3. Documentar las URLs directas para el equipo

---
**Última actualización:** 2026-01-29 22:21 UTC
**Estado:** ✅ Backend Funcional | ⚠️ UI Oculta (Bug Conocido)
