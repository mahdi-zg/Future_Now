package com.mhz.futureNow.repository;

import com.mhz.futureNow.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId); // ✅ Récupérer tous les projets d'un utilisateur
    void deleteById(Long id);


}
