import { dataWilayah } from './dataWilayah.js';
window.onload = function() {
  let kec = document.getElementById("kecamatan");
  Object.keys(dataWilayah).forEach(k => {
    kec.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

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

function hapusPendaftar(btn) {
  btn.parentElement.remove();
}

function tambahPendaftar() {
  let container = document.getElementById("pendaftarContainer");
  let div = document.createElement("div");
  div.classList.add("card", "clearfix");

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

document.getElementById("formData").addEventListener("submit", function(e){
  e.preventDefault();

  let pendaftar = [];
  // CARA SUPER AMAN: Ambil langsung semua isi dari dalam wadah pendaftarContainer
  let wadahPendaftar = document.getElementById("pendaftarContainer");
  let pendaftarCards = wadahPendaftar.children;

  for (let i = 0; i < pendaftarCards.length; i++) {
    let card = pendaftarCards[i];
    
    // Ambil nilai dari masing-masing elemen di dalam wadah
    let namaEl = card.querySelector(".nama_pendaftar");
    let nikEl = card.querySelector(".nik");
    let kjpEl = card.querySelector(".kjp");
    let telpEl = card.querySelector(".telepon");

    // Jika semua elemen ditemukan, simpan ke dalam array pendaftar
    if(namaEl && nikEl && kjpEl && telpEl) {
      pendaftar.push({
        nama: namaEl.value,
        nik: "'" + nikEl.value,         // Memaksa NIK jadi teks agar 16 digit tidak rusak
        kjp: "'" + kjpEl.value,         // Memaksa KJP jadi teks
        telepon: "'" + telpEl.value     // Memaksa Telepon jadi teks agar 0 di depan aman
      });
    }
  }

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
    pendaftar: pendaftar // Data pendaftar yang sudah dikumpulkan dimasukkan ke sini
  };

  const scriptURL = "https://script.google.com/macros/s/AKfycbwNKSCZwH-SFePziNbzbizfdsbxCHEorntqklsMtM22HxyOuPdvtVaJyxalybjTGZl6Tg/exec";

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
    alert("Terjadi kesalahan saat mengirim data.");
    btnSubmit.innerHTML = "Kirim Form";
    btnSubmit.disabled = false;
  });
});

// Membuka akses fungsi agar bisa dipanggil oleh inline HTML (onclick / onchange)
window.updateKelurahan = updateKelurahan;
window.updateKepling = updateKepling;
window.hapusPendaftar = hapusPendaftar;
window.tambahPendaftar = tambahPendaftar;