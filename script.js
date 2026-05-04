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

  // MEMBUAT 15 BARIS KOSONG DENGAN 4 KOLOM
  let barisBawaan = [];
  for(let i = 0; i < 15; i++) {
    barisBawaan.push(['', '', '', '']); 
  }

  // MENGHIDUPKAN SPREADSHEET (4 KOLOM TERMASUK KALENDER)
  // ... (Kode sebelumnya) ...

  // MENGHIDUPKAN SPREADSHEET (4 KOLOM TERMASUK KALENDER)
  mySpreadsheet = jspreadsheet(document.getElementById('spreadsheet'), {
    data: barisBawaan,
    columns: [
      { type: 'text', title: 'NIK 16 Digit (*)', width: 220 }, // Diperlebar
      { type: 'text', title: 'Nama TK (*)', width: 350 },      // Diperlebar
      { type: 'text', title: 'No. Telepon (*)', width: 200 },  // Diperlebar
      { type: 'calendar', title: 'Tgl Daftar (*)', width: 150, options: { format: 'DD/MM/YYYY' } }
    ],
    tableOverflow: true,   
    tableWidth: "100%",    
    tableHeight: "450px",  
    allowInsertColumn: false,
    allowDeleteColumn: false,
    textLineBreak: false,

// ... (Sisa kode tetap sama) ...
    
    // PENJAGA 1: MENGUNCI KETIKAN SECARA LIVE (TIDAK BISA LEBIH DARI 16)
    oneditionstart: function(instance, cell, x, y) {
      let col = parseInt(x);
      
      // Jika NIK (0) atau Telepon (2)
      if (col === 0 || col === 2) {
        let inputEditor = cell.querySelector('input') || document.querySelector('.jexcel_editor');
        
        if (inputEditor) {
          // Kunci panjang maksimalnya secara langsung!
          if (col === 0) inputEditor.setAttribute('maxlength', '16');
          if (col === 2) inputEditor.setAttribute('maxlength', '15');

          // Blokir ketikan huruf seketika
          inputEditor.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
          });
        }
      }
    },

    // PENJAGA 2: SAAT SELESAI MENGETIK / COPY-PASTE DARI LUAR
    onchange: function(instance, cell, x, y, value) {
      let col = parseInt(x);
      let row = parseInt(y);
      let valStr = value.toString().trim();

      if (valStr === "") return; 

      if (col === 0) {
        // Jika ketikan kurang dari 16 digit saat pindah sel
        if (valStr.length < 16) {
          alert(`Peringatan (Baris ${row + 1}): NIK Anda kurang! NIK wajib 16 digit. (Saat ini hanya ${valStr.length} digit)`);
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
    let tgl_daftar = (row[3] || "").toString().trim(); // Menangkap data kalender

    if (nik !== "" || nama_tk !== "" || telepon !== "" || tgl_daftar !== "") {
      
      if (nik === "" || nama_tk === "" || telepon === "" || tgl_daftar === "") {
        alert(`Gagal Kirim: Data belum lengkap pada Baris ke-${index + 1} di Spreadsheet!`);
        adaError = true;
        return; 
      }

      if (nik.length !== 16) {
        alert(`Gagal Kirim: NIK pada Baris ke-${index + 1} masih kurang dari 16 digit!`);
        adaError = true;
        return;
      }
      
      // Masukkan ke array jika aman
      pendaftar.push({ 
        nik: nik, 
        nama_tk: nama_tk, 
        telepon: telepon,
        tanggal_daftar: tgl_daftar
      });
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
  const scriptURL = "https://script.google.com/macros/s/AKfycbweQ1mnrLcq_Kf5OEPy-bUk5PhA1vMpbO8Z9PIDVMt44teIwRwTqPMYaJfr_SYzPqvn5w/exec"; 

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