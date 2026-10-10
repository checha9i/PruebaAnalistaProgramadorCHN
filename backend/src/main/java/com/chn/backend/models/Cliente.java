package com.chn.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "clientes")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Regla: El número de identificación debe ser único a nivel de persistencia
    @NotBlank(message = "El número de identificación es obligatorio")
    @Column(name = "cui_identificacion", nullable = false, unique = true, length = 20)
    private String cuiIdentificacion;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 50)
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 50)
    private String apellido;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false, length = 150)
    private String direccion;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe proporcionar un formato de correo válido")
    @Column(name = "correo_electronico", nullable = false, length = 100)
    private String correoElectronico;

    @NotBlank(message = "El teléfono es obligatorio")
    @Column(nullable = false, length = 15)
    private String telefono;

   
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @com.fasterxml.jackson.annotation.JsonIgnore 
    private List<Solicitud> solicitudes;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @com.fasterxml.jackson.annotation.JsonIgnore 
    private List<Tarjeta> tarjetas;

    // Constructores
    public Cliente() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCuiIdentificacion() { return cuiIdentificacion; }
    public void setCuiIdentificacion(String cuiIdentificacion) { this.cuiIdentificacion = cuiIdentificacion; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

   
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public List<Solicitud> getSolicitudes() { return solicitudes; }
    public void setSolicitudes(List<Solicitud> solicitudes) { this.solicitudes = solicitudes; }

    public List<Tarjeta> getTarjetas() { return tarjetas; }
    public void setTarjetas(List<Tarjeta> tarjetas) { this.tarjetas = tarjetas; }
}
