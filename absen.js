// Koordinat Kantor (Silakan sesuaikan dengan titik presisi kantor Anda)
const OFFICE_LAT = -7.8228;
const OFFICE_LNG = 112.0115;
const MAX_RADIUS = 50; // Jarak toleransi dalam meter

// Fungsi Haversine untuk hitung jarak
function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Ini adalah format standar fungsi serverless Vercel
export default function handler(req, res) {
    // Vercel Serverless Function secara default menerima semua method (GET/POST/dll)
    // Kita kunci agar hanya menerima POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { karyawan_id, tipe_absen, lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Koordinat GPS tidak valid atau kosong!" });
    }

    // 1. Validasi Jarak
    const jarakKaryawan = hitungJarak(OFFICE_LAT, OFFICE_LNG, lat, lng);
    
    if (jarakKaryawan > MAX_RADIUS) {
        return res.status(403).json({ 
            error: `Anda berada di luar area kantor. Jarak Anda: ${Math.round(jarakKaryawan)} meter.` 
        });
    }

    // 2. Ambil Waktu Server (Aman dari manipulasi jam perangkat pengguna)
    const waktuServer = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // 3. (Opsional) Disini Anda bisa menambahkan script untuk menyimpan ke Database
    // seperti Supabase, Firebase, atau MongoDB.
    console.log(`[${waktuServer}] ${karyawan_id} melakukan absen ${tipe_absen}. Jarak: ${Math.round(jarakKaryawan)}m`);

    // Kirim response sukses
    return res.status(200).json({
        message: `Absen ${tipe_absen} berhasil dicatat.`,
        waktu: waktuServer
    });
}