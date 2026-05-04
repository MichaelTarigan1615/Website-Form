let mySpreadsheet; // Variabel global

// Memuat data saat web dibuka
document.addEventListener("DOMContentLoaded", function() {
  let kec = document.getElementById("kecamatan");

  if (typeof dataWilayah === "undefined") {
    alert("⚠️ GAGAL: File dataWilayah.js tidak terbaca! Pasti ada beda huruf besar/kecil.");
    return;
  }

  Object.keys(dataWilayah).forEach(k => {
    let opt = document.createElement("option");
    opt.value = k;
    opt.text = k;
    kec.appendChild(opt);
  });

  // MEMBUAT 15 BARIS KOSONG
  let barisBawaan = [];
  for(let i = 0; i < 15; i++) {
    barisBawaan.push(['', '', '']); 
  }

  // MENGHIDUPKAN FITUR SPREADSHEET 
  mySpreadsheet = jspreadsheet(document.getElementById('spreadsheet'), {
    data: barisBawaan,
    columns: [
      { type: 'text', title: 'NIK 16 Digit (*)', width: 220, maxlength: 16 },
      { type: 'text', title: 'Nama TK (*)', width: 400 },
      { type: 'text', title: 'No. Telepon (*)', width: 220, maxlength: 15 }
    ],
    tableOverflow: true,   
    tableWidth: "100%",    
    tableHeight: "450px",  
    allowInsertColumn: false,
    allowDeleteColumn: false,
    textLineBreak: false,
    
    // LOGIKA CERDAS: VALIDASI INSTAN SAAT ENTER/PINDAH SEL
    onchange: function(instance, cell, x, y, value) {
      // x == 0 adalah Kolom NIK
      if (x == 0) {
        let nikStr = value.toString().trim();
        
        if (nikStr !== "") {
          // 1. Cek apakah ada huruf
          let isHanyaAngka = /^\d+$/.test(nikStr);
          if (!isHanyaAngka) {
            alert(`Peringatan (Baris ${parseInt(y) + 1}): NIK HARUS BERUPA ANGKA! Anda memasukkan huruf atau simbol.`);
            // Opsional: Kosongkan kembali sel jika salah
            // mySpreadsheet.setValueFromCoords(x, y, ''); 
          } 
          // 2. Cek apakah digitnya kurang dari 16
          else if (nikStr.length < 16) {
            alert(`Peringatan (Baris ${parseInt(y) + 1}): NIK Anda kurang! NIK wajib 16 digit. (Saat ini hanya ${nikStr.length} digit)`);
          }
        }
      } 
      // x == 2 adalah Kolom Telepon
      else if (x == 2) {
        let telpStr = value.toString().trim();
        if (telpStr !== "") {
          let isHanyaAngka = /^\d+$/.test(telpStr);
          if (!isHanyaAngka) {
            alert(`Peringatan (Baris ${parseInt(y) + 1}): Nomor Telepon harus berupa angka!`);
          }
        }
      }
    }
  });
});

// Fungsi untuk tombol tambah baris kustom
function tambahBarisExcel() {
  let inputAngka = document.getElementById("jumlahBaris").value;
  let jumlah = parseInt(inputAngka) || 1;
  mySpreadsheet.insertRow(jumlah); 
}

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

// MENGIRIM FORM
document.getElementById("formData").addEventListener("submit", function(e){
  e.preventDefault();

  let rawData = mySpreadsheet.getData();
  let pendaftar = [];
  let adaError = false;

  // Evaluasi baris per baris sebelum mengirim
  rawData.forEach((row, index) => {
    let nik = (row[0] || "").toString().trim();
    let nama_tk = (row[1] || "").toString().trim();
    let telepon = (row[2] || "").toString().trim();

    if (nik !== "" || nama_tk !== "" || telepon !== "") {
      
      // Validasi 1: Pastikan lengkap
      if (nik === "" || nama_tk === "" || telepon === "") {
        alert(`Gagal Kirim: Data belum lengkap pada Baris ke-${index + 1} di Spreadsheet!`);
        adaError = true;
        return; 
      }

      // Validasi 2: Pastikan Angka Semua (Double Check)
      if (!/^\d+$/.test(nik) || !/^\d+$/.test(telepon)) {
        alert(`Gagal Kirim: Pastikan NIK dan Telepon pada Baris ke-${index + 1} hanya berisi angka!`);
        adaError = true;
        return;
      }

      // Validasi 3: Pastikan Pas 16 Digit
      if (nik.length !== 16) {
        alert(`Gagal Kirim: NIK pada Baris ke-${index + 1} harus tepat 16 digit!`);
        adaError = true;
        return;
      }
      
      // Jika semua aman, masukkan ke keranjang
      pendaftar.push({ nik: nik, nama_tk: nama_tk, telepon: telepon });
    }
  });

  if (adaError) return; 

  if (pendaftar.length === 0) {
    alert("Peringatan: Anda wajib mengisi minimal satu baris data pendaftar!");
    return;
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
    pendaftar: pendaftar
  };

  // ⚠️ ISI DENGAN URL APPS SCRIPT ANDA ⚠️
  const scriptURL = "https://script.google.com/macros/s/AKfycbz4WhOQWVoP1xIrI98RsofVA0UF03BGNHrQjahhLZOrvYdmbk3vWo2bXhCY5so5umZ1Tw/exec"; 

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