package com.chn.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarjeta_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Tarjeta tarjeta;

    @NotNull(message = "El monto del pago es obligatorio")
    @Min(value = 0, message = "El monto no puede ser negativo")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(nullable = false, length = 150)
    private String descripcion;

    @PrePersist
    protected void onCreate() {
        this.fechaPago = LocalDateTime.now();
    }

    // Constructor
    public Pago() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tarjeta getTarjeta() { return tarjeta; }
    public void setTarjeta(Tarjeta tarjeta) { this.tarjeta = tarjeta; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
