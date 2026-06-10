package data

import (
	"backend-absensi/models"
)

var Students [50]models.Student
var StudentCount = 15

var Attendances [500]models.Attendance
var AttendanceCount = 15

func init() {
	Students[0] = models.Student{NIM: "S001", Name: "Aditya Nugraha", Class: "TI-3A", Major: "Teknik Informatika", PersentaseKehadiran: 80.0, PersentasePerBulan: map[string]float64{"2026-06": 80.0}}
	Students[1] = models.Student{NIM: "S002", Name: "Budi Santoso", Class: "TI-3A", Major: "Teknik Informatika", PersentaseKehadiran: 60.0, PersentasePerBulan: map[string]float64{"2026-06": 60.0}}
	Students[2] = models.Student{NIM: "S003", Name: "Citra Dewi", Class: "TI-3B", Major: "Teknik Informatika", PersentaseKehadiran: 100.0, PersentasePerBulan: map[string]float64{"2026-06": 100.0}}
	Students[3] = models.Student{NIM: "S004", Name: "Dian Pratama", Class: "TI-3B", Major: "Teknik Informatika", PersentaseKehadiran: 40.0, PersentasePerBulan: map[string]float64{"2026-06": 40.0}}
	Students[4] = models.Student{NIM: "S005", Name: "Eka Putri", Class: "SI-2A", Major: "Sistem Informasi", PersentaseKehadiran: 100.0, PersentasePerBulan: map[string]float64{"2026-06": 100.0}}
	Students[5] = models.Student{NIM: "S006", Name: "Fajar Hidayat", Class: "SI-2A", Major: "Sistem Informasi", PersentaseKehadiran: 60.0, PersentasePerBulan: map[string]float64{"2026-06": 60.0}}
	Students[6] = models.Student{NIM: "S007", Name: "Gita Rahayu", Class: "SI-2B", Major: "Sistem Informasi", PersentaseKehadiran: 80.0, PersentasePerBulan: map[string]float64{"2026-06": 80.0}}
	Students[7] = models.Student{NIM: "S008", Name: "Hendra Wijaya", Class: "SI-2B", Major: "Sistem Informasi", PersentaseKehadiran: 20.0, PersentasePerBulan: map[string]float64{"2026-06": 20.0}}
	Students[8] = models.Student{NIM: "S009", Name: "Indah Sari", Class: "TI-3A", Major: "Teknik Informatika", PersentaseKehadiran: 100.0, PersentasePerBulan: map[string]float64{"2026-06": 100.0}}
	Students[9] = models.Student{NIM: "S010", Name: "Joko Susilo", Class: "TI-3A", Major: "Teknik Informatika", PersentaseKehadiran: 60.0, PersentasePerBulan: map[string]float64{"2026-06": 60.0}}
	Students[10] = models.Student{NIM: "S011", Name: "Kartika Sari", Class: "TI-3B", Major: "Teknik Informatika", PersentaseKehadiran: 80.0, PersentasePerBulan: map[string]float64{"2026-06": 80.0}}
	Students[11] = models.Student{NIM: "S012", Name: "Lutfi Anwar", Class: "SI-2A", Major: "Sistem Informasi", PersentaseKehadiran: 40.0, PersentasePerBulan: map[string]float64{"2026-06": 40.0}}
	Students[12] = models.Student{NIM: "S013", Name: "Maya Anggraini", Class: "SI-2A", Major: "Sistem Informasi", PersentaseKehadiran: 100.0, PersentasePerBulan: map[string]float64{"2026-06": 100.0}}
	Students[13] = models.Student{NIM: "S014", Name: "Nanda Kurniawan", Class: "SI-2B", Major: "Sistem Informasi", PersentaseKehadiran: 60.0, PersentasePerBulan: map[string]float64{"2026-06": 60.0}}
	Students[14] = models.Student{NIM: "S015", Name: "Omar Fauzi", Class: "SI-2B", Major: "Sistem Informasi", PersentaseKehadiran: 80.0, PersentasePerBulan: map[string]float64{"2026-06": 80.0}}

	Attendances[0] = models.Attendance{ID: "A001", NIM: "S001", Date: "2026-06-02", Status: "Hadir"}
	Attendances[1] = models.Attendance{ID: "A002", NIM: "S002", Date: "2026-06-03", Status: "Tidak Hadir"}
	Attendances[2] = models.Attendance{ID: "A003", NIM: "S003", Date: "2026-06-03", Status: "Hadir"}
	Attendances[3] = models.Attendance{ID: "A004", NIM: "S004", Date: "2026-06-04", Status: "Izin"}
	Attendances[4] = models.Attendance{ID: "A005", NIM: "S005", Date: "2026-06-04", Status: "Hadir"}
	Attendances[5] = models.Attendance{ID: "A006", NIM: "S006", Date: "2026-06-05", Status: "Sakit"}
	Attendances[6] = models.Attendance{ID: "A007", NIM: "S007", Date: "2026-06-05", Status: "Hadir"}
	Attendances[7] = models.Attendance{ID: "A008", NIM: "S008", Date: "2026-06-06", Status: "Tidak Hadir"}
	Attendances[8] = models.Attendance{ID: "A009", NIM: "S009", Date: "2026-06-06", Status: "Hadir"}
	Attendances[9] = models.Attendance{ID: "A010", NIM: "S010", Date: "2026-06-07", Status: "Hadir"}
	Attendances[10] = models.Attendance{ID: "A011", NIM: "S011", Date: "2026-06-07", Status: "Hadir"}
	Attendances[11] = models.Attendance{ID: "A012", NIM: "S012", Date: "2026-06-09", Status: "Izin"}
	Attendances[12] = models.Attendance{ID: "A013", NIM: "S013", Date: "2026-06-09", Status: "Hadir"}
	Attendances[13] = models.Attendance{ID: "A014", NIM: "S014", Date: "2026-06-10", Status: "Hadir"}
	Attendances[14] = models.Attendance{ID: "A015", NIM: "S015", Date: "2026-06-10", Status: "Hadir"}
}
