package com.ayurveda.supplychain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") 
public class BatchController {

    @Autowired
    private PinataService pinataService;

    @PostMapping("/add-batch")
    public ResponseEntity<?> addBatch(
            @RequestParam("image") MultipartFile image,
            @RequestParam("name") String name,
            @RequestParam("location") String location,
            @RequestParam("farmerName") String farmerName
    ) {
        try {
            System.out.println("📥 Java received request for: " + name);

            // --- FIX 1: Upload Image & VERIFY it didn't fail ---
            String imageCid = pinataService.uploadToPinata(image);
            
            if (imageCid == null || imageCid.isEmpty()) {
                System.out.println("❌ Image Upload Failed!");
                return ResponseEntity.status(500).body("Error: Image upload failed to return a CID.");
            }
            System.out.println("✅ Image Uploaded: " + imageCid);

            // --- FIX 2: Create Metadata (Remove 'ipfs://' to be 100% clean) ---
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("name", name);
            metadata.put("description", "Harvested at " + location + " by " + farmerName);
            
            // Member 2 asked for ONLY the CID. Your old code had "ipfs://" + imageCid.
            // We removed "ipfs://" here so it is just the raw hash.
            metadata.put("image", imageCid); 

            // 3. Upload Metadata
            String metadataCid = pinataService.uploadMetadata(metadata);
            
             // Double check Metadata upload too
            if (metadataCid == null || metadataCid.isEmpty()) {
                 return ResponseEntity.status(500).body("Error: Metadata upload failed.");
            }
            System.out.println("✅ Metadata Uploaded: " + metadataCid);

            // 4. Respond to Frontend
            Map<String, String> response = new HashMap<>();
            response.put("cid", metadataCid); // This sends the Master CID to frontend
            response.put("message", "Success from Java Backend");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
} 