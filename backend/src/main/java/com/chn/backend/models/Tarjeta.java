package com.chn.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tarjetas")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Regla: El número de tarjeta debe ser único
    @Column(name = "numero_tarjeta", nullable = false, unique = true, length = 16)
    private String numeroTarjeta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;


    @Column(name = "tipo_tarjeta", nullable = false, length = 20)
    private String tipoTarjeta;

    @Column(name = "limite_credito", nullable = false, precision = 12, scale = 2)
    private BigDecimal limiteCredito;

    // Regla: El saldo actual tendrá un valor inicial de 0
    @Column(name = "saldo_actual", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoActual = BigDecimal.ZERO;

    // Constructores, Getters y Setters
    public Tarjeta() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroTarjeta() { return numeroTarjeta; }
    public void setNumeroTarjeta(String numeroTarjeta) { this.numeroTarjeta = numeroTarjeta; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getTipoTarjeta() { return tipoTarjeta; }
    public void setTipoTarjeta(String tipoTarjeta) { this.tipoTarjeta = tipoTarjeta; }
    public BigDecimal getLimiteCredito() { return limiteCredito; }
    public void setLimiteCredito(BigDecimal limiteCredito) { this.limiteCredito = limiteCredito; }
    public BigDecimal getSaldoActual() { return saldoActual; }
    public void setSaldoActual(BigDecimal saldoActual) { this.saldoActual = saldoActual; }
}
