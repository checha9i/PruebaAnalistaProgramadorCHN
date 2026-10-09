package com.chn.backend.repositories;

import com.chn.backend.models.Tarjeta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TarjetaRepository extends JpaRepository<Tarjeta, Long> {
    // Requerimiento: Consultar la lista de tarjetas emitidas para cada cliente
    List<Tarjeta> findByClienteId(Long clienteId);
    boolean existsByNumeroTarjeta(String numeroTarjeta);
}
