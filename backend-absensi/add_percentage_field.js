const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function addPercentageField() {
  console.log('Menambahkan field persentaseKehadiran (dummy) ke semua mahasiswa...\n');
  
  // Data dummy persentase per mahasiswa
  const dummyPercentages = {
    "S001": { total: 85.5, perBulan: {"2026-01": 80.0, "2026-02": 85.0, "2026-03": 90.0, "2026-04": 85.5} },
    "S002": { total: 70.0, perBulan: {"2026-01": 65.0, "2026-02": 70.0, "2026-03": 72.0, "2026-04": 70.0} },
    "S003": { total: 95.0, perBulan: {"2026-01": 90.0, "2026-02": 95.0, "2026-03": 100.0, "2026-04": 95.0} },
    "S004": { total: 60.5, perBulan: {"2026-01": 55.0, "2026-02": 60.0, "2026-03": 62.0, "2026-04": 60.5} },
    "S005": { total: 78.0, perBulan: {"2026-01": 75.0, "2026-02": 78.0, "2026-03": 80.0, "2026-04": 78.0} },
    "S006": { total: 88.0, perBulan: {"2026-01": 85.0, "2026-02": 88.0, "2026-03": 90.0, "2026-04": 88.0} },
    "S007": { total: 92.0, perBulan: {"2026-01": 90.0, "2026-02": 92.0, "2026-03": 95.0, "2026-04": 92.0} },
    "S008": { total: 45.0, perBulan: {"2026-01": 40.0, "2026-02": 45.0, "2026-03": 48.0, "2026-04": 45.0} },
    "S009": { total: 82.0, perBulan: {"2026-01": 80.0, "2026-02": 82.0, "2026-03": 85.0, "2026-04": 82.0} },
    "S010": { total: 68.0, perBulan: {"2026-01": 65.0, "2026-02": 68.0, "2026-03": 70.0, "2026-04": 68.0} },
    "S011": { total: 75.0, perBulan: {"2026-01": 70.0, "2026-02": 75.0, "2026-03": 78.0, "2026-04": 75.0} },
    "S012": { total: 55.0, perBulan: {"2026-01": 50.0, "2026-02": 55.0, "2026-03": 58.0, "2026-04": 55.0} },
    "S013": { total: 98.0, perBulan: {"2026-01": 95.0, "2026-02": 98.0, "2026-03": 100.0, "2026-04": 98.0} },
    "S014": { total: 65.0, perBulan: {"2026-01": 60.0, "2026-02": 65.0, "2026-03": 68.0, "2026-04": 65.0} },
    "S015": { total: 72.0, perBulan: {"2026-01": 70.0, "2026-02": 72.0, "2026-03": 75.0, "2026-04": 72.0} },
    "S016": { total: 50.0, perBulan: {"2026-01": 45.0, "2026-02": 50.0, "2026-03": 52.0, "2026-04": 50.0} }
  };
  
  try {
    const studentsSnapshot = await db.collection('students').get();
    const students = studentsSnapshot.docs;
    
    if (students.length === 0) {
      console.log('⚠️ Tidak ada data mahasiswa di Firestore.');
      process.exit(0);
    }
    
    console.log(`Ditemukan ${students.length} mahasiswa.\n`);
    let updated = 0;
    
    for (const studentDoc of students) {
      const nim = studentDoc.id;
      const studentData = studentDoc.data();
      const dummy = dummyPercentages[nim] || { total: 0, perBulan: {} };
      
      await db.collection('students').doc(nim).update({
        persentaseKehadiran: dummy.total,
        persentasePerBulan: dummy.perBulan
      }).catch(async () => {
        await db.collection('students').doc(nim).set({
          persentaseKehadiran: dummy.total,
          persentasePerBulan: dummy.perBulan
        }, { merge: true });
      });
      
      console.log(`✓ ${studentData.name || nim} (${nim}):`);
      console.log(`   Total: ${dummy.total}%`);
      console.log(`   Per Bulan: ${JSON.stringify(dummy.perBulan)}`);
      updated++;
    }
    
    console.log(`\n✅ Selesai! ${updated} mahasiswa telah ditambahkan field persentase (dummy).`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addPercentageField();