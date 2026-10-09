# PruebaAnalistaProgramadorCHN
Prueba técnica para el puesto de analista programador


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
