import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Fitur Show/Hide Password
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('adminPassword');

togglePassword.addEventListener('click', function () {
    // Ubah tipe input dari password ke text atau sebaliknya
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    // Ubah ikon mata (bisa disesuaikan dengan emoji atau icon lain)
    this.innerText = type === 'password' ? '👁️' : '🙈';
});

// Fitur Login
document.getElementById('btnAdminLogin').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!email || !password) {
        alert("Email dan Password harus diisi!");
        return;
    }

    const btnLogin = document.getElementById('btnAdminLogin');
    btnLogin.innerText = "Memverifikasi...";

    // Tarik data akun admin dari Firebase
    const adminRef = ref(db, 'admin');
    
    try {
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
            const dataAdmin = snapshot.val();
            
            // PELACAK DEBUGGING (Tekan F12 -> Console di browser untuk melihat ini)
            console.log("=== CEK DATA LOGIN ===");
            console.log("Email yang diketik:", email);
            console.log("Email di Database:", dataAdmin.email);
            console.log("Password yang diketik:", password);
            console.log("Password di Database:", dataAdmin.password);
            
            // Cocokkan data (Ubah semua jadi String dan hilangkan spasi liar)
            const isEmailMatch = String(email).toLowerCase() === String(dataAdmin.email).toLowerCase().trim();
            const isPasswordMatch = String(password) === String(dataAdmin.password).trim();

            if (isEmailMatch && isPasswordMatch) {
                localStorage.setItem("sessionAdmin", "AKTIF");
                alert("Selamat datang, Admin!");
                window.location.href = "admin-dashboard.html";
            } else {
                alert("Email atau Password salah! (Cek Console F12 untuk detailnya)");
                btnLogin.innerText = "Masuk Portal"; // Kembalikan teks tombol
            }
        } else {
            alert("Data admin belum diatur di Firebase (Folder 'admin' tidak ditemukan).");
            btnLogin.innerText = "Masuk Portal";
        }
    } catch (error) {
        console.error("Error Koneksi:", error);
        alert("Gagal terhubung ke database. Pastikan internet aktif.");
        btnLogin.innerText = "Masuk Portal";
    }
});