package models

type Student struct {
	NIM   string `json:"nim"`
	Name  string `json:"name"`
	Class string `json:"class"`
	Major string `json:"major"`
}

type StudentInput struct {
	NIM   string `json:"nim"` // FIX: tambah field NIM (opsional, auto-generate kalau kosong)
	Name  string `json:"name"  binding:"required"`
	Class string `json:"class" binding:"required"`
	Major string `json:"major" binding:"required"`
}
