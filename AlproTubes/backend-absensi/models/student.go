package models

type Student struct {
	NIM                 string            
	Name                string             
	Class               string             
	Major               string            
	PersentaseKehadiran float64            
	PersentasePerBulan  map[string]float64 
}

type StudentInput struct {
	Name  string
	Class string 
	Major string
}