package controllers

import (
	"backend-absensi/data"
	"backend-absensi/models"
	"backend-absensi/utils"
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAttendances(c *gin.Context) {
	attendances := make([]models.Attendance, data.AttendanceCount)
	for i := 0; i < data.AttendanceCount; i++ {
		attendances[i] = data.Attendances[i]
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    attendances,
	})
}

func GetAttendanceByDate(c *gin.Context) {
	date := c.Query("date")

	attendances := make([]models.Attendance, data.AttendanceCount)
	for i := 0; i < data.AttendanceCount; i++ {
		attendances[i] = data.Attendances[i]
	}

	result := utils.BinarySearchByDate(attendances, date)
	if result == nil {
		c.JSON(http.StatusNotFound, models.Response{
			Status:  404,
			Message: "Attendance not found for this date",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    result,
	})
}

func CreateAttendance(c *gin.Context) {
	var input models.AttendanceInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Status:  400,
			Message: err.Error(),
		})
		return
	}

	if data.AttendanceCount >= len(data.Attendances) {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Attendance array is full",
		})
		return
	}

	id := generateAttendanceID()
	attendance := models.Attendance{
		ID:     id,
		NIM:    input.NIM,
		Date:   input.Date,
		Status: input.Status,
	}

	data.Attendances[data.AttendanceCount] = attendance
	data.AttendanceCount++

	updateStudentPercentage(input.NIM)

	c.JSON(http.StatusCreated, models.Response{
		Status:  201,
		Message: "Attendance created successfully",
		Data:    attendance,
	})
}

func UpdateAttendance(c *gin.Context) {
	id := c.Param("id")
	var input models.UpdateAttendanceInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Status:  400,
			Message: err.Error(),
		})
		return
	}

	for i := 0; i < data.AttendanceCount; i++ {
		if data.Attendances[i].ID == id {
			data.Attendances[i].Status = input.Status
			updateStudentPercentage(data.Attendances[i].NIM)

			c.JSON(http.StatusOK, models.Response{
				Status:  200,
				Message: "Attendance updated successfully",
				Data:    data.Attendances[i],
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, models.Response{
		Status:  404,
		Message: "Attendance not found",
	})
}

func DeleteAttendance(c *gin.Context) {
	id := c.Param("id")

	found := false
	nim := ""
	for i := 0; i < data.AttendanceCount; i++ {
		if data.Attendances[i].ID == id {
			found = true
			nim = data.Attendances[i].NIM
			for j := i; j < data.AttendanceCount-1; j++ {
				data.Attendances[j] = data.Attendances[j+1]
			}
			data.Attendances[data.AttendanceCount-1] = models.Attendance{}
			data.AttendanceCount--
		}
	}

	if !found {
		c.JSON(http.StatusNotFound, models.Response{
			Status:  404,
			Message: "Attendance not found",
		})
		return
	}

	updateStudentPercentage(nim)

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Attendance deleted successfully",
	})
}

func SearchAttendanceByStudent(c *gin.Context) {
	name := c.Query("name")

	students := make([]models.Student, data.StudentCount)
	for i := 0; i < data.StudentCount; i++ {
		students[i] = data.Students[i]
	}

	results := utils.SequentialSearchByName(students, name)

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    results,
	})
}

func generateAttendanceID() string {
	b := make([]byte, 4)
	rand.Read(b)
	return "A" + hex.EncodeToString(b)
}

func updateStudentPercentage(nim string) {
	total := 0
	hadir := 0
	perBulan := make(map[string]struct{ hadir int; total int })

	for i := 0; i < data.AttendanceCount; i++ {
		if data.Attendances[i].NIM == nim {
			total++
			if data.Attendances[i].Status == "Hadir" {
				hadir++
			}
			if len(data.Attendances[i].Date) >= 7 {
				bulan := data.Attendances[i].Date[:7]
				d := perBulan[bulan]
				d.total++
				if data.Attendances[i].Status == "Hadir" {
					d.hadir++
				}
				perBulan[bulan] = d
			}
		}
	}

	persentaseTotal := 0.0
	if total > 0 {
		persentaseTotal = float64(hadir) / float64(total) * 100
	}

	persentasePerBulan := make(map[string]float64)
	for bulan, d := range perBulan {
		if d.total > 0 {
			persentasePerBulan[bulan] = float64(d.hadir) / float64(d.total) * 100
		}
	}

	for i := 0; i < data.StudentCount; i++ {
		if data.Students[i].NIM == nim {
			data.Students[i].PersentaseKehadiran = persentaseTotal
			data.Students[i].PersentasePerBulan = persentasePerBulan
		}
	}
}