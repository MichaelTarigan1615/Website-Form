// load kecamatan saat pertama buka
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
  document.querySelectorAll(".card.clearfix").forEach(card => {
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
    alert("Terjadi kesalahan.");
    btnSubmit.innerHTML = "Kirim Form";
    btnSubmit.disabled = false;
  });
});