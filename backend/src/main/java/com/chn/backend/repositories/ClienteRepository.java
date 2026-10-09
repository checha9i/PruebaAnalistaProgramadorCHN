package com.chn.backend.repositories;

import com.chn.backend.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Requerimiento: El número de identificación debe ser único. 
    // Esto te servirá para validar antes de guardar.
    boolean existsByCuiIdentificacion(String cuiIdentificacion);
}
