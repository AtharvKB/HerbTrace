package com.ayurveda.supplychain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@Service
public class PinataService {

    @Value("${pinata.jwt}")
    private String pinataJwt;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadToPinata(MultipartFile file) throws Exception {
        String url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

        // trim() removes any accidental whitespace from the JWT
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pinataJwt.trim());
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        return (String) response.getBody().get("IpfsHash");
    }

    public String uploadMetadata(Map<String, Object> metadata) {
        String url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pinataJwt.trim());
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Pinata requires content wrapped inside "pinataContent" key
        Map<String, Object> pinataBody = new HashMap<>();
        pinataBody.put("pinataContent", metadata);
        pinataBody.put("pinataMetadata", Map.of("name", metadata.getOrDefault("name", "herb-metadata").toString()));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(pinataBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        return (String) response.getBody().get("IpfsHash");
    }
}