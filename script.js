let mySpreadsheet; 
let existingNiksDatabase = []; 

// ⚠️ PASTE URL APPS SCRIPT ANDA DI SINI ⚠️
const scriptURL = "MASUKKAN_URL_BARU_DI_SINI"; 

document.addEventListener("DOMContentLoaded", function() {
  if (typeof dataWilayah === "undefined") {
    alert("⚠️ GAGAL: File dataWilayah.js tidak terbaca!");
    return;
  }

  // Menarik database NIK dari server saat web dibuka
  fetch(scriptURL + "?action=getNiks")
    .then(res => res.json())
    .then(data => {
        existingNiksDatabase = data;
        console.log("Sistem Aktif: " + data.length + " NIK termuat.");
    })
    .catch(err => console.error("Gagal sinkronisasi NIK:", err));

  let barisBawaan = [];
  for(let i = 0; i < 15; i++) {
    barisBawaan.push(['', '', '', '', '']); 
  }

  mySpreadsheet = jspreadsheet(document.getElementById('spreadsheet'), {
    data: barisBawaan,
    columns: [
      { type: 'text', title: 'Wilayah (*)', width: 250 }, 
      { type: 'text', title: 'NIK 16 Digit (*)', width: 150 },
      { type: 'text', title: 'Nama TK (*)', width: 220 },
      { type: 'text', title: 'No. Telepon (*)', width: 140 },
      { type: 'calendar', title: 'Tgl Daftar (*)', width: 110, options: { format: 'DD/MM/YYYY' } }
    ],
    tableOverflow: true,   
    tableWidth: "100%",    
    tableHeight: "450px",  
    allowInsertColumn: false,
    allowDeleteColumn: false,
    textLineBreak: false,
    
    oneditionstart: function(instance, cell, x, y) {
      let col = parseInt(x);
      let inputEditor = cell.querySelector('input') || document.querySelector('.jexcel_editor');
      
      if (inputEditor) {
        if (col === 0 || col === 2) {
          inputEditor.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
          });
        }
        if (col === 1 || col === 3) {
          if (col === 1) inputEditor.setAttribute('maxlength', '16');
          if (col === 3) inputEditor.setAttribute('maxlength', '15');
          inputEditor.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
          });
        }
      }
    },

    onchange: function(instance, cell, x, y, value) {
      let col = parseInt(x);
      let row = parseInt(y);
      let valStr = value.toString().trim().toUpperCase();

      if (valStr === "") return; 

      // 1. LOGIKA VALIDASI WILAYAH YANG SUPER CERDAS
      if (col === 0) {
        let parts = valStr.split('-');
        
        // Cek minimal ada 2 tanda strip (3 bagian)
        if(parts.length < 3) {
          alert(`❌ ERROR Baris ${row + 1}:\nFormat Wilayah salah!\nGunakan tanda strip. Contoh: MEDAN DELI-KOTA BANGUN-I`);
          mySpreadsheet.setValueFromCoords(col, row, ""); 
          return;
        }

        let kec = parts[0].trim();
        let kel = "";
        let kep = "";
        let isValid = false;

        // Jika Kecamatan ada di database, kita tes kombinasi Kelurahan & Kepling-nya
        if (dataWilayah[kec]) {
          // Loop untuk menguji di mana letak pemisah antara Kelurahan dan Kepling
          // Ini sangat berguna jika nama Kelurahan mengandung strip (misal: SIDORAME BARAT-I)
          for (let i = 1; i < parts.length - 1; i++) {
            let testKel = parts.slice(1, i + 1).join('-').trim();
            let testKep = parts.slice(i + 1).join('-').trim();

            // Jika kombinasi ini cocok dengan dataWilayah.js
            if (dataWilayah[kec][testKel] && dataWilayah[kec][testKel].includes(testKep)) {
              kel = testKel;
              kep = testKep;
              isValid = true;
              break; // Hentikan pencarian jika sudah ketemu yang pas
            }
          }
        }

        // Keputusan akhir validasi
        if (!isValid) {
          alert(`❌ ERROR Baris ${row + 1}:\nWilayah "${valStr}" tidak ditemukan di database! Periksa kembali ejaannya.`);
          mySpreadsheet.setValueFromCoords(col, row, "");
        } else {
          // Rapatkan kembali dengan standar yang bersih
          let wilayahRapi = `${kec}-${kel}-${kep}`;
          if(valStr !== wilayahRapi) mySpreadsheet.setValueFromCoords(col, row, wilayahRapi);
        }
      }

      // 2. VALIDASI NIK & PENGOSONGAN BARIS TOTAL
      if (col === 1) {
        if (valStr.length < 16) {
          alert(`⚠️ Peringatan (Baris ${row + 1}): NIK kurang dari 16 digit!`);
        } else {
          let isDuplicate = false;

          if (existingNiksDatabase.includes(valStr)) {
            alert(`🚨 DITOLAK (Baris ${row + 1}):\nNIK ${valStr} SUDAH TERDAFTAR DI SPREADSHEET!`);
            isDuplicate = true;
          }

          let allData = mySpreadsheet.getData();
          for(let i=0; i<allData.length; i++) {
              if(i !== row && allData[i][1] == valStr) {
                  alert(`🚨 DITOLAK (Baris ${row + 1}):\nNIK ${valStr} GANDA dengan Baris ${i+1}!`);
                  isDuplicate = true;
                  break;
              }
          }

          if (isDuplicate) {
            setTimeout(() => {
              mySpreadsheet.setRowData(row, ['', '', '', '', '']);
            }, 100); 
          }
        }
      }
    }
  });
});

