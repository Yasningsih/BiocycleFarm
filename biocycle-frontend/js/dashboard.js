import { db } from "./firebase-config.js";
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ==========================================
// FITUR: NOTIFIKASI OTOMATIS HILANG (2 DETIK)
// ==========================================
function showToast(pesan) {
    let toast = document.getElementById("toastNotification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toastNotification";
        toast.style.cssText = "position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(40, 167, 69, 0.9); color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; text-align: center; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2); font-family: sans-serif;";
        document.body.appendChild(toast);
    }
    toast.innerText = pesan;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);
}

// ==========================================
// 1. VALIDASI PROTEKSI LOGIN & SESSION
// ==========================================
const currentUser = localStorage.getItem("sessionUserCode");
const userConfigStr = localStorage.getItem("userConfigShow");

if (!currentUser) {
    alert("Harap login terlebih dahulu!");
    window.location.href = "index.html";
}

document.getElementById('displayUserCode').innerText = currentUser;

// ==========================================
// 2. TERAPKAN ATURAN VISIBILITAS CARD ADMIN
// ==========================================
const showConfig = JSON.parse(userConfigStr || "{}");
if (showConfig.temp === false) document.getElementById('cardTemp').style.display = "none";
if (showConfig.ph === false) document.getElementById('cardPh').style.display = "none";
if (showConfig.tds === false) document.getElementById('cardTds').style.display = "none";
if (showConfig.jarak === false) document.getElementById('cardJarak').style.display = "none";

// ==========================================
// 3. TARIK DATA SENSOR SECARA LIVE (REAL-TIME)
// ==========================================
const latestRef = ref(db, `sensorData/${currentUser}/latest`);
onValue(latestRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        let suhu = Number(data.temp || 0);
        let ph = Number(data.ph || 0);
        let tds = Number(data.tds || 0);
        let jarak = Number(data.jarak || 0);

        let persentasePakan = ((20 - jarak) / 20) * 100;
        if (persentasePakan > 100) persentasePakan = 100; 
        if (persentasePakan < 0) persentasePakan = 0;     

        document.getElementById('valTemp').innerText = suhu.toFixed(1);
        document.getElementById('valPh').innerText = ph.toFixed(1);
        document.getElementById('valTds').innerText = tds.toFixed(1);
        document.getElementById('valJarak').innerText = persentasePakan.toFixed(0); 

        let elStatusSuhu = document.getElementById("statusTemp");
        if (suhu >= 25 && suhu <= 30) {
            elStatusSuhu.innerText = "✅ Normal (Ideal)"; elStatusSuhu.style.color = "#155724"; 
        } else {
            elStatusSuhu.innerText = "⚠️ Suhu Ekstrem"; elStatusSuhu.style.color = "#721c24"; 
        }

        let elStatusPh = document.getElementById("statusPh");
        if (ph >= 6.5 && ph <= 7.5) {
            elStatusPh.innerText = "✅ Normal (Aman)"; elStatusPh.style.color = "#155724";
        } else if (ph > 7.5) {
            elStatusPh.innerText = "⚠️ Terlalu Basa"; elStatusPh.style.color = "#721c24";
        } else {
            elStatusPh.innerText = "⚠️ Terlalu Asam"; elStatusPh.style.color = "#721c24";
        }

        let elStatusTds = document.getElementById("statusTds");
        if (tds >= 200 && tds <= 800) {
            elStatusTds.innerText = "✅ Nutrisi Cukup"; elStatusTds.style.color = "#155724";
        } else if (tds < 200) {
            elStatusTds.innerText = "⚠️ Nutrisi Kurang"; elStatusTds.style.color = "#856404"; 
        } else {
            elStatusTds.innerText = "⚠️ Nutrisi Pekat"; elStatusTds.style.color = "#721c24";
        }

        let elStatusJarak = document.getElementById("statusJarak");
        if (persentasePakan <= 10) { 
            elStatusJarak.innerText = "⚠️ Pakan Hampir Habis!"; elStatusJarak.style.color = "#721c24";
        } else {
            elStatusJarak.innerText = "✅ Pakan Tersedia"; elStatusJarak.style.color = "#155724";
        }
    }
});

