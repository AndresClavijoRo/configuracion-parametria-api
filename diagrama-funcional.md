# Diagrama de Flujo Funcional - Sistema CRUD Configurable

## Flujo Completo del Sistema (Vista Funcional)

```mermaid
flowchart TD
    %% Actores
    UsuarioTecnico[🔧 Usuario Técnico<br/>Configura el Sistema]
    UsuarioFuncional[👤 Usuario Funcional<br/>Usa el Sistema]
    
    %% Fase 1: Configuración (Usuario Técnico)
    subgraph "📋 FASE 1: CONFIGURACIÓN TÉCNICA"
        A1[🏢 1. Crear Módulo<br/>📝 Definir fuente de datos<br/>🔗 Oracle, MongoDB, etc.]
        A2[📊 2. Crear Entidad<br/>📝 Definir tabla/colección<br/>📋 Ej: Tabla USUARIOS]
        A3[🏷️ 3. Definir Campos<br/>📝 Columnas de la tabla<br/>🔧 ID, Nombre, Email, etc.]
        A4[⚙️ 4. Configurar Operaciones<br/>📝 Qué se puede hacer<br/>✅ Crear, Leer, Actualizar, Eliminar]
    end
    
    %% Fase 2: Uso (Usuario Funcional)
    subgraph "🚀 FASE 2: USO FUNCIONAL"
        B1[🎯 5. Solicitar Operación<br/>📝 Quiero consultar usuarios<br/>🔍 Con filtros específicos]
        B2[🔄 6. Sistema Procesa<br/>📝 Busca la configuración<br/>🔍 Valida permisos]
    end
    
    %% Fase 3: Ejecución (Automática)
    subgraph "💾 FASE 3: EJECUCIÓN AUTOMÁTICA"
        C1[🔌 7. Conecta a BD<br/>📝 Según configuración<br/>🏢 Oracle, MongoDB, etc.]
        C2[⚡ 8. Ejecuta Operación<br/>📝 SELECT, INSERT, UPDATE<br/>📊 Según lo solicitado]
        C3[📤 9. Devuelve Resultados<br/>📝 Lista de usuarios<br/>✅ Datos encontrados]
    end
    
    %% Flujo principal
    UsuarioTecnico --> A1
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 -.->|Sistema Configurado| B1
    UsuarioFuncional --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> UsuarioFuncional
    
    %% Estilos
    classDef configPhase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef usePhase fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef execPhase fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef userTech fill:#fff3e0,stroke:#e65100,stroke-width:3px
    classDef userFunc fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    
    class A1,A2,A3,A4 configPhase
    class B1,B2 usePhase
    class C1,C2,C3 execPhase
    class UsuarioTecnico userTech
    class UsuarioFuncional userFunc
```

## Ejemplo Práctico: "Consultar Lista de Empleados"

```mermaid
flowchart TD
    subgraph "🔧 USUARIO TÉCNICO - Configuración Inicial (Una sola vez)"
        direction TB
        Config1[🏢 1. Crear Módulo 'RRHH'<br/>Base de datos: Oracle]
        Config2[📊 2. Crear Entidad 'Empleados'<br/>Tabla: EMPLEADOS]
        Config3[🏷️ 3. Definir Campos:<br/>• ID (número, clave)<br/>• Nombre (texto)<br/>• Cargo (texto)<br/>• Salario (número)]
        Config4[⚙️ 4. Operaciones permitidas:<br/>✅ Consultar<br/>✅ Crear<br/>❌ Eliminar]
        
        Config1 --> Config2 --> Config3 --> Config4
    end
    
    subgraph "👤 USUARIO FUNCIONAL - Uso Diario"
        direction TB
        Uso1[🔍 5. 'Quiero ver empleados<br/>del área de Ventas']
        Uso2[📊 6. Sistema obtiene lista<br/>filtrada por área]
        Result1[📋 7. Lista de empleados:<br/>• Juan Pérez - Vendedor<br/>• María García - Gerente<br/>• Carlos López - Vendedor]
        
        Uso1 --> Uso2 --> Result1
    end
    
    Config4 -.->|Sistema Configurado<br/>Listo para Usar| Uso1
    
    classDef config fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef uso fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class Config1,Config2,Config3,Config4 config
    class Uso1,Uso2,Result1 uso
```

## Beneficios del Sistema por Usuario

```mermaid
mindmap
  root((🎯 Sistema CRUD<br/>Configurable))
    🔧 **Usuario Técnico**
      ⚙️ Configuración sin código
      🔌 Múltiples BD soportadas
      📦 Componente reutilizable
      🚀 Desarrollo 10x más rápido
    
    👤 **Usuario Funcional**
      ✅ Sin dependencia de TI
      🎯 Consultas inmediatas
      📊 Filtros personalizados
      📋 Datos siempre actualizados
    
    💼 **Para la Empresa**
      💰 Menor costo desarrollo
      ⚡ Time-to-market rápido
      🛡️ Mayor seguridad
      🔄 Procesos estandarizados
```

## Roles y Responsabilidades

```mermaid
flowchart TB
    subgraph "👥 ROLES EN EL SISTEMA"
        UsuarioTecnico[🔧 Usuario Técnico<br/>• Conoce bases de datos<br/>• Configura módulos y entidades<br/>• Define campos y operaciones<br/>• Mapea tablas a funcionalidad]
        
        UsuarioFuncional[👤 Usuario Funcional<br/>• Conoce el negocio<br/>• Consulta información<br/>• Crea y actualiza registros<br/>• Toma decisiones con datos]
        
        AdminSistema[⚙️ Administrador de Sistema<br/>• Configura conexiones BD<br/>• Despliega aplicaciones<br/>• Monitorea rendimiento<br/>• Gestiona accesos]
    end
    
    AdminSistema -.->|Habilita<br/>Infraestructura| UsuarioTecnico
    UsuarioTecnico -.->|Entrega Sistema<br/>Configurado| UsuarioFuncional
    
    classDef admin fill:#ffebee,stroke:#d32f2f
    classDef tecnico fill:#fff3e0,stroke:#e65100
    classDef funcional fill:#e8f5e8,stroke:#2e7d32
    
    class AdminSistema admin
    class UsuarioTecnico tecnico
    class UsuarioFuncional funcional
```

---

## Resumen Ejecutivo

**¿Qué hace el sistema?**
Permite a los **usuarios técnicos** configurar operaciones de base de datos sin programar, para que los **usuarios funcionales** puedan consultar y gestionar datos inmediatamente.

**¿Cómo funciona?**

1. **🔧 Usuario Técnico configura una vez** qué tablas, campos y operaciones están disponibles
2. **🚀 Sistema genera automáticamente** las interfaces y funcionalidades
3. **👤 Usuario Funcional usa diariamente** para consultar, crear y actualizar datos

**¿Qué beneficios tiene?**

- ⚡ **Desarrollo 10x más rápido** que programación tradicional
- 🎯 **Autonomía funcional** - No depender de TI para consultas básicas
- 🔄 **Reutilizable** para múltiples proyectos y equipos
- 🛡️ **Más seguro** porque usa componentes probados y estandarizados
- 💰 **Menor costo** de desarrollo y mantenimiento a largo plazo

**División clara de responsabilidades:**

- **Usuario Técnico**: "Cómo se conecta y qué se puede hacer"
- **Usuario Funcional**: "Qué datos necesito y cuándo los necesito"
