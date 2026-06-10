package models

// Response adalah wrapper standar untuk semua response API kamu
type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"` // omitempty artinya jika data nil/kosong, field ini tidak akan muncul di JSON
}

// StatsResponse digunakan untuk statistik absensi global/kelas
type StatsResponse struct {
	TotalStudents   int     `json:"total_students"`
	Hadir           int     `json:"hadir"`
	TidakHadir      int     `json:"tidak_hadir"`
	Izin            int     `json:"izin"`
	Sakit           int     `json:"sakit"`
	PersentaseHadir float64 `json:"persentase_hadir"`
}

// StudentStatsResponse digunakan untuk statistik absensi per individu mahasiswa
type StudentStatsResponse struct {
	NIM        string  `json:"nim"`
	Name       string  `json:"name"`
	TotalHadir int     `json:"total_hadir"`
	TotalTidak int     `json:"total_tidak"`
	Persentase float64 `json:"persentase"`
}