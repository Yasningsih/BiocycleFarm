package com.biocycle.controller;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// Mengizinkan Frontend (biasanya port 5500 dari Live Server) untuk mengobrol dengan Backend (port 8080)
@CrossOrigin(origins = "*") 
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // REVISI DOSEN: Menambahkan {password} pada URL endpoint
    // Endpoint menjadi: http://localhost:8080/api/admin/create-user/{kodePetani}/{password}
    @PostMapping("/create-user/{userCode}/{password}")
    public String createUser(@PathVariable String userCode, @PathVariable String password) {
        try {
            FirebaseDatabase database = FirebaseDatabase.getInstance();
            
            // 1. Buat Setting Default Range & Tampilan
            Map<String, Object> userData = new HashMap<>();
            
            // ---> INI DIA TAMBAHAN REVISINYA: Menyimpan password ke Firebase <---
            userData.put("password", password); 
            
            userData.put("feedInterval", 12);
            
            Map<String, Object> range = new HashMap<>();
            range.put("temp_min", 25); range.put("temp_max", 32);
            range.put("ph_min", 6); range.put("ph_max", 8);
            range.put("tds_max", 800);
            userData.put("range", range);

            Map<String, Boolean> show = new HashMap<>();
            show.put("temp", true); show.put("ph", true);
            show.put("tds", true); show.put("jarak", true);
            userData.put("show", show);

            // 2. Buat Kontrol Default
            Map<String, Object> controlData = new HashMap<>();
            controlData.put("pump", "AUTO");
            controlData.put("feed", false);

            // 3. Tulis semua ke Firebase secara Asynchronous (Background)
            database.getReference("users/" + userCode).setValueAsync(userData);
            database.getReference("control/" + userCode).setValueAsync(controlData);

            // Menampilkan pesan sukses beserta passwordnya
            return "Berhasil membuat data untuk: " + userCode + " | Password: " + password;

        } catch (Exception e) {
            e.printStackTrace();
            return "Gagal membuat user: " + e.getMessage();
        }
    }
}