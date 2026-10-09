package com.chn.backend.repositories;

import com.chn.backend.models.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    // Requerimiento: Ver la lista de solicitudes para cada cliente
    List<Solicitud> findByClienteId(Long clienteId);
}