function tambahBarisExcel() {
  let inputAngka = document.getElementById("jumlahBaris").value;
  let jumlah = parseInt(inputAngka) || 1;
  mySpreadsheet.insertRow(jumlah); 
}

document.getElementById("formData").addEventListener("submit", function(e){
  e.preventDefault();

  let rawData = mySpreadsheet.getData();
  let pendaftar = [];
  let adaError = false;

  rawData.forEach((row, index) => {
    let wilayah = (row[0] || "").toString().trim(); 
    let nik = (row[1] || "").toString().trim();
    let nama_tk = (row[2] || "").toString().trim();
    let telepon = (row[3] || "").toString().trim();
    let tgl_daftar = (row[4] || "").toString().trim(); 

    if (wilayah !== "" || nik !== "" || nama_tk !== "" || telepon !== "" || tgl_daftar !== "") {
      if (wilayah === "" || nik === "" || nama_tk === "" || telepon === "" || tgl_daftar === "") {
        alert(`Gagal Kirim: Data tidak lengkap pada Baris ke-${index + 1}!`);
        adaError = true;
        return; 
      }
      if (nik.length !== 16) {
        alert(`Gagal Kirim: NIK pada Baris ke-${index + 1} masih kurang dari 16 digit!`);
        adaError = true;
        return;
      }
      pendaftar.push({ wilayah, nik, nama_tk, telepon, tanggal_daftar: tgl_daftar });
    }
  });

  if (adaError) return; 
  if (pendaftar.length === 0) {
    alert("Peringatan: Anda wajib mengisi minimal satu baris data pendaftar!");
    return;
  }

  let data = {
    nama: document.getElementById("nama").value,
    nim: document.getElementById("nim").value,
    pendaftar: pendaftar 
  };

  let btnSubmit = document.querySelector('.submit-btn');
  btnSubmit.innerHTML = "Memeriksa Data...";
  btnSubmit.disabled = true;

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(res => {
    if(res.status === 'success') {
       alert(res.message); 
       location.reload(); 
    } else {
       alert("Terjadi kesalahan: " + res.message);
       btnSubmit.innerHTML = "Kirim Form";
       btnSubmit.disabled = false;
    }
  })
  .catch(error => {
    console.error("Error!", error);
    alert("Koneksi gagal.");
    btnSubmit.innerHTML = "Kirim Form";
    btnSubmit.disabled = false;
  });
});