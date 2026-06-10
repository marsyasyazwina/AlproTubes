package controllers

import (
	"backend-absensi/data"
	"backend-absensi/models"
	"backend-absensi/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetTodayStats(c *gin.Context) {
	totalStudents := data.StudentCount

	hadir := 0
	tidakHadir := 0
	izin := 0
	sakit := 0

	for i := 0; i < data.AttendanceCount; i++ {
		if data.Attendances[i].Status == "Hadir" {
			hadir++
		} else if data.Attendances[i].Status == "Tidak Hadir" {
			tidakHadir++
		} else if data.Attendances[i].Status == "Izin" {
			izin++
		} else if data.Attendances[i].Status == "Sakit" {
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

func GetStudentRanking(c *gin.Context) {
	statsArr := make([]models.StudentStatsResponse, data.StudentCount)

	for i := 0; i < data.StudentCount; i++ {
		totalHadir := 0
		totalAtt := 0

		for j := 0; j < data.AttendanceCount; j++ {
			if data.Attendances[j].NIM == data.Students[i].NIM {
				totalAtt++
				if data.Attendances[j].Status == "Hadir" {
					totalHadir++
				}
			}
		}

		statsArr[i] = models.StudentStatsResponse{
			NIM:        data.Students[i].NIM,
			Name:       data.Students[i].Name,
			TotalHadir: totalHadir,
			TotalTidak: totalAtt - totalHadir,
			Persentase: data.Students[i].PersentaseKehadiran,
		}
	}

	sortParam := c.Query("sort")
	ascending := sortParam == "asc"
	statsArr = utils.InsertionSortByPercentage(statsArr, ascending)

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    statsArr,
	})
}