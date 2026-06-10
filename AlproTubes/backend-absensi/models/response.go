package models

type Response struct {
	Status  int         
	Message string      
	Data    interface{} 
}

type StatsResponse struct {
	TotalStudents   int     
	Hadir           int     
	TidakHadir      int     
	Izin            int     
	Sakit           int     
	PersentaseHadir float64 
}

type StudentStatsResponse struct {
	NIM        string  
	Name       string  
	TotalHadir int     
	TotalTidak int     
	Persentase float64 
}
