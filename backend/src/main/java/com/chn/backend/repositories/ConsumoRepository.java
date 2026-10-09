package com.chn.backend.repositories;

import com.chn.backend.models.Consumo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsumoRepository extends JpaRepository<Consumo, Long> {
    List<Consumo> findByTarjetaId(Long tarjetaId);
}
