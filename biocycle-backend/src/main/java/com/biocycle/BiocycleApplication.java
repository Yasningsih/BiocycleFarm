package com.biocycle;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BiocycleApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiocycleApplication.class, args);
        System.out.println("=== SERVER BIOCYCLE FARM MENYALA ===");
    }
}