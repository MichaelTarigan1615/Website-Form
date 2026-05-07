let mySpreadsheet; // Variabel global

document.addEventListener("DOMContentLoaded", function() {
  if (typeof dataWilayah === "undefined") {
    alert("⚠️ GAGAL: File dataWilayah.js tidak terbaca! Pasti ada beda huruf besar/kecil.");
    return;
  }

  // =======================================================
  // MENYIAPKAN DATA UNTUK DROPDOWN TABEL
  // =======================================================
  let listKecamatan = Object.keys(dataWilayah);
  let listKelurahan = [];
  let listKepling = [];

  // Mengumpulkan semua Kelurahan dan Kepling ke dalam satu wadah besar
  listKecamatan.forEach(kec => {
    Object.keys(dataWilayah[kec]).forEach(kel => {
      if (!listKelurahan.includes(kel)) listKelurahan.push(kel);
      dataWilayah[kec][kel].forEach(kep => {
        if (!listKepling.includes(kep)) listKepling.push(kep);
      });
    });
  });

  // MEMBUAT 15 BARIS KOSONG (7 Kolom)
  let barisBawaan = [];
  for(let i = 0; i < 15; i++) {
    barisBawaan.push(['', '', '', '', '', '', '']); 
  }

  // MENGHIDUPKAN SPREADSHEET
  mySpreadsheet = jspreadsheet(document.getElementById('spreadsheet'), {
    data: barisBawaan,
    columns: [
      { type: 'text', title: 'NIK 16 Digit (*)', width: 150 },
      { type: 'text', title: 'Nama TK (*)', width: 200 },
      { type: 'text', title: 'No. Telepon (*)', width: 130 },
      { type: 'calendar', title: 'Tgl Daftar (*)', width: 110, options: { format: 'DD/MM/YYYY' } },
      
      // KOLOM 4: DROPDOWN KECAMATAN
      { type: 'dropdown', title: 'Kecamatan (*)', width: 140, source: listKecamatan },
      
      // KOLOM 5: DROPDOWN KELURAHAN (Difilter berdasarkan Kecamatan di baris yg sama)
      { 
        type: 'dropdown', title: 'Kelurahan (*)', width: 140, source: listKelurahan,
        filter: function(instance, cell, c, r, source) {
          let kec = instance.jexcel.getValueFromCoords(4, r); // Ambil nilai Kecamatan
          if (kec && dataWilayah[kec]) {
            let kelurahanValid = Object.keys(dataWilayah[kec]);
            // Hanya tampilkan kelurahan yang cocok
            return source.filter(item => kelurahanValid.includes(item));
          }
          return [];
        }
      },
      
      // KOLOM 6: DROPDOWN KEPLING (Difilter berdasarkan Kec & Kel)
      { 
        type: 'dropdown', title: 'Kepling (*)', width: 100, source: listKepling,
        filter: function(instance, cell, c, r, source) {
          let kec = instance.jexcel.getValueFromCoords(4, r); // Ambil Kecamatan
          let kel = instance.jexcel.getValueFromCoords(5, r); // Ambil Kelurahan
          if (kec && kel && dataWilayah[kec] && dataWilayah[kec][kel]) {
            let keplingValid = dataWilayah[kec][kel];
            // Hanya tampilkan kepling yang cocok
            return source.filter(item => keplingValid.includes(item));
          }
          return [];
        }
      }
    ],
    tableOverflow: true,   
    tableWidth: "100%",    
    tableHeight: "450px",  
    allowInsertColumn: false,
    allowDeleteColumn: false,
    textLineBreak: false,
    
    // PENJAGA 1: LIVE TYPING (Hanya NIK & Telepon)
    oneditionstart: function(instance, cell, x, y) {
      let col = parseInt(x);
      if (col === 0 || col === 2) {
        let inputEditor = cell.querySelector('input') || document.querySelector('.jexcel_editor');
        if (inputEditor) {
          if (col === 0) inputEditor.setAttribute('maxlength', '16');
          if (col === 2) inputEditor.setAttribute('maxlength', '15');
          inputEditor.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
          });
        }
      }
    },

    // PENJAGA 2: ENTER / COPY PASTE / UBAH DROPDOWN
    onchange: function(instance, cell, x, y, value) {
      let col = parseInt(x);
      let row = parseInt(y);
      let valStr = value.toString().trim();

      if (valStr === "") return; 

      // Peringatan NIK Kurang
      if (col === 0) {
        if (valStr.length < 16) {
          alert(`Peringatan (Baris ${row + 1}): NIK Anda kurang! NIK wajib 16 digit.`);
        }
      }

      // RESET OTOMATIS: Jika Kecamatan diubah, kosongkan Kelurahan & Kepling
      if (col === 4) { 
        if (mySpreadsheet.getValueFromCoords(5, row) !== '') {
          mySpreadsheet.setValueFromCoords(5, row, '');
        }
        if (mySpreadsheet.getValueFromCoords(6, row) !== '') {
          mySpreadsheet.setValueFromCoords(6, row, '');
        }
      } 
      // RESET OTOMATIS: Jika Kelurahan diubah, kosongkan Kepling
      else if (col === 5) { 
        if (mySpreadsheet.getValueFromCoords(6, row) !== '') {
          mySpreadsheet.setValueFromCoords(6, row, '');
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

// MENGIRIM FORM
document.getElementById("formData").addEventListener("submit", function(e){
  e.preventDefault();

  let rawData = mySpreadsheet.getData();
  let pendaftar = [];
  let adaError = false;

  rawData.forEach((row, index) => {
    let nik = (row[0] || "").toString().trim();
    let nama_tk = (row[1] || "").toString().trim();
    let telepon = (row[2] || "").toString().trim();
    let tgl_daftar = (row[3] || "").toString().trim(); 
    let kecamatan_row = (row[4] || "").toString().trim(); 
    let kelurahan_row = (row[5] || "").toString().trim(); 
    let kepling_row = (row[6] || "").toString().trim(); 

    if (nik !== "" || nama_tk !== "" || telepon !== "" || tgl_daftar !== "" || kecamatan_row !== "" || kelurahan_row !== "" || kepling_row !== "") {
      
      if (nik === "" || nama_tk === "" || telepon === "" || tgl_daftar === "" || kecamatan_row === "" || kelurahan_row === "" || kepling_row === "") {
        alert(`Gagal Kirim: Data belum lengkap pada Baris ke-${index + 1} di Spreadsheet! (Pilih Wilayah dari Dropdown)`);
        adaError = true;
        return; 
      }

      if (nik.length !== 16) {
        alert(`Gagal Kirim: NIK pada Baris ke-${index + 1} masih kurang dari 16 digit!`);
        adaError = true;
        return;
      }
      
      pendaftar.push({ 
        nik: nik, 
        nama_tk: nama_tk, 
        telepon: telepon,
        tanggal_daftar: tgl_daftar,
        kecamatan: kecamatan_row,
        kelurahan: kelurahan_row,
        kepling: kepling_row 
      });
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
    tanggal: document.getElementById("tanggal").value, // Tgl sosialisasi
    pendaftar: pendaftar 
  };

  // ⚠️ PASTIKAN URL SCRIPT GOOGLE ANDA SUDAH BENAR DI BAWAH INI ⚠️
  const scriptURL = "https://script.google.com/macros/s/AKfycbxXf37AGkNu0TMpcN7bEF3dk3uCGVd5lcdLvuvmXee1tt9mm4YKtkIHf31zqn-lYawuLw/exec"; 

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