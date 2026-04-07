// Deklarasi Elemen
const loginSection = document.getElementById('login-section');
const absenSection = document.getElementById('absen-section');
const loginForm = document.getElementById('login-form');
const namaKaryawanText = document.getElementById('nama-karyawan');
const statusBox = document.getElementById('status-box');
const btnIn = document.getElementById('btn-in');
const btnOut = document.getElementById('btn-out');

let currentLat = null;
let currentLng = null;
let loggedInUser = null; // Menyimpan data user yang login

// 1. CEK SESI LOGIN SAAT HALAMAN DIBUKA
window.onload = () => {
    const savedUser = localStorage.getItem('userAbsen');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        tampilkanPanelAbsen();
    }
};

// 2. PROSES LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah halaman refresh
    const btnLogin = document.getElementById('btn-login');
    btnLogin.innerText = "Mengecek...";
    btnLogin.disabled = true;

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const result = await response.json();

        if (response.ok) {
            // Login Berhasil! Simpan data di memori HP/Browser
            loggedInUser = result.user;
            localStorage.setItem('userAbsen', JSON.stringify(loggedInUser));
            tampilkanPanelAbsen();
        } else {
            alert(`Gagal: ${result.error}`);
        }
    } catch (error) {
        alert("Gagal terhubung ke server login.");
    } finally {
        btnLogin.innerText = "Masuk";
        btnLogin.disabled = false;
    }
});

// 3. FUNGSI UNTUK PINDAH KE HALAMAN ABSEN
function tampilkanPanelAbsen() {
    loginSection.classList.add('hidden');
    absenSection.classList.remove('hidden');
    namaKaryawanText.innerText = loggedInUser.nama;
    mulaiCariLokasi();
}

// 4. FUNGSI LOGOUT
function logout() {
    localStorage.removeItem('userAbsen');
    loggedInUser = null;
    loginSection.classList.remove('hidden');
    absenSection.classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// 5. CARI LOKASI GPS (Dipanggil setelah login berhasil)
function mulaiCariLokasi() {
    updateStatus("Mencari lokasi Anda...", "info");
    
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
                updateStatus("Gagal mengambil lokasi GPS. Pastikan Izin Lokasi aktif.", "error");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
    }
}

// 6. PROSES ABSENSI KE SERVER
async function prosesAbsen(tipe) {
    if (!currentLat || !currentLng) return alert("Lokasi belum ditemukan!");

    const btnClicked = tipe === 'masuk' ? btnIn : btnOut;
    const originalText = btnClicked.innerText;
    btnClicked.innerText = "Memproses...";
    btnClicked.disabled = true;

    // Sekarang payload mengirim ID dan Nama Karyawan yang asli!
    const payload = {
        karyawan_id: loggedInUser.id,
        nama_karyawan: loggedInUser.nama,
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

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Terjadi kesalahan server");
        }

        const result = await response.json();
        alert(`SUKSES!\nHalo ${loggedInUser.nama},\n${result.message}\nWaktu: ${result.waktu}`);
        
    } catch (error) {
        alert(`Gagal Absen!\n${error.message}`);
    } finally {
        btnClicked.innerText = originalText;
        btnClicked.disabled = false;
    }
}

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
