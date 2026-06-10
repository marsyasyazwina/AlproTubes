const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const students = [
  { nim: "S001", name: "Aditya Nugraha", class: "TI-3A", major: "Teknik Informatika" },
  { nim: "S002", name: "Budi Santoso", class: "SI-2B", major: "Sistem Informasi" },
  { nim: "S003", name: "Citra Dewi", class: "DKV-1A", major: "Desain Komunikasi Visual" },
  { nim: "S004", name: "Dian Pratama", class: "TI-3B", major: "Teknik Informatika" },
  { nim: "S005", name: "Eka Saputri", class: "SI-2A", major: "Sistem Informasi" },
  { nim: "S006", name: "Fajar Hidayat", class: "MI-3A", major: "Manajemen Informatika" },
  { nim: "S007", name: "Gita Puspita", class: "TI-2A", major: "Teknik Informatika" },
  { nim: "S008", name: "Hendra Wijaya", class: "SI-3A", major: "Sistem Informasi" },
  { nim: "S009", name: "Indah Permata", class: "DKV-2B", major: "Desain Komunikasi Visual" },
  { nim: "S010", name: "Joko Susilo", class: "TI-1A", major: "Teknik Informatika" },
  { nim: "S011", name: "Kirana Dewi", class: "TI-3A", major: "Teknik Informatika" },
  { nim: "S012", name: "Lukman Hakim", class: "SI-3B", major: "Sistem Informasi" },
  { nim: "S013", name: "Maya Sari", class: "DKV-3A", major: "Desain Komunikasi Visual" },
  { nim: "S014", name: "Nanda Putra", class: "MI-2A", major: "Manajemen Informatika" },
  { nim: "S015", name: "Oktavia", class: "TI-2B", major: "Teknik Informatika" }
];

async function seed() {
  console.log('Menambahkan data mahasiswa ke Firestore...\n');
  
  for (const student of students) {
    try {
      await db.collection('students').doc(student.nim).set(student);
      console.log(`✓ ${student.name} (${student.nim}) berhasil ditambahkan`);
    } catch (error) {
      console.error(`✗ Gagal menambah ${student.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Selesai!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});