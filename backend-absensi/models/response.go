package models

type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type StatsResponse struct {
	TotalStudents   int     `json:"totalStudents"`
	Hadir           int     `json:"hadir"`
	TidakHadir      int     `json:"tidakHadir"`
	Izin            int     `json:"izin"`
	Sakit           int     `json:"sakit"`
	PersentaseHadir float64 `json:"persentaseHadir"`
}

type StudentStatsResponse struct {
	NIM        string  `json:"nim"`
	Name       string  `json:"name"`
	TotalHadir int     `json:"totalHadir"`
	TotalTidak int     `json:"totalTidak"`
	Persentase float64 `json:"persentase"`
}
