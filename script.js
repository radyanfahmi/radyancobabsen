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
    }
}

// Gunakan timeout agar tidak mencari selamanya
const options = {
    enableHighAccuracy: false, // Ubah ke false jika di PC sering macet
    timeout: 10000,            // Maksimal menunggu 10 detik
    maximumAge: 0
};

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            updateStatus(`Lokasi Terdeteksi! Akurasi: ${Math.round(position.coords.accuracy)} meter.`, 'success');
            
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
    updateStatus("Browser tidak mendukung GPS.", "error");
}

// Fungsi prosesAbsen tetap sama seperti sebelumnya...
