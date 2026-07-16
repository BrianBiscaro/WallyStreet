# 📈 Wally Street - Simulador de Inversiones

Wally Street es una aplicación web funcional que simula un entorno de mercado financiero interactivo. El sistema permite a los usuarios registrados gestionar un capital virtual e invertir en activos volátiles para incrementar su patrimonio en tiempo real.

Este proyecto integral fue desarrollado como entrega final para el Seminario de Lenguajes (Opción: PHP, React y API Rest) en la Universidad Nacional de La Plata.

## 💻 Stack Tecnológico

- **Frontend**: React 19 empaquetado con Vite, utilizando Function Components y Context API. Enrutamiento con React Router DOM v7 y peticiones HTTP mediante Axios.
- **Backend (API REST)**: PHP estructurado bajo el micro framework Slim 4 (`slim/slim`) y su implementación estricta de PSR-7 (`slim/psr7`) para el manejo estandarizado de peticiones y respuestas HTTP.
- **Base de Datos**: MySQL relacional para la persistencia transaccional de usuarios, mercado, portfolios y operaciones.
- **Infraestructura**: Docker y Docker Compose para la orquestación y contenerización del servidor y la base de datos.

## ✨ Características Principales

- **Bono de Bienvenida**: Acreditación automática de un capital inicial de 1000 USD de saldo virtual para cada nuevo registro.
- **Mercado Dinámico**: Pizarra de cotizaciones en tiempo real con 7 activos (Oro, Plata, YPF, Petróleo, Bitcoin, Apple y Soja) cuyos precios fluctúan simulando la volatilidad real. El frontend renderiza indicadores de tendencia (Alta, Baja o Igual) de forma automática.
- **Gestión de Portfolio (Trading)**:
  - Motor de operaciones de compra y venta con validación estricta de fondos y tenencias.
  - Monitorización del valor total del portfolio e historial gráfico de cotizaciones en el Panel de Trading.
- **Historial de Operaciones**: Trazabilidad completa de las transacciones (compras/ventas) filtrable por activo y tipo de operación.
- **Panel de Administración**: Acceso privilegiado (Role-Based Access Control) para monitorear el ranking de inversores, gestionar perfiles y forzar la actualización del mercado.

## 🧠 Arquitectura y Decisiones de Diseño

El sistema fue diseñado aplicando principios SOLID y Clean Architecture, priorizando la escalabilidad y la estricta separación de responsabilidades a través del patrón MVC.

### Backend (PHP/Slim)

- **Autenticación Stateless (JWT)**: Todo el esquema transaccional está protegido por un middleware de autenticación (`AuthMiddleware`). Utiliza un sistema de tokens de acceso de corta duración que garantizan la ausencia de estado requerida por la arquitectura REST, implementando una estrategia de _Sliding Expiration_ (extensión automática del token ante interacciones legítimas).
- **Integridad Transaccional**: Uso de transacciones PDO en operaciones críticas de trading para garantizar la consistencia entre balances, portfolios y el registro de transacciones. El esquema relacional utiliza restricciones estrictas (claves foráneas con borrado en cascada y triggers `ON UPDATE`).
- **Precisión Financiera y Validación**: Uso de `DECIMAL(16,8)` en la base de datos para manejar fracciones de activos sin pérdida de precisión. Los modelos (ej. `User`) encapsulan las validaciones de entrada antes de procesar cualquier dato.
- **Optimización de Recursos**: Implementación del Patrón Singleton en `DB.php` para asegurar una única instancia de conexión PDO.
- **Manejo de Errores Centralizado**: Clases que heredan de `Exception` para una captura consistente y estructurada, devolviendo los códigos de estado HTTP apropiados.
- **Algoritmo de Volatilidad Estocástica**: La fluctuación de precios se abstrajo en una función dedicada que calcula la delta de precios basada en la volatilidad por segundo y el tiempo transcurrido, separando el modelo económico de los controladores HTTP.

### Frontend (React)

- **Gestión de Estado Desacoplada**: Implementación del patrón Provider (Context API) a través de `AuthProvider`, `AssetProvider`, `PortfolioProvider` y `UserProvider`. Centraliza la lógica de negocio y peticiones asíncronas, manteniendo los componentes visuales enfocados en la renderización.
- **Axios Interceptors**: Instancia global que intercepta peticiones salientes para inyectar automáticamente el token JWT (`Authorization: Bearer`), unificando la lógica de seguridad.
- **Sincronización No Bloqueante**: La cotización del mercado se actualiza automáticamente de fondo cada 3 minutos (`REFRESH_RATE_MS = 180000`), refrescando el DOM de forma reactiva sin recargar la página.

---

## 🛠️ Instalación y Entorno de Desarrollo Local

El proyecto utiliza contenedores Docker para aislar el entorno del backend y Vite para el servidor de desarrollo del frontend. Para proteger las credenciales, el repositorio implementa plantillas `.env.dist` que deben ser copiadas localmente.

### Requisitos Previos

- **Docker** y **Docker Compose** instalados.

## 🚀 Cómo levantar el proyecto localmente

El proyecto está completamente dockerizado para facilitar su despliegue y evaluación. No es necesario instalar PHP, Node.js ni MySQL en el entorno local.

### Requisitos Previos

- **Docker** y **Docker Compose** instalados en el sistema.

### Pasos de Ejecución

**1. Configurar las variables de entorno**
El proyecto requiere tres archivos de configuración. Posicionado en la raíz, ejecuta los siguientes comandos para generar las versiones locales a partir de las plantillas:

```bash
# Entorno de infraestructura (Docker)
cp .env.dist .env

# Entorno de la API REST (Backend)
cp wally-street-api/slim/.env.dist wally-street-api/slim/.env

# Entorno del Frontend (React)
cp wallystreet-front/.env.dist wallystreet-front/.env
```

**2. Crear el volumen persistente de la base de datos**
El sistema requiere la creación de un volumen externo para garantizar la persistencia de los datos del mercado y los usuarios:

```bash
docker volume create seminariophp
```

**3. Iniciar la infraestructura**
Ejecuta el siguiente comando en la raíz del proyecto para construir las imágenes y levantar el stack completo (Frontend, API, Base de Datos y phpMyAdmin):

```Bash
docker compose up -d 
```

Para detener la aplicación y apagar los contenedores, ejecuta `docker-compose down` desde la misma ubicación.
Para eliminar 

🌐 Acceso a los Servicios
Una vez que los contenedores reporten estar en ejecución, los servicios estarán disponibles en los siguientes puertos locales:

Simulador Wally Street (Frontend UI): http://localhost:5173

API REST (Backend): http://localhost:8000

Administrador de Base de Datos (phpMyAdmin): http://localhost:8080

## 👨‍💻 Autor

Desarrollado por Brian Alejandro Biscaro.