// ==========================================
// 4. MONITORING STATUS MODE POMPA TERKINI
// ==========================================
const pumpRef = ref(db, `control/${currentUser}/pump`);
onValue(pumpRef, (snapshot) => {
    document.getElementById('statusPompa').innerText = snapshot.val() || "AUTO";
});

// ==========================================
// 5. FUNGSI KONTROL AKTUATOR & LOGOUT
// ==========================================
function ubahPompa(mode) {
    set(ref(db, `control/${currentUser}/pump`), mode)
        .then(() => showToast(`Pompa diubah ke mode: ${mode}`))
        .catch(err => console.error("Gagal mengirim perintah:", err));
}

document.getElementById('btnPumpOn').addEventListener('click', () => ubahPompa("ON"));
document.getElementById('btnPumpOff').addEventListener('click', () => ubahPompa("OFF"));
document.getElementById('btnPumpAuto').addEventListener('click', () => ubahPompa("AUTO"));

document.getElementById('btnFeedNow').addEventListener('click', () => {
    set(ref(db, `control/${currentUser}/feed`), true)
        .then(() => showToast("Sinyal pakan terkirim ke alat!"))
        .catch(err => console.error(err));
});

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear(); 
    window.location.href = "index.html";
});

// ==========================================
// 6. INVENTARISASI GRAFIK & BAR PILIHAN KEBAWAH (DROPDOWN DROPDOWN)
// ==========================================
const ctx = document.getElementById('historyChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Suhu Air (°C)', data: [], borderColor: 'orange', tension: 0.3, yAxisID: 'y' },
            { label: 'pH Air', data: [], borderColor: 'blue', tension: 0.3, yAxisID: 'y' },
            { label: 'Nutrisi (TDS)', data: [], borderColor: 'green', tension: 0.3, yAxisID: 'y1' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // PENTING: Menghapus bug grafik gepeng di HP
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10, // Memperkecil kotak warna legenda
                    font: { size: 11, family: 'inherit' } // Memperkecil teks legenda
                }
            }
        },
        scales: {
            y: { 
                type: 'linear', 
                display: true, 
                position: 'left',
                ticks: { font: { size: 10 } } // Memperkecil angka sumbu Y kiri
            },
            y1: { 
                type: 'linear', 
                display: true, 
                position: 'right', 
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 10 } } // Memperkecil angka sumbu Y kanan
            },
            x: {
                ticks: { font: { size: 9 } } // Memperkecil teks waktu di sumbu X bawah
            }
        }
    }
});

let cacheHistoryData = null;

// Fungsi dinamis untuk mengisi opsi pilihan bar kebawah berdasarkan riwayat nyata di Firebase
function updateDropdownPilihan(data) {
    const selectElement = document.getElementById('filterTanggal');
    const nilaiTerpilihLama = selectElement.value; // Amankan status klik user

    let setTanggalUnik = new Set();
    for (const timestamp in data) {
        let tsNumber = parseInt(timestamp);
        if (timestamp.length === 10) tsNumber *= 1000;
        const date = new Date(tsNumber);
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        setTanggalUnik.add(`${yyyy}-${mm}-${dd}`);
    }

    let optionsHTML = '<option value="">-- Semua Tanggal --</option>';
    // Urutkan tanggal pilihan dropdown dari yang paling baru
    Array.from(setTanggalUnik).sort().reverse().forEach(tgl => {
        const parts = tgl.split('-');
        const displayFormat = `${parts[2]}/${parts[1]}/${parts[0]}`; // Hasil tampil di UI: DD/MM/YYYY
        optionsHTML += `<option value="${tgl}">${displayFormat}</option>`;
    });

    selectElement.innerHTML = optionsHTML;
    selectElement.value = nilaiTerpilihLama; // Kembalikan posisi klik user
}

