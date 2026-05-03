// Memuat data dengan lebih aman menggunakan DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  let kec = document.getElementById("kecamatan");

  // Pengaman: Mengecek apakah dataWilayah.js berhasil dimuat
  if (typeof dataWilayah === "undefined") {
    alert("Error: File dataWilayah.js tidak terbaca! Pastikan nama file di index.html sudah benar (perhatikan huruf besar/kecilnya).");
    return;
  }

  // Menggunakan appendChild (lebih aman dan bersih daripada innerHTML)
  Object.keys(dataWilayah).forEach(k => {
    let opt = document.createElement("option");
    opt.value = k;
    opt.text = k;
    kec.appendChild(opt);
  });
});

// update kelurahan
function updateKelurahan() {
  let kec = document.getElementById("kecamatan").value;
  let kel = document.getElementById("kelurahan");
  let kep = document.getElementById("kepling");

  kel.innerHTML = "<option value=''>Pilih Kelurahan</option>";
  kep.innerHTML = "<option value=''>Pilih Kepling</option>";

  if (kec && dataWilayah[kec]) {
    Object.keys(dataWilayah[kec]).forEach(k => {
      kel.innerHTML += `<option value="${k}">${k}</option>`;
    });
  }
}

// update kepling
function updateKepling() {
  let kec = document.getElementById("kecamatan").value;
  let kel = document.getElementById("kelurahan").value;
  let kep = document.getElementById("kepling");

  kep.innerHTML = "<option value=''>Pilih Kepling</option>";

  if (kec && kel && dataWilayah[kec][kel]) {
    dataWilayah[kec][kel].forEach(k => {
      kep.innerHTML += `<option value="${k}">${k}</option>`;
    });
  }
}

// fungsi hapus pendaftar
function hapusPendaftar(btn) {
  // Menghapus elemen card (induk dari tombol hapus)
  btn.parentElement.remove();
}

// tambah card pendaftar
function tambahPendaftar() {
  let container = document.getElementById("pendaftarContainer");

  let div = document.createElement("div");
  div.classList.add("card", "clearfix");

  // Format Card Baru (Atribut 'required' memastikan tidak boleh kosong)
  div.innerHTML = `
    <button type="button" class="hapus-btn" onclick="hapusPendaftar(this)">Hapus</button>
    
    <div class="pendaftar-item">
      <label>Nama Pendaftar <span class="required">*</span></label>
      <input type="text" class="nama_pendaftar" required>
    </div>

    <div class="pendaftar-item">
      <label>NIK (16 digit) <span class="required">*</span></label>
      <input type="text" class="nik" required minlength="16" maxlength="16">
    </div>

    <div class="pendaftar-item">
      <label>No KJP <span class="required">*</span></label>
      <input type="text" class="kjp" required>
    </div>

    <div class="pendaftar-item">
      <label>Nomor Telepon <span class="required">*</span></label>
      <input type="tel" class="telepon" required>
    </div>
  `;

  container.appendChild(div);
}

// submit
document.getElementById("formData").addEventListener("submit", function(e){
  e.preventDefault();

  // 1. MENGAMBIL SEMUA CARD PENDAFTAR
  let cards = document.querySelectorAll(".card.clearfix");

  // 2. VALIDASI: PASTIKAN MINIMAL ADA 1 PENDAFTAR
  if (cards.length === 0) {
    alert("Peringatan: Anda wajib menambahkan minimal satu data pendaftar!");
    return; // Hentikan proses pengiriman form
  }

  let pendaftar = [];

  // 3. JIKA VALIDASI LOLOS, TANGKAP DATANYA
  cards.forEach(card => {
    pendaftar.push({
      nama: card.querySelector(".nama_pendaftar").value,
      nik: card.querySelector(".nik").value,
      kjp: card.querySelector(".kjp").value,
      telepon: card.querySelector(".telepon").value
    });
  });

  const kecVal = document.getElementById("kecamatan").value;
  const kelVal = document.getElementById("kelurahan").value;
  const kepVal = document.getElementById("kepling").value;

  let data = {
    nama: document.getElementById("nama").value,
    nim: document.getElementById("nim").value,
    tanggal: document.getElementById("tanggal").value,
    kecamatan: kecVal,
    kelurahan: kelVal,
    kepling: kepVal,
    pendaftar: pendaftar
  };

  // URL ini sudah menggunakan link aktif Anda
  const scriptURL = "https://script.google.com/macros/s/AKfycbyxEc0QtkcH_UTb5hcddWtn70zAgv9neiq3e5iDQqg_IOsRHmHuyAcgYKthrhJM9ZrJog/exec";

  let btnSubmit = document.querySelector('.submit-btn');
  btnSubmit.innerHTML = "Mengirim...";
  btnSubmit.disabled = true;

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    alert("Data berhasil dikirim!");
    location.reload(); 
  })
  .catch(error => {
    console.error("Error!", error.message);
    alert("Terjadi kesalahan.");
    btnSubmit.innerHTML = "Kirim Form";
    btnSubmit.disabled = false;
  });
});