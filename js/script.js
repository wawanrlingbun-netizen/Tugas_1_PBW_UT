// script.js - Logika utama aplikasi

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Functions ---

    /**
     * Memeriksa status login pengguna.
     * Jika tidak ada sesi, redirect ke index.html.
     */
    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage !== 'index.html' && !isLoggedIn) {
            window.location.href = 'index.html';
        } else if (currentPage === 'index.html' && isLoggedIn) {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Panggil checkAuth di awal
    checkAuth();
    
    // Event listener untuk tombol Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('loggedInUser');
            alert("Anda telah berhasil logout.");
            window.location.href = 'index.html';
        });
    }

    // --- Logic untuk index.html (Login) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;

            // Cari pengguna di dataPengguna (dari data.js)
            const user = dataPengguna.find(
                p => p.email === emailInput && p.password === passwordInput
            );

            if (user) {
                // Login berhasil
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                alert(`Login Berhasil! Selamat datang, ${user.nama}.`);
                window.location.href = 'dashboard.html';
            } else {
                // Login gagal (menggunakan alert box)
                alert("email/password yang anda masukkan salah");
            }
        });

        // Logika Modal Box untuk Lupa Password dan Daftar
        const forgotModal = document.getElementById('forgot-modal');
        const registerModal = document.getElementById('register-modal');
        const forgotBtn = document.getElementById('forgot-password-btn');
        const registerBtn = document.getElementById('register-btn');
        const closeBtns = document.querySelectorAll('.close-btn');

        forgotBtn.addEventListener('click', () => forgotModal.style.display = 'block');
        registerBtn.addEventListener('click', () => registerModal.style.display = 'block');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                document.getElementById(modalId).style.display = 'none';
            });
        });

        // Tutup modal ketika klik di luar modal
        window.onclick = function(event) {
            if (event.target == forgotModal) {
                forgotModal.style.display = "none";
            }
            if (event.target == registerModal) {
                registerModal.style.display = "none";
            }
        }
    }


    // --- Logic untuk dashboard.html ---
    const greetingMessage = document.getElementById('greeting-message');
    const userInfo = document.getElementById('user-info');
    if (greetingMessage && userInfo) {
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = "Selamat pagi";
        } else if (hour < 17) {
            greeting = "Selamat siang";
        } else {
            greeting = "Selamat sore";
        }

        greetingMessage.textContent = `${greeting}, ${user ? user.nama : 'Pengguna'}`;
        userInfo.textContent = user ? `${user.nama} (${user.role} - ${user.lokasi})` : 'Pengguna SITTA';
    }

    // --- Logic untuk tracking.html ---
    const trackingForm = document.getElementById('tracking-form');
    const trackingResult = document.getElementById('tracking-result');
    if (trackingForm) {
        trackingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nomorDO = document.getElementById('nomor-do').value.trim();
            const data = dataTracking[nomorDO]; // Akses dataTracking dari data.js

            if (data) {
                // Tampilkan hasil
                document.getElementById('nama-penerima').textContent = `Nama Penerima: ${data.nama}`;
                document.getElementById('nomor-do-display').textContent = data.nomorDO;
                
                const statusElement = document.getElementById('status-pengiriman');
                statusElement.textContent = data.status;
                statusElement.className = `status-badge ${data.status.replace(/\s/g, '')}`; // Untuk CSS styling

                document.getElementById('ekspedisi-detail').textContent = data.ekspedisi;
                document.getElementById('tanggal-kirim-detail').textContent = data.tanggalKirim;
                document.getElementById('paket-detail').textContent = data.paket;
                document.getElementById('total-detail').textContent = data.total;

                // Tampilkan Perjalanan Paket
                const perjalananList = document.getElementById('perjalanan-list');
                perjalananList.innerHTML = ''; // Kosongkan list
                
                // Urutkan terbalik agar yang terbaru di atas
                const sortedPerjalanan = [...data.perjalanan].reverse(); 

                sortedPerjalanan.forEach(p => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${p.waktu}</strong>: ${p.keterangan}`;
                    perjalananList.appendChild(li);
                });

                trackingResult.style.display = 'block';

            } else {
                // Not found (menggunakan alert box)
                trackingResult.style.display = 'none';
                alert(`Nomor DO ${nomorDO} tidak ditemukan dalam sistem tracking.`);
            }
        });
    }

    // --- Logic untuk stok.html ---
    const stokTableBody = document.getElementById('stok-table-body');
    const addStockBtn = document.getElementById('add-stock-btn');
    const addStockFormSection = document.getElementById('add-stock-form-section');
    const newStockForm = document.getElementById('new-stock-form');
    const cancelAddBtn = document.getElementById('cancel-add-btn');

    /**
     * Mengisi tabel stok dari dataBahanAjar.
     */
function renderStokTable() {
    if (!stokTableBody) return;
    stokTableBody.innerHTML = ''; // Kosongkan tabel
    
    // Ganti dataBahanAjar.forEach menjadi loop yang menyertakan index
    dataBahanAjar.forEach((item, index) => { // PERUBAHAN DI SINI: tambahkan 'index'
        const row = stokTableBody.insertRow();
        
        // ... (Kolom Cover sampai Edisi tetap sama) ...
        const cellCover = row.insertCell();
        cellCover.innerHTML = `<img src="${item.cover}" alt="Cover ${item.namaBarang}" onerror="this.onerror=null;this.src='img/placeholder.jpg';" title="${item.namaBarang}">`;
        
        row.insertCell().textContent = item.kodeLokasi;
        row.insertCell().textContent = item.kodeBarang;
        row.insertCell().textContent = item.namaBarang;
        row.insertCell().textContent = item.jenisBarang;
        row.insertCell().textContent = item.edisi;
        
        // Kolom Stok
        const cellStok = row.insertCell();
        cellStok.textContent = item.stok;
        if (item.stok < 200) {
            cellStok.style.backgroundColor = '#ffdddd'; 
            cellStok.style.fontWeight = 'bold';
        }

        // TAMBAHKAN KOLOM AKSI (TOMBOL EDIT)
        const cellAksi = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'primary-button';
        editButton.style.padding = '8px 12px';
        editButton.style.fontSize = '0.9em';
        editButton.style.marginRight = '5px';
        editButton.setAttribute('data-index', index); 
        
        editButton.addEventListener('click', (e) => {
             const itemIndex = parseInt(e.target.getAttribute('data-index')); 
             openEditModal(itemIndex);
        });

        cellAksi.appendChild(editButton);
    });
}

    if (stokTableBody) {
        renderStokTable();
    }
/**
 * Membuka modal edit dan mengisi data.
 * @param {number} index - Indeks item yang akan diedit di dataBahanAjar.
 */
function openEditModal(index) {
    const item = dataBahanAjar[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editKodeLokasi').value = item.kodeLokasi;
    document.getElementById('editKodeBarang').value = item.kodeBarang;
    document.getElementById('editNamaBarang').value = item.namaBarang;
    document.getElementById('editJenisBarang').value = item.jenisBarang;
    document.getElementById('editEdisi').value = item.edisi;
    document.getElementById('editStok').value = item.stok;

    document.getElementById('edit-stock-modal').style.display = 'block';
}

// Logika menutup modal edit
const closeEditModalBtn = document.getElementById('close-edit-modal');
if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => {
        document.getElementById('edit-stock-modal').style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('edit-stock-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

// Logika Submit Form Edit
const editStockForm = document.getElementById('edit-stock-form');
if (editStockForm) {
    editStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editIndex').value;
        const item = dataBahanAjar[index];

        item.kodeLokasi = document.getElementById('editKodeLokasi').value.toUpperCase();
        item.kodeBarang = document.getElementById('editKodeBarang').value.toUpperCase();
        
        const namaBarangInput = document.getElementById('editNamaBarang').value;
        item.namaBarang = namaBarangInput;
        item.jenisBarang = document.getElementById('editJenisBarang').value.toUpperCase();
        item.edisi = document.getElementById('editEdisi').value;
        item.stok = parseInt(document.getElementById('editStok').value, 10);
        
        const fileInput = document.getElementById('editCover');
        
        const processEditSubmit = () => {
            renderStokTable();
            document.getElementById('edit-stock-modal').style.display = 'none';
            alert(`Bahan Ajar "${item.namaBarang}" berhasil diperbarui!`);
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                item.cover = event.target.result;
                processEditSubmit();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            // Jika tidak ada cover baru yang diupload, biarkan cover lama
            processEditSubmit();
        }
    });
}
    // Logika tombol Tambah Stok Baru
    if (addStockBtn) {
        addStockBtn.addEventListener('click', () => {
            addStockFormSection.style.display = 'block';
            addStockBtn.style.display = 'none';
        });

        cancelAddBtn.addEventListener('click', () => {
            addStockFormSection.style.display = 'none';
            addStockBtn.style.display = 'block';
            newStockForm.reset();
        });
    }

// Logika Form Tambah Stok Baru (Manipulasi Data Tabel)
if (newStockForm) {
    newStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const namaBarangInput = document.getElementById('namaBarangNew').value;
        const fileInput = document.getElementById('coverNew');

        const processSubmit = (coverUrl) => {
            const newStock = {
                kodeLokasi: document.getElementById('kodeLokasiNew').value.toUpperCase(),
                kodeBarang: document.getElementById('kodeBarangNew').value.toUpperCase(),
                namaBarang: namaBarangInput,
                jenisBarang: document.getElementById('jenisBarangNew').value.toUpperCase(),
                edisi: document.getElementById('edisiNew').value,
                stok: parseInt(document.getElementById('stokNew').value, 10),
                cover: coverUrl, 
            };

            dataBahanAjar.push(newStock);
            renderStokTable();
            newStockForm.reset();
            addStockFormSection.style.display = 'none';
            addStockBtn.style.display = 'block';
            alert(`Bahan Ajar "${newStock.namaBarang}" berhasil ditambahkan!`);
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                processSubmit(event.target.result);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            // Fallback: Generate path otomatis jika tidak ada upload
            const generatedCoverPath = 'img/' + namaBarangInput
                .toLowerCase()
                .replace(/\s/g, '_')
                .replace(/[^a-z0-9_]/g, '') + '.jpg';
            processSubmit(generatedCoverPath);
        }
    });
}
});