function prosesDanTampilkanData() {
    if (!cacheHistoryData) return;

    const tanggalTerpilih = document.getElementById('filterTanggal').value;

    let labelWaktu = [];
    let dataSuhu = [];
    let dataPh = [];
    let dataTds = []; 
    let tableRows = ""; 

    for (const timestamp in cacheHistoryData) {
        let tsNumber = parseInt(timestamp);
        if (timestamp.length === 10) tsNumber *= 1000; 

        const date = new Date(tsNumber);
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const stringTanggalData = `${yyyy}-${mm}-${dd}`;

        // COCOKKAN DATA DENGAN VALUE BAR PILIHAN KEBAWAH (DROPDOWN)
        if (tanggalTerpilih && tanggalTerpilih !== stringTanggalData) {
            continue;
        }

        const jam = date.getHours().toString().padStart(2, '0');
        const menit = date.getMinutes().toString().padStart(2, '0');
        const formatWaktu = `${dd}/${mm} ${jam}:${menit}`;

        labelWaktu.push(formatWaktu);
        dataSuhu.push(cacheHistoryData[timestamp].temp);
        dataPh.push(cacheHistoryData[timestamp].ph);
        dataTds.push(cacheHistoryData[timestamp].tds || 0); 

       tableRows = `
            <tr style="border-bottom: 1px solid #e2efe2;">
                <td style="padding: 12px 8px; font-size: 13px; white-space: nowrap;">${formatWaktu}</td>
                <td style="padding: 12px 8px; font-size: 13px; white-space: nowrap;">${Number(cacheHistoryData[timestamp].temp || 0).toFixed(1)} °C</td>
                <td style="padding: 12px 8px; font-size: 13px; white-space: nowrap;">${Number(cacheHistoryData[timestamp].ph || 0).toFixed(1)}</td>
                <td style="padding: 12px 8px; font-size: 13px; white-space: nowrap;">${Number(cacheHistoryData[timestamp].tds || 0).toFixed(0)} ppm</td>
            </tr>
        ` + tableRows;
    }

    if (tanggalTerpilih) {
        chart.data.labels = labelWaktu;
        chart.data.datasets[0].data = dataSuhu;
        chart.data.datasets[1].data = dataPh;
        chart.data.datasets[2].data = dataTds;
    } else {
        chart.data.labels = labelWaktu.slice(-10);
        chart.data.datasets[0].data = dataSuhu.slice(-10);
        chart.data.datasets[1].data = dataPh.slice(-10);
        chart.data.datasets[2].data = dataTds.slice(-10);
    }
    chart.update(); 

    const tBody = document.getElementById('historyTableBody');
    if (tBody) {
        tBody.innerHTML = tableRows ? tableRows : `<tr><td colspan="4" class="text-muted" style="padding:15px;">Tidak ada riwayat data pada tanggal terpilih.</td></tr>`;
    }
}

const historyRef = ref(db, `sensorData/${currentUser}/history`);
onValue(historyRef, (snapshot) => {
    cacheHistoryData = snapshot.val();
    if (cacheHistoryData) {
        updateDropdownPilihan(cacheHistoryData); // Buat daftar pilihan bar kebawah
        prosesDanTampilkanData(); // Tampilkan tabel & grafik
    }
});

// Jalankan fungsi jika pilihan bar kebawah diganti oleh user
document.getElementById('filterTanggal').addEventListener('change', prosesDanTampilkanData);
document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('filterTanggal').value = ""; 
    prosesDanTampilkanData(); 
});

// ==========================================
// 7. MENGIRIM CONFIG JADWAL ALARM POMPA
// ==========================================
document.getElementById('btnSimpanAlarm').addEventListener('click', () => {
    let jamPagi = document.getElementById('inputJadwalPagi').value; 
    let jamSore = document.getElementById('inputJadwalSore').value; 

    if (!jamPagi || !jamSore) {
        showToast("Harap pilih jam Pagi dan Sore!");
        return;
    }

    set(ref(db, `config/${currentUser}/jadwalPagi`), jamPagi);
    set(ref(db, `config/${currentUser}/jadwalSore`), jamSore)
        .then(() => {
            showToast(`Alarm tersimpan: Pagi (${jamPagi}) & Sore (${jamSore})`);
        })
        .catch((err) => {
            console.error(err);
            showToast("Gagal menyimpan alarm ke server!");
        });
});
