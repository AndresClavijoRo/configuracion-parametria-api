# API de Configuración Paramétrica

<div>
    <img src="https://www.porvenir.com.co/o/Zona-Publica-Theme/images/ZonaPublica/logo_porvenir.svg" width="250px" alt="Logo Porvenir"/>
</div>

**Autor:** Equipo de Desarrollo Porvenir

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-blue)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![NPM](https://img.shields.io/badge/NPM-11.x-blue)](https://www.npmjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.7.1-green.svg)](https://www.mongodb.com/)

## **Introducción**

La API de Configuración Paramétrica es el componente central del Sistema CRUD Configurable que permite gestionar la configuración de entidades, campos, operaciones y relaciones. Esta API facilita la definición de módulos que representan diferentes fuentes de datos y sus respectivas entidades con sus atributos, permitiendo la ejecución dinámica de operaciones CRUD.

### **Información del Servicio**

- **Nombre del servicio:** `pendig-ms-configuracion-parametria-nodejs`
- **Puerto por defecto:** 3100
- **Base de datos:** MongoDB

### **Descripción**

- **Funcionalidad Principal:** Gestión de configuraciones paramétricas para operaciones CRUD dinámicas
- **Conexión Base de datos:** MongoDB (almacena todas las configuraciones)

### **Especificaciones Técnicas**

#### **Tecnología a Utilizar**

- **Lenguaje de Programación:** Node.js 22.12.0 - TypeScript 5.7.3
- **Framework:** NestJS 11.0.1
- **Base de Datos:** MongoDB 8.7.1
- **Contenedores:** Docker
- **Orquestador de Contenedores:** Kubernetes (AKS - Azure Kubernetes Service)

## **Arquitectura del Sistema**

### **1. Diagrama de Arquitectura General**

```mermaid
flowchart TB
    subgraph "API de Configuración"
        config[Gestión de Configuraciones]
        entities[Entidades]
        fields[Campos]
        operations[Operaciones]
        relationships[Relaciones]
        db1[(Base de datos\nde configuración)]
        
        config --> entities
        config --> fields
        config --> operations
        config --> relationships
        
        entities --> db1
        fields --> db1
        operations --> db1
        relationships --> db1
    end
    
    subgraph "API CRUD (Plantilla)"
        crud[Controladores CRUD]
        dynamicOps[Operaciones Dinámicas]
        env[Variables de Entorno]
        dbAccess[Acceso a DB]
        dynamicEntities[Entidades Dinámicas]
        
        env --> dbAccess
        crud --> dynamicOps
        dynamicOps --> dbAccess
        dbAccess --> dynamicEntities
    end
    
    subgraph "Base de Datos del Cliente"
        clientDB[(Base de datos\nconfigurada por\nvariables de entorno)]
    end
    
    operations -- "Solicita operación" --> crud
    crud -- "Ejecuta operación" --> clientDB
    clientDB -- "Devuelve resultados" --> crud
    crud -- "Retorna resultados" --> operations
    
    Usuario((Usuario)) -- "Configura" --> config
    Usuario -- "Solicita datos" --> operations
```

### **2. Modelo de Datos - Configuración Paramétrica**

```mermaid
erDiagram
    modulo ||--o{ Entidad : "Contiene"
    Entidad ||--o{ AtributosTabla : "Define"

    modulo {
        UUID id PK "Identificador único"
        string nombre "Nombre descriptivo de la fuente de datos"
        string descripcion "Descripción detallada de la fuente de datos"
        enum tipoConexion "mysql|postgres|mongodb|sqlserver|oracle"
        string database "nombre de la base de datos del .env"
        string apiEndpoint "URL de la API CRUD implementada"
        boolean activo "Indica si la fuente de datos está activa o no"
        timestamp fechaCreacion "Fecha y hora de creación del registro"
        string usuarioCreacion "Usuario Creacion del registro"
        timestamp fechaActualizacion "Fecha y hora de última actualización"
        string usuarioActualizacion "Usuario actualización del registro"
    }

    Entidad {
        UUID id PK "Identificador único"
        UUID moduloId FK "Identificador del módulo que pertenece"
        string nombre "Nombre amigable de la entidad"
        string nombreTabla "Nombre real de la tabla en BD"
        string descripcion "Descripción detallada de la entidad"
        boolean activo "Indica si la entidad está activa o no"
        array operaciones "Lista de operaciones permitidas GET_ONE|GET_MANY|CREATE|UPDATE|DELETE|PATCH"
        timestamp fechaCreacion "Fecha y hora de creación del registro"
        string usuarioCreacion "Usuario Creacion del registro"
        timestamp fechaActualizacion "Fecha y hora de última actualización"
        string usuarioActualizacion "Usuario actualización del registro"
    }

    AtributosTabla {
        UUID id PK "Identificador único"
        UUID entidadId FK "Referencia a la entidad"
        string nombre "Nombre amigable del campo"
        string nombreColumna "Nombre real de la columna en BD"
        enum tipoDato "string|number|boolean|date"
        array opciones "Opciones para campo este es un arreglo de strings"
        boolean esPrimario "Indica si el campo es clave primaria"
        boolean esRequerido "Indica si el campo es obligatorio"
        boolean esBuscable "Indica si se puede buscar por este campo"
        boolean esVisible "Indica si el campo se muestra en listados"
        boolean esEditable "Indica si el campo puede ser editado"
        string secuencia "Indica si se debe usar una secuencia para el campo"
        timestamp fechaCreacion "Fecha y hora de creación del registro"
        string usuarioCreacion "Usuario Creacion del registro"
        timestamp fechaActualizacion "Fecha y hora de última actualización"
        string usuarioActualizacion "Usuario actualización del registro"
    }
```

### **3. Diagrama de Secuencia - Flujo de Configuración y Orquestación**

```mermaid
sequenceDiagram
    actor Usuario
    participant ConfigAPI as API Configuración
    participant MongoDB as MongoDB (Config)
    participant OrquestadorService as Servicio Orquestador
    participant TemplateAPI as API Template (HTTP)

    %% Configuración de módulo y entidades
    Note over Usuario, MongoDB: Fase 1: Configuración
    Usuario->>ConfigAPI: POST /modulo/crear
    ConfigAPI->>MongoDB: Crear módulo
    MongoDB-->>ConfigAPI: Módulo creado
    ConfigAPI-->>Usuario: Confirmación

    Usuario->>ConfigAPI: POST /entidad/crear?idModulo=xyz
    ConfigAPI->>MongoDB: Crear entidad en módulo
    MongoDB-->>ConfigAPI: Entidad creada
    ConfigAPI-->>Usuario: Confirmación

    Usuario->>ConfigAPI: POST /atributo-tabla/crear?idEntidad=abc
    ConfigAPI->>MongoDB: Crear atributos de tabla
    MongoDB-->>ConfigAPI: Atributos creados
    ConfigAPI-->>Usuario: Confirmación

    %% Ejecución de operación CRUD a través del orquestador
    Note over Usuario, TemplateAPI: Fase 2: Ejecución de Operación CRUD
    Usuario->>ConfigAPI: POST /orquestador/ejecutar
    ConfigAPI->>MongoDB: Obtener configuración completa
    MongoDB-->>ConfigAPI: Configuración de entidad y atributos

    ConfigAPI->>OrquestadorService: Procesar operación
    Note over OrquestadorService: Construir payload para Template API

    OrquestadorService->>TemplateAPI: POST /crud (HTTP Request)
    Note over TemplateAPI: Ejecutar operación dinámica en BD objetivo
    TemplateAPI-->>OrquestadorService: Respuesta con datos

    OrquestadorService-->>ConfigAPI: Resultado de operación
    ConfigAPI-->>Usuario: Datos finales

    %% Verificación de salud del template
    Note over Usuario, TemplateAPI: Verificación de Conectividad
    Usuario->>ConfigAPI: GET /orquestador/health?endPoint=url
    ConfigAPI->>OrquestadorService: Verificar conectividad
    OrquestadorService->>TemplateAPI: GET /health (HTTP Request)
    TemplateAPI-->>OrquestadorService: Estado del servicio
    OrquestadorService-->>ConfigAPI: Estado de conectividad
    ConfigAPI-->>Usuario: Resultado de verificación
```

## **Endpoints Principales**

### **Gestión de Módulos**

#### **Crear Módulo**

```http
POST /service/pendig/transversales/conf-parametria/api/v1/modulo/crear
```

**Body:**

```json
{
  "data": {
    "nombre": "Sistema de Usuarios",
    "descripcion": "Módulo para gestión de usuarios",
    "tipoConexion": "oracle",
    "database": "ORACLE_MAIN",
    "apiEndpoint": "http://localhost:3001/api/v1",
    "usuarioCreacion": "admin"
  }
}
```

#### **Listar Módulos**

```http
POST /service/pendig/transversales/conf-parametria/api/v1/modulo/listar
```

**Body:**

```json
{
  "filtros": {
    "nombre": "Sistema",
    "activo": "true"
  },
  "paginacion": {
    "pagina": 1,
    "size": 10
  },
  "sorting": {
    "fechaCreacion": "DESC"
  }
}
```

### **Gestión de Entidades**

#### **Crear Entidad**

```http
POST /service/pendig/transversales/conf-parametria/api/v1/entidad/crear?idModulo={id}
```

**Body:**

```json
{
  "data": {
    "nombre": "Usuario",
    "nombreTabla": "USUARIOS",
    "descripcion": "Tabla de usuarios del sistema",
    "operaciones": ["GET_ONE", "GET_MANY", "CREATE", "UPDATE", "DELETE"],
    "usuarioCreacion": "admin"
  }
}
```

### **Gestión de Atributos**

#### **Crear Atributo de Tabla**

```http
POST /service/pendig/transversales/conf-parametria/api/v1/atributo-tabla/crear?idEntidad={id}
```

**Body:**

```json
{
  "data": {
    "nombre": "ID Usuario",
    "nombreColumna": "ID_USUARIO",
    "tipoDato": "number",
    "esPrimario": true,
    "esRequerido": true,
    "esVisible": true,
    "esEditable": false,
    "secuencia": "SEQ_USUARIO",
    "usuarioCreacion": "admin"
  }
}
```

### **Orquestador de Operaciones**

#### **Ejecutar Operación CRUD**

```http
POST /service/pendig/transversales/conf-parametria/api/v1/orquestador/ejecutar
```

**Body:**

```json
{
  "type": "GET_MANY",
  "endpoint": "http://localhost:3001/api/v1",
  "entityDefinition": {
    "name": "usuarios",
    "tableName": "USUARIOS",
    "connectionId": "oracle_main",
    "fields": [
      {
        "name": "ID",
        "columnName": "ID_USUARIO",
        "type": "number",
        "isPrimary": true,
        "isVisible": true
      },
      {
        "name": "Nombre",
        "columnName": "NOMBRE",
        "type": "string",
        "isVisible": true,
        "isSearchable": true
      }
    ]
  },
  "filters": {
    "NOMBRE": "Juan"
  },
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

#### **Verificar Conectividad con Template**

```http
GET /service/pendig/transversales/conf-parametria/api/v1/orquestador/health?endPoint=http://localhost:3001/api/v1
```

### **Configuración Completa**

#### **Obtener Configuración de Entidad**

```http
GET /service/pendig/transversales/conf-parametria/api/v1/configuracion/obtener?idEntidad={id}
```

## **Enumeraciones del Sistema**

### **Tipos de Conexión**

- `mysql`
- `postgres`
- `mongodb`
- `sqlserver`
- `oracle`

### **Tipos de Datos**

- `string`
- `number`
- `boolean`
- `date`

### **Tipos de Operación**

- `GET_ONE`
- `GET_MANY`
- `CREATE`
- `UPDATE`
- `DELETE`
- `PATCH`
- `GET_COLUMNS`

## **Estructura de Archivos**

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── config.module.ts
│   ├── mongodb.config.ts
│   └── env.validation.ts
├── modules/
│   ├── modulo/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── dto/
│   ├── entidad/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── dto/
│   ├── atributos-tabla/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── dto/
│   ├── configuracion/
│   │   ├── controllers/
│   │   └── services/
│   ├── orquestador/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── dto/
│   └── enums/
├── common/
│   ├── dto/
│   ├── enums/
│   └── interceptors/
└── core/
    └── global-exception.filter.ts
```

## **Variables de Entorno**

```bash
# Configuración de la aplicación
PORT=3100
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/config-api

# API Template CRUD
API_CRUD_URL=http://localhost:3001/api/v1
```

## **Comandos Útiles**

### **Desarrollo**

```bash
npm run start:dev
```

### **Compilar**

```bash
npm run build
```

### **Producción**

```bash
npm run start:prod
```

### **Tests**

```bash
npm run test
npm run test:e2e
```

## **Instalación y Configuración**

1. **Clonar el repositorio**
2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar MongoDB**
5. **Iniciar la aplicación:**

   ```bash
   npm run start:dev
   ```

La aplicación estará disponible en:

- **API:** `http://localhost:3100/service/pendig/transversales/conf-parametria/api/v1/`
- **Swagger:** `http://localhost:3100/service/pendig/transversales/conf-parametria/api/v1/swagger-ui/index.html`

## **Características Principales**

✅ **Gestión de Módulos**: Define fuentes de datos y sus configuraciones  
✅ **Configuración de Entidades**: Mapea tablas y sus operaciones permitidas  
✅ **Gestión de Atributos**: Define campos, tipos de datos y validaciones  
✅ **Orquestador**: Comunica con APIs template para ejecutar operaciones  
✅ **Validaciones**: Validación automática de datos y configuraciones  
✅ **Paginación**: Soporte nativo para listados paginados  
✅ **Filtros**: Sistema de filtrado flexible  
✅ **Logging**: Trazabilidad completa de operaciones  
✅ **API RESTful**: Endpoints bien estructurados y documentados
