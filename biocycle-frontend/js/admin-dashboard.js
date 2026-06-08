import { db } from "./firebase-config.js";
// 'set' dihapus dari import karena sekarang tugas 'set' data awal diambil alih oleh Java
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. Keamanan: Cek apakah yang buka halaman ini benar-benar Admin
if (localStorage.getItem("sessionAdmin") !== "AKTIF") {
    alert("Akses Ditolak! Harap login sebagai Admin.");
    window.location.href = "admin-login.html";
}

// Tombol Logout Admin
document.getElementById('btnAdminLogout').addEventListener('click', () => {
    localStorage.removeItem("sessionAdmin");
    window.location.href = "admin-login.html";
});

// ==========================================
// FITUR 1: BUAT USER BARU (MELALUI BACKEND JAVA)
// ==========================================
document.getElementById('btnCreateUser').addEventListener('click', async () => {
    const newCode = document.getElementById('newCodeInput').value.trim().toUpperCase();
    
    // REVISI DOSEN: Ambil value dari kotak password
    const newPassword = document.getElementById('newPasswordInput').value.trim(); 
    
    // REVISI DOSEN: Cek agar keduanya tidak kosong
    if (!newCode || !newPassword) {
        alert("Kode Petani dan Password wajib diisi!"); 
        return;
    }

    const btnCreate = document.getElementById('btnCreateUser');
    const originalText = btnCreate.innerText;
    btnCreate.innerText = "Memproses..."; // Efek loading

    try {
        // BERHASIL DIPERBARUI: Mengarah langsung ke server Hugging Face Space kamu
        const response = await fetch(`https://yibee99-biocycle-backend.hf.space/api/admin/create-user/${newCode}/${newPassword}`, {
            method: 'POST'
        });
        
        const resultText = await response.text();
        
        // Menampilkan pesan balasan dari Java (Apakah sukses atau gagal)
        alert(resultText); 
        
        if (response.ok) {
            // REVISI DOSEN: Kosongkan kedua kotak input jika sukses
            document.getElementById('newCodeInput').value = ""; 
            document.getElementById('newPasswordInput').value = "";
        }
    } catch (error) {
        console.error("Error Fetch:", error);
        alert("Gagal menghubungi Server Java di Hugging Face. Pastikan status Space Anda bertuliskan 'Running'.");
    } finally {
        btnCreate.innerText = originalText; // Kembalikan tulisan tombol
    }
});

// ==========================================
// FITUR 2: CARI DAN EDIT USER (Tetap pakai Firebase langsung)
// ==========================================
let currentUserEdit = ""; // Menyimpan kode user yang sedang diedit

document.getElementById('btnSearchUser').addEventListener('click', async () => {
    const searchCode = document.getElementById('searchUserInput').value.trim().toUpperCase();
    
    if (!searchCode) return;

    try {
        const snapshot = await get(ref(db, `users/${searchCode}`));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            currentUserEdit = searchCode;
            
            // Buka form yang tadinya tersembunyi
            document.getElementById('configSection').style.display = "block";
            document.getElementById('targetUserLabel').innerText = searchCode;

            // Isi nilai form dari database
            document.getElementById('tempMin').value = data.range.temp_min;
            document.getElementById('tempMax').value = data.range.temp_max;
            document.getElementById('phMin').value = data.range.ph_min;
            document.getElementById('phMax').value = data.range.ph_max;
            document.getElementById('tdsMax').value = data.range.tds_max;

            document.getElementById('showTemp').checked = data.show.temp;
            document.getElementById('showPh').checked = data.show.ph;
            document.getElementById('showTds').checked = data.show.tds;
            document.getElementById('showJarak').checked = data.show.jarak;
            
            document.getElementById('feedInterval').value = data.feedInterval || "12";

        } else {
            alert("Kode User tidak ditemukan di sistem!");
            document.getElementById('configSection').style.display = "none";
        }
    } catch (error) {
        console.error(error);
        alert("Gagal mengambil data dari server Firebase.");
    }
});

// ==========================================
// FITUR 3: SIMPAN PERUBAHAN (Tetap pakai Firebase langsung)
// ==========================================
document.getElementById('btnSaveConfig').addEventListener('click', async () => {
    if (!currentUserEdit) return;

    // Ambil data terbaru dari form
    const updatedData = {
        feedInterval: parseInt(document.getElementById('feedInterval').value),
        "range/temp_min": parseFloat(document.getElementById('tempMin').value),
        "range/temp_max": parseFloat(document.getElementById('tempMax').value),
        "range/ph_min": parseFloat(document.getElementById('phMin').value),
        "range/ph_max": parseFloat(document.getElementById('phMax').value),
        "range/tds_max": parseFloat(document.getElementById('tdsMax').value),
        
        "show/temp": document.getElementById('showTemp').checked,
        "show/ph": document.getElementById('showPh').checked,
        "show/tds": document.getElementById('showTds').checked,
        "show/jarak": document.getElementById('showJarak').checked
    };

    try {
        // Gunakan fungsi 'update' agar tidak menimpa keseluruhan data (termasuk password) membabi buta
        await update(ref(db, `users/${currentUserEdit}`), updatedData);
        alert(`Berhasil! Konfigurasi untuk ${currentUserEdit} telah diperbarui.`);
        
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan konfigurasi ke Firebase.");
    }
});
