package com.ayurveda.supplychain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@Service
public class PinataService {

    @Value("${pinata.jwt}")
    private String pinataJwt;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadToPinata(MultipartFile file) throws Exception {
        String url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

        // 1. Prepare Headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pinataJwt);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 2. Prepare Body (The Image)
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", resource);

        // 3. Send Request
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        // 4. Extract CID
        return (String) response.getBody().get("IpfsHash");
    }

    public String uploadMetadata(Map<String, Object> metadata) {
        String url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pinataJwt);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(metadata, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        return (String) response.getBody().get("IpfsHash");
    }
}