const fs = require('fs');
const path = require('path');

// Menggunakan nama file CSV yang baru (Bukan .xlsx)
const fileName = 'ALL KEPLING.csv'; 
const csvPath = path.join(__dirname, fileName);
const outputPath = path.join(__dirname, 'dataWilayah.js');

console.log('--------------------------------------------------');
console.log(`🔍 1. Mencari file CSV baru di: \n   ${csvPath}`);

// Cek apakah file CSV benar-benar ada
if (!fs.existsSync(csvPath)) {
  console.log('\n❌ GAGAL: File CSV TIDAK DITEMUKAN!');
  console.log(`   Pastikan nama file benar-benar "${fileName}" (bukan .xlsx) dan ada di dalam folder sosialisasi-app`);
  process.exit(1);
}

try {
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.replace(/\r/g, '').trim().split('\n');
  
  console.log(`✅ 2. File CSV ditemukan. Membaca ${lines.length} baris data...`);
  
  // Cek apakah pemisahnya koma (,) atau titik koma (;)
  const separator = lines[0].includes(';') ? ';' : ',';
  console.log(`⚙️ 3. Pemisah kolom yang terdeteksi: "${separator}"`);

  const dataWilayah = {};

  // Looping mulai dari baris 2 (melewati baris judul kolom)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(separator);
    
    // Berdasarkan file ALL KEPLING.csv:
    // Kolom ke-2 (index 1) = Kecamatan
    // Kolom ke-3 (index 2) = Kelurahan
    // Kolom ke-4 (index 3) = Nomor (Angka Romawi Kepling)
    const kecamatan = cols[1] ? cols[1].trim() : '';
    const kelurahan = cols[2] ? cols[2].trim() : '';
    const nomorKepling = cols[3] ? cols[3].trim() : ''; // Contoh: "I", "II", "III"

    // Abaikan jika ada data yang kosong atau baris judul berulang
    if (!kecamatan || !kelurahan || !nomorKepling || kecamatan.toUpperCase() === 'KECAMATAN') continue;

    // 1. Buat grup Kecamatan jika belum ada
    if (!dataWilayah[kecamatan]) {
      dataWilayah[kecamatan] = {};
    }

    // 2. Buat grup Kelurahan (berupa Array kosong) jika belum ada
    if (!dataWilayah[kecamatan][kelurahan]) {
      dataWilayah[kecamatan][kelurahan] = [];
    }

    // 3. Masukkan nomor Kepling ke dalam kelurahan tersebut
    // Kita gunakan if(!includes) agar tidak ada nomor kepling yang ganda/dobel
    if (!dataWilayah[kecamatan][kelurahan].includes(nomorKepling)) {
        dataWilayah[kecamatan][kelurahan].push(nomorKepling);
    }
  }

  const jumlahKecamatan = Object.keys(dataWilayah).length;
  console.log(`✅ 4. Berhasil menyusun data untuk ${jumlahKecamatan} Kecamatan.`);

  // Menyimpan hasilnya ke file dataWilayah.js
  const outputContent = `const dataWilayah = ${JSON.stringify(dataWilayah, null, 2)};`;
  fs.writeFileSync(outputPath, outputContent);
  
  console.log(`\n🎉 SUKSES! File dataWilayah.js berhasil diperbarui dengan data BARU di:\n   ${outputPath}`);
  console.log('--------------------------------------------------');

} catch (error) {
  console.error('\n❌ Terjadi kesalahan:', error.message);
}