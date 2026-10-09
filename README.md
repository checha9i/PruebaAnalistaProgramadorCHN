# PruebaAnalistaProgramadorCHN
Prueba técnica para el puesto de analista programador


## 🛠️ Tecnologías Utilizadas
- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Web, Validation.
- **Frontend:** React (Vite), JavaScript, CSS/Componentes.
- **Base de Datos:** Microsoft SQL Server (Transact-SQL).
- **Contenedores y DevOps:** Docker, Docker Compose.

## 🚀 Instrucciones de Ejecución Local

### Prerrequisitos
- Tener instalado **Docker Desktop** y que el motor esté en ejecución.
- Tener instalado **Git** para la clonación del repositorio.

### Pasos para Desplegar el Sistema
1. Clonar este repositorio en su máquina local:
   ```bash
   git clone https://github.com
   ```
2. Navegar a la carpeta raíz del proyecto:
   ```bash
   cd PruebaAnalistaProgramadorCHN
   ```
3. Construir las imágenes y levantar todo el ecosistema (Base de Datos, API REST y Frontend) con un solo comando:
   ```bash
   docker-compose up --build
   ```
4. Una vez que la terminal indique que los servicios están listos, puede acceder a las siguientes URLs:
   - **Frontend (Interfaz Gráfica):** `http://localhost:5173`
   - **Backend (API REST Documentación):** `http://localhost:8080/api/clientes`
   - **Base de Datos (SQL Server):** Accesible localmente en el puerto `1433` con el usuario `sa`.





## Entidad Relacion

```mermaid
erDiagram
    CLIENTES ||--o{ SOLICITUDES : "posee (ON DELETE CASCADE)"
    CLIENTES ||--o{ TARJETAS : "propietario (ON DELETE CASCADE)"
    TARJETAS ||--o{ CONSUMOS : "registra (ON DELETE CASCADE)"
    TARJETAS ||--o{ PAGOS : "recibe (ON DELETE CASCADE)"

    CLIENTES {
        bigint id PK
        varchar cui_identificacion UK
        varchar nombre
        varchar apellido
        date fecha_nacimiento
        varchar direccion
        varchar correo_electronico
        varchar telefono
    }

    SOLICITUDES {
        bigint id PK
        bigint cliente_id FK
        varchar tipo_tarjeta
        date fecha_solicitud
        decimal ingreso_mensual
        varchar estado
        date fecha_decision
        varchar motivo_comentario
        decimal monto_aprobado
    }

    TARJETAS {
        bigint id PK
        varchar numero_tarjeta UK
        bigint cliente_id FK
        varchar tipo_tarjeta
        decimal limite_credito
        decimal saldo_actual
    }

    CONSUMOS {
        bigint id PK
        bigint tarjeta_id FK
        decimal monto
        datetime fecha_consumo
        varchar descripcion
    }

    PAGOS {
        bigint id PK
        bigint tarjeta_id FK
        decimal monto
        datetime fecha_pago
        varchar descripcion
    }

