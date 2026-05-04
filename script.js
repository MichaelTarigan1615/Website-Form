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
      { type: 'text', title: 'NIK 16 Digit (*)', width: 220 },
      { type: 'text', title: 'Nama TK (*)', width: 400 },
      { type: 'text', title: 'No. Telepon (*)', width: 220 }
    ],
    tableOverflow: true,   
    tableWidth: "100%",    
    tableHeight: "450px",  
    allowInsertColumn: false,
    allowDeleteColumn: false,
    textLineBreak: false,
    
    // LOGIKA CERDAS: MEMOTONG PAKSA LEBIH DARI 16 DIGIT & HAPUS HURUF
    onchange: function(instance, cell, x, y, value) {
      let col = parseInt(x);
      let row = parseInt(y);
      let valStr = value.toString().trim();

      if (valStr === "") return; // Abaikan jika dikosongkan

      // JIKA YANG DIISI ADALAH KOLOM NIK (Kolom ke-0)
      if (col === 0) {
        // Buang paksa semua karakter yang BUKAN angka (huruf/simbol)
        let hanyaAngka = valStr.replace(/[^0-9]/g, ''); 
        
        // 1. Jika pengguna mengetikkan huruf/simbol
        if (valStr !== hanyaAngka) {
          alert(`Peringatan (Baris ${row + 1}): NIK HARUS ANGKA! Huruf/simbol akan dihapus otomatis.`);
          mySpreadsheet.setValueFromCoords(col, row, hanyaAngka);
          return;
        }

        // 2. Jika digit NIK kurang atau lebih dari 16
        if (hanyaAngka.length !== 16) {
          if (hanyaAngka.length > 16) {
            // POTONG PAKSA jadi 16 digit saja
            alert(`Peringatan (Baris ${row + 1}): NIK KEPANJANGAN! NIK dipotong otomatis menjadi 16 digit pertama.`);
            mySpreadsheet.setValueFromCoords(col, row, hanyaAngka.substring(0, 16));
          } else {
            // Beri peringatan jika kurang
            alert(`Peringatan (Baris ${row + 1}): NIK KURANG! NIK wajib 16 digit. (Saat ini: ${hanyaAngka.length} digit)`);
          }
        }
      } 
      // JIKA YANG DIISI ADALAH KOLOM TELEPON (Kolom ke-2)
      else if (col === 2) {
        let hanyaAngka = valStr.replace(/[^0-9]/g, '');
        if (valStr !== hanyaAngka) {
          alert(`Peringatan (Baris ${row + 1}): Nomor Telepon HARUS ANGKA! Huruf/simbol akan dihapus otomatis.`);
          mySpreadsheet.setValueFromCoords(col, row, hanyaAngka);
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

  // Evaluasi kembali sebelum benar-benar terkirim
  rawData.forEach((row, index) => {
    let nik = (row[0] || "").toString().trim();
    let nama_tk = (row[1] || "").toString().trim();
    let telepon = (row[2] || "").toString().trim();

    if (nik !== "" || nama_tk !== "" || telepon !== "") {
      // 1. Cek apakah ada kolom yang bolong
      if (nik === "" || nama_tk === "" || telepon === "") {
        alert(`Gagal Kirim: Data belum lengkap pada Baris ke-${index + 1} di Spreadsheet!`);
        adaError = true;
        return; 
      }

      // 2. Final check NIK (Harus Pas 16 Digit)
      if (nik.length !== 16) {
        alert(`Gagal Kirim: NIK pada Baris ke-${index + 1} masih bermasalah! (Wajib 16 digit)`);
        adaError = true;
        return;
      }
      
      // Masukkan ke array jika aman
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

  // ⚠️ PASTIKAN URL SCRIPT GOOGLE ANDA SUDAH BENAR DI BAWAH INI ⚠️
  const scriptURL = "https://script.google.com/macros/s/AKfycbxRSSxgKzWz7324HZ7QHlKRwU_j51K9iN1cppP-3QpHS-DkjO-uv_6oAUOTIORwGIgoUw/exec"; 

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