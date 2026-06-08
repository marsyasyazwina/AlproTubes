package models

type Attendance struct {
	ID     string `json:"id"`
	NIM    string `json:"nim"`
	Date   string `json:"date"`
	Status string `json:"status"`
}

type AttendanceInput struct {
	NIM    string `json:"nim" binding:"required"`
	Date   string `json:"date" binding:"required"`
	Status string `json:"status" binding:"required"`
}

type UpdateAttendanceInput struct {
	Status string `json:"status" binding:"required"`
}
