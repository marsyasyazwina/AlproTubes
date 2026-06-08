package controllers

import (
	"backend-absensi/firebase"
	"backend-absensi/models"
	"backend-absensi/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Get today's statistics
func GetTodayStats(c *gin.Context) {
	ctx := context.Background()

	// Get all students
	studentDocs, err := firebase.Client.Collection("students").Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error fetching students",
		})
		return
	}
	totalStudents := len(studentDocs)

	// Get today's attendances
	attendanceDocs, err := firebase.Client.Collection("attendances").Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error fetching attendances",
		})
		return
	}

	hadir := 0
	tidakHadir := 0
	izin := 0
	sakit := 0

	for _, doc := range attendanceDocs {
		var attendance models.Attendance
		doc.DataTo(&attendance)

		if attendance.Status == "Hadir" {
			hadir++
		} else if attendance.Status == "Tidak Hadir" {
			tidakHadir++
		} else if attendance.Status == "Izin" {
			izin++
		} else if attendance.Status == "Sakit" {
			sakit++
		}
	}

	persentaseHadir := 0.0
	if totalStudents > 0 {
		persentaseHadir = float64(hadir) / float64(totalStudents) * 100
	}

	stats := models.StatsResponse{
		TotalStudents:   totalStudents,
		Hadir:           hadir,
		TidakHadir:      tidakHadir,
		Izin:            izin,
		Sakit:           sakit,
		PersentaseHadir: persentaseHadir,
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    stats,
	})
}

// Get student ranking by attendance percentage (with insertion sort)
func GetStudentRanking(c *gin.Context) {
	ctx := context.Background()

	// Get all students
	studentDocs, err := firebase.Client.Collection("students").Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error fetching students",
		})
		return
	}

	// Get all attendances
	attendanceDocs, err := firebase.Client.Collection("attendances").Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error fetching attendances",
		})
		return
	}

	// Count attendance per student
	attendanceCount := make(map[string]int)
	totalCount := make(map[string]int)

	for _, doc := range attendanceDocs {
		var attendance models.Attendance
		doc.DataTo(&attendance)

		totalCount[attendance.NIM]++
		if attendance.Status == "Hadir" {
			attendanceCount[attendance.NIM]++
		}
	}

	var stats []models.StudentStatsResponse

	for _, doc := range studentDocs {
		var student models.Student
		doc.DataTo(&student)
		student.NIM = doc.Ref.ID

		total := totalCount[student.NIM]
		hadir := attendanceCount[student.NIM]
		persentase := 0.0

		if total > 0 {
			persentase = float64(hadir) / float64(total) * 100
		}

		stats = append(stats, models.StudentStatsResponse{
			NIM:        student.NIM,
			Name:       student.Name,
			TotalHadir: hadir,
			TotalTidak: total - hadir,
			Persentase: persentase,
		})
	}

	// Apply sorting
	sortParam := c.Query("sort")
	ascending := sortParam == "asc"

	stats = utils.InsertionSortByPercentage(stats, ascending)

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    stats,
	})
}
