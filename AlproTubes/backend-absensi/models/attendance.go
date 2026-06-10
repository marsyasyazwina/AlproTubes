package models

type Attendance struct {
	ID     string 
	NIM    string 
	Date   string 
	Status string 
}

type AttendanceInput struct {
	NIM    string 
	Date   string 
	Status string 
}

type UpdateAttendanceInput struct {
	Status string 
}
