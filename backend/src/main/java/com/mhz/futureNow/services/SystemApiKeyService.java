package com.mhz.futureNow.services;

import com.mhz.futureNow.entity.SystemApiKey;
import com.mhz.futureNow.repository.SystemApiKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemApiKeyService implements  SystemApiKeyServiceImpl{

    private final SystemApiKeyRepository systemApiKeyRepository;

    @Override
    public SystemApiKey createOrUpdate(SystemApiKey systemApiKey) {
        systemApiKey.setLastUpdated(LocalDateTime.now());
        return systemApiKeyRepository.save(systemApiKey);
    }

    @Override
    public Optional<SystemApiKey> getById(Long id) {
        return systemApiKeyRepository.findById(id);
    }
}