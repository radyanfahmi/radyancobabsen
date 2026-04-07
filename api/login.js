export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { username, password } = req.body;

    // Ini adalah "Database Bohongan" (Dummy Database)
    // Di dunia nyata, data ini diambil dari Supabase, Firebase, atau MySQL
    const users = [
        { id: "KRY-001", nama: "Budi Santoso", username: "budi", password: "123" },
        { id: "KRY-002", nama: "Siti Aminah", username: "siti", password: "123" }
    ];

    // Cek apakah username dan password cocok
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Jika cocok, kembalikan data user (tanpa password)
        return res.status(200).json({ 
            message: "Login sukses", 
            user: { id: user.id, nama: user.nama } 
        });
    } else {
        // Jika salah
        return res.status(401).json({ error: "Username atau password salah!" });
    }
}
