const statusBox = document.getElementById('status-box');
const btnIn = document.getElementById('btn-in');
const btnOut = document.getElementById('btn-out');

let currentLat = null;
let currentLng = null;

function updateStatus(pesan, tipe = 'info') {
    statusBox.innerHTML = pesan;
    if (tipe === 'error') {
        statusBox.className = "mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200";
    } else if (tipe === 'success') {
        statusBox.className = "mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200";
    } else {
        statusBox.className = "mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200";
    }
}

// Pengaturan GPS
const options = {
    enableHighAccuracy: false, // Aman untuk PC & HP
    timeout: 10000,            // Maksimal 10 detik
    maximumAge: 0
};

// 1. Ambil Lokasi
if (navigator.geolocation) {
    updateStatus("Mencari lokasi Anda...", "info");
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            updateStatus(`Lokasi Terdeteksi! Akurasi: ${Math.round(position.coords.accuracy)} meter.`, 'success');
            
            // Aktifkan tombol!
            btnIn.disabled = false;
            btnOut.disabled = false;
            btnIn.classList.remove('opacity-50', 'cursor-not-allowed');
            btnOut.classList.remove('opacity-50', 'cursor-not-allowed');
        },
        (error) => {
            let detailError = "Gagal mengambil lokasi.";
            if (error.code === 1) detailError = "Izin lokasi ditolak browser.";
            if (error.code === 2) detailError = "Sinyal GPS tidak stabil/tidak ada.";
            if (error.code === 3) detailError = "Waktu pencarian habis (Timeout).";
            
            updateStatus(detailError + " Silakan refresh halaman.", "error");
        },
        options
    );
} else {
    updateStatus("Browser Anda tidak mendukung GPS.", "error");
}

// 2. Fungsi Absen (Yang membuat tombol berfungsi)
async function prosesAbsen(tipe) {
    if (!currentLat || !currentLng) {
        alert("Lokasi belum ditemukan, harap tunggu.");
        return;
    }

    // Ubah teks tombol sementara
    const btnClicked = tipe === 'masuk' ? btnIn : btnOut;
    const originalText = btnClicked.innerText;
    btnClicked.innerText = "Memproses...";
    btnClicked.disabled = true;

    const payload = {
        karyawan_id: "KRY-001",
        tipe_absen: tipe,
        lat: currentLat,
        lng: currentLng
    };

    try {
        const response = await fetch('/api/absen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`SUKSES!\n${result.message}\nWaktu: ${result.waktu}`);
        } else {
            alert(`GAGAL!\n${result.error}`);
        }
    } catch (error) {
        alert("Gagal terhubung ke server Vercel.");
    } finally {
        // Kembalikan tombol ke bentuk semula
        btnClicked.innerText = originalText;
        btnClicked.disabled = false;
    }
}
