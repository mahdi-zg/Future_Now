package com.mhz.futureNow.controller;

import com.mhz.futureNow.entity.SystemApiKey;
import com.mhz.futureNow.services.SystemApiKeyService;
import com.mhz.futureNow.services.SystemApiKeyServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system-api-keys")
public class SystemApiKeyController {

    private final SystemApiKeyServiceImpl systemApiKeyService;

    @GetMapping("/{id}")
    public ResponseEntity<SystemApiKey> getSystemApiKey(@PathVariable Long id) {
        return systemApiKeyService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/save")
    public ResponseEntity<SystemApiKey> createOrUpdate(@RequestBody SystemApiKey systemApiKey) {
        return ResponseEntity.ok(systemApiKeyService.createOrUpdate(systemApiKey));
    }
}