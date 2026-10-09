package com.chn.backend.repositories;

import com.chn.backend.models.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByTarjetaId(Long tarjetaId);
}
