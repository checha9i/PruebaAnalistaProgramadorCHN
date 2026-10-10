package com.chn.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "solicitudes")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente; 

    @NotNull(message = "El tipo de tarjeta es obligatorio")
    @Column(name = "tipo_tarjeta", nullable = false, length = 20)
    private String tipoTarjeta;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @NotNull(message = "El ingreso mensual es obligatorio")
    @Min(value = 0, message = "El ingreso mensual no puede ser negativo")
    @Column(name = "ingreso_mensual", nullable = false, precision = 12, scale = 2)
    private BigDecimal ingresoMensual;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_decision")
    private LocalDate fechaDecision;

    @Column(name = "motivo_comentario", length = 250)
    private String motivoComentario;

    @Column(name = "monto_aprobado", precision = 12, scale = 2)
    private BigDecimal montoAprobado;

    // CONSOLIDACIÓN: Un único método PrePersist para inicializar el registro de forma atómica
    @PrePersist
    protected void onCreate() {
        if (this.fechaSolicitud == null) {
            this.fechaSolicitud = LocalDate.now();
        }
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }

    // Constructor
    public Solicitud() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public String getTipoTarjeta() { return tipoTarjeta; }
    public void setTipoTarjeta(String tipoTarjeta) { this.tipoTarjeta = tipoTarjeta; }

    public LocalDate getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDate fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public BigDecimal getIngresoMensual() { return ingresoMensual; }
    public void setIngresoMensual(BigDecimal ingresoMensual) { this.ingresoMensual = ingresoMensual; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFechaDecision() { return fechaDecision; }
    public void setFechaDecision(LocalDate fechaDecision) { this.fechaDecision = fechaDecision; }

    public String getMotivoComentario() { return motivoComentario; }
    public void setMotivoComentario(String motivoComentario) { this.motivoComentario = motivoComentario; }

    public BigDecimal getMontoAprobado() { return montoAprobado; }
    public void setMontoAprobado(BigDecimal montoAprobado) { this.montoAprobado = montoAprobado; }
}
