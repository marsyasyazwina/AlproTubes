package models

type Student struct {
    NIM                 string             `json:"nim"`
    Name                string             `json:"name"`
    Class               string             `json:"clasSs"`
    Major               string             `json:"major"`
    PersentaseKehadiran float64            `json:"persentaseKehadiran"`
    PersentasePerBulan  map[string]float64 `json:"persentasePerBulan"` 
}

type StudentInput struct {
    Name  string `json:"name" binding:"required"`
    Class string `json:"class" binding:"required"`
    Major string `json:"major" binding:"required"`
}