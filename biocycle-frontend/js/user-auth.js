import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.getElementById('btnLogin').addEventListener('click', async () => {
    // 1. Ambil teks yang diketik user
    const userCode = document.getElementById('inputUserCode').value.trim();
    const passwordKetikan = document.getElementById('inputPassword').value.trim(); // <--- TAMBAHAN REVISI

    // 2. Cek jika ada yang kosong
    if (!userCode || !passwordKetikan) {
        alert("Kode User dan Password tidak boleh kosong ya!");
        return;
    }

    // Ubah tulisan tombol agar terlihat sedang memproses
    document.getElementById('btnLogin').innerText = "Mengecek...";

    // 3. Mencari kode tersebut di dalam folder "users" di Firebase
    const userRef = ref(db, 'users/' + userCode);
    
    try {
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const dataUser = snapshot.val(); // Ambil semua isi kamar user tersebut

            // ---> 4. INI LOGIKA PENGECEKAN PASSWORDNYA <---
            if (dataUser.password === passwordKetikan) {
                // Jika password BENAR, simpan kodenya di memori browser
                localStorage.setItem("sessionUserCode", userCode);
                
                // Simpan juga aturan (sensor mana yang boleh dilihat)
                if (dataUser.show) {
                    localStorage.setItem("userConfigShow", JSON.stringify(dataUser.show));
                }
                
                // Pindah ke halaman dashboard
                window.location.href = "dashboard.html";
            } else {
                // Jika password SALAH
                alert("❌ Password Salah! Silakan coba lagi.");
                document.getElementById('btnLogin').innerText = "Masuk Dashboard"; // Kembalikan teks tombol
            }

        } else {
            // Jika Kode User tidak ada di database
            alert("❌ Kode User tidak ditemukan! Cek lagi ya.");
            document.getElementById('btnLogin').innerText = "Masuk Dashboard";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal terhubung ke internet atau database.");
        document.getElementById('btnLogin').innerText = "Masuk Dashboard";
    }
});