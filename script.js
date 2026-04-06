// ... (Kode geolokasi di atasnya tetap sama persis) ...

async function prosesAbsen(tipe) {
    if (!currentLat || !currentLng) return alert("Lokasi belum ditemukan!");

    const payload = {
        karyawan_id: "KRY-001", // Nanti bisa disesuaikan dengan form login
        tipe_absen: tipe,
        lat: currentLat,
        lng: currentLng
    };

    try {
        // PERUBAHAN DISINI: Cukup panggil /api/absen
        const response = await fetch('/api/absen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Sukses! ${result.message}\nWaktu Server: ${result.waktu}`);
        } else {
            alert(`Gagal: ${result.error}`);
        }
    } catch (error) {
        alert("Gagal terhubung ke server.");
    }
}