-- Tabla de Clientes
CREATE TABLE clientes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    cui_identificacion VARCHAR(20) NOT NULL CONSTRAINT UQ_Clientes_CUI UNIQUE, -- Restricción de CUI Único
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    telefono VARCHAR(15) NOT NULL
);

-- Tabla de Solicitudes
CREATE TABLE solicitudes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    tipo_tarjeta VARCHAR(20) NOT NULL CONSTRAINT CK_Solicitudes_Tipo CHECK (tipo_tarjeta IN ('CLASICA', 'ORO', 'PLATINO')),
    fecha_solicitud DATE NOT NULL,
    ingreso_mensual DECIMAL(12,2) NOT NULL CONSTRAINT CK_Solicitudes_Ingreso CHECK (ingreso_mensual >= 0),
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Solicitudes_Estado DEFAULT 'PENDIENTE' 
        CONSTRAINT CK_Solicitudes_Estado CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    fecha_decision DATE NULL,
    motivo_comentario VARCHAR(250) NULL,
    monto_aprobado DECIMAL(12,2) NULL CONSTRAINT CK_Solicitudes_Monto CHECK (monto_aprobado >= 0),
    CONSTRAINT FK_solicitudes_clientes FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE CASCADE -- Eliminación automática en cascada requerida
);

-- Tabla de Tarjetas de Crédito
CREATE TABLE tarjetas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    numero_tarjeta VARCHAR(16) NOT NULL CONSTRAINT UQ_Tarjetas_Numero UNIQUE, -- Restricción de Número Único
    cliente_id BIGINT NOT NULL,
    tipo_tarjeta VARCHAR(20) NOT NULL CONSTRAINT CK_Tarjetas_Tipo CHECK (tipo_tarjeta IN ('CLASICA', 'ORO', 'PLATINO')),
    limite_credito DECIMAL(12,2) NOT NULL CONSTRAINT CK_Tarjetas_Limite CHECK (limite_credito >= 0),
    saldo_actual DECIMAL(12,2) NOT NULL CONSTRAINT DF_Tarjetas_Saldo DEFAULT 0.00, -- Valor inicial de 0
    CONSTRAINT FK_tarjetas_clientes FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE CASCADE -- Eliminación en cascada automática
);

-- Tabla de Consumos
CREATE TABLE consumos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tarjeta_id BIGINT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CONSTRAINT CK_Consumos_Monto CHECK (monto > 0),
    fecha_consumo DATETIME NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    CONSTRAINT FK_consumos_tarjetas FOREIGN KEY (tarjeta_id) 
        REFERENCES tarjetas(id) ON DELETE CASCADE
);

-- Tabla de Pagos
CREATE TABLE pagos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tarjeta_id BIGINT NOT NULL,
    monto DECIMAL(12,2) NOT NULL CONSTRAINT CK_Pagos_Monto CHECK (monto > 0),
    fecha_pago DATETIME NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    CONSTRAINT FK_pagos_tarjetas FOREIGN KEY (tarjeta_id) 
        REFERENCES tarjetas(id) ON DELETE CASCADE
);

-- Crear Índices de Rendimiento Backend
CREATE INDEX IX_Solicitudes_Cliente ON solicitudes(cliente_id);
CREATE INDEX IX_Tarjetas_Cliente ON tarjetas(cliente_id);
CREATE INDEX IX_Consumos_Tarjeta ON consumos(tarjeta_id);
CREATE INDEX IX_Pagos_Tarjeta ON pagos(tarjeta_id);
