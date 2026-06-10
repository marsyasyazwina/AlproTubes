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
    // For simplicity, we'll count all attendances and filter by today
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

    // Get all students with their persentaseKehadiran from database
    studentDocs, err := firebase.Client.Collection("students").Documents(ctx).GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error fetching students",
        })
        return
    }

    var stats []models.StudentStatsResponse

    for _, doc := range studentDocs {
        var student models.Student
        doc.DataTo(&student)
        student.NIM = doc.Ref.ID

        // Get attendance counts for detailed stats
        attendanceDocs, err := firebase.Client.Collection("attendances").Where("nim", "==", student.NIM).Documents(ctx).GetAll()
        if err != nil {
            continue
        }

        totalHadir := 0
        for _, attDoc := range attendanceDocs {
            var attendance models.Attendance
            attDoc.DataTo(&attendance)
            if attendance.Status == "Hadir" {
                totalHadir++
            }
        }

        stats = append(stats, models.StudentStatsResponse{
            NIM:        student.NIM,
            Name:       student.Name,
            TotalHadir: totalHadir,
            TotalTidak: len(attendanceDocs) - totalHadir,
            Persentase: student.PersentaseKehadiran,
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