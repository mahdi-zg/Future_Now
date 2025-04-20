package com.mhz.futureNow.services;

import com.mhz.futureNow.entity.SystemApiKey;

import java.util.Optional;

public interface SystemApiKeyServiceImpl {
    SystemApiKey createOrUpdate(SystemApiKey systemApiKey);

    Optional<SystemApiKey> getById(Long id);
}
