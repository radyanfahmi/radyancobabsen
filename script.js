// Deklarasi Elemen
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const absenSection = document.getElementById('absen-section');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const namaKaryawanText = document.getElementById('nama-karyawan');
const idKaryawanText = document.getElementById('id-karyawan');
const statusBox = document.getElementById('status-box');
const btnIn = document.getElementById('btn-in');
const btnOut = document.getElementById('btn-out');

let currentLat = null;
let currentLng = null;
let loggedInUser = null;

// 1. INISIALISASI DATABASE SIMULASI DI LOCALSTORAGE
// Jika belum ada database, kita buatkan 1 akun contoh
if (!localStorage.getItem('db_karyawan')) {
    const defaultData = [
        { id: "KRY-001", nama: "Budi Santoso", username: "budi", password: "123" }
    ];
    localStorage.setItem('db_karyawan', JSON.stringify(defaultData));
}

window.onload = () => {
    const savedUser = localStorage.getItem('userAbsen');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        tampilkanPanelAbsen();
    }
};

// 2. FUNGSI GANTI HALAMAN (Login <-> Register)
function toggleForm(target) {
    if (target === 'register') {
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    } else {
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
}

// 3. PROSES REGISTRASI AKUN BARU
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('reg-nama').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    // Ambil database karyawan saat ini
    let dbKaryawan = JSON.parse(localStorage.getItem('db_karyawan'));

    // Cek apakah username sudah dipakai
    const isExist = dbKaryawan.find(u => u.username === username);
    if (isExist) {
        return alert("Username sudah digunakan! Pilih yang lain.");
    }

    // Buat ID Karyawan Otomatis (Contoh: KRY-002, KRY-003)
    const newId = `KRY-00${dbKaryawan.length + 1}`;

    // Simpan data baru
    dbKaryawan.push({ id: newId, nama: nama, username: username, password: password });
    localStorage.setItem('db_karyawan', JSON.stringify(dbKaryawan));

    alert(`Pendaftaran Sukses!\nNama: ${nama}\nID Anda: ${newId}\nSilakan login.`);
    
    // Bersihkan form dan kembali ke halaman login
    registerForm.reset();
    toggleForm('login');
});

// 4. PROSES LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // Ambil database
    const dbKaryawan = JSON.parse(localStorage.getItem('db_karyawan'));

    // Cari user yang cocok
    const user = dbKaryawan.find(u => u.username === usernameInput && u.password === passwordInput);

    if (user) {
        // Login Sukses
        loggedInUser = { id: user.id, nama: user.nama };
        localStorage.setItem('userAbsen', JSON.stringify(loggedInUser));
        tampilkanPanelAbsen();
    } else {
        alert("Username atau Password salah!");
    }
});

// 5. TAMPILKAN PANEL ABSEN & CARI LOKASI
function tampilkanPanelAbsen() {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    absenSection.classList.remove('hidden');
    
    namaKaryawanText.innerText = loggedInUser.nama;
    idKaryawanText.innerText = loggedInUser.id;
    mulaiCariLokasi();
}

// 6. FUNGSI LOGOUT
function logout() {
    localStorage.removeItem('userAbsen');
    loggedInUser = null;
    loginForm.reset();
    absenSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// 7. CARI LOKASI GPS (Dipanggil saat di panel absen)
function mulaiCariLokasi() {
    updateStatus("Mencari lokasi Anda...", "info");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                updateStatus(`Lokasi Terdeteksi! Akurasi: ${Math.round(position.coords.accuracy)} meter.`, 'success');
                btnIn.disabled = false; btnOut.disabled = false;
                btnIn.classList.remove('opacity-50', 'cursor-not-allowed');
                btnOut.classList.remove('opacity-50', 'cursor-not-allowed');
            },
            (error) => updateStatus("Gagal mengambil lokasi GPS.", "error"),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
    }
}

// 8. PROSES KIRIM DATA ABSEN KE BACKEND VERCEL
async function prosesAbsen(tipe) {
    if (!currentLat || !currentLng) return alert("Lokasi belum ditemukan!");

    const btnClicked = tipe === 'masuk' ? btnIn : btnOut;
    const originalText = btnClicked.innerText;
    btnClicked.innerText = "Memproses...";
    btnClicked.disabled = true;

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
        alert(`SUKSES!\n${result.message}\nWaktu: ${result.waktu}`);
    } catch (error) {
        alert(`Gagal Absen!\n${error.message}`);
    } finally {
        btnClicked.innerText = originalText;
        btnClicked.disabled = false;
    }
}

function updateStatus(pesan, tipe = 'info') {
    statusBox.innerHTML = pesan;
    statusBox.className = `mb-6 p-4 rounded-lg text-sm border ${
        tipe === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 
        tipe === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
        'bg-blue-50 text-blue-700 border-blue-200'
    }`;
}
