package controllers

import (
    "backend-absensi/firebase"
    "backend-absensi/models"
    "backend-absensi/utils"
    "context"
    "net/http"

    "cloud.google.com/go/firestore"
    "github.com/gin-gonic/gin"
)

// Get all attendances
func GetAttendances(c *gin.Context) {
    ctx := context.Background()

    docs, err := firebase.Client.Collection("attendances").Documents(ctx).GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error fetching attendances",
        })
        return
    }

    var attendances []models.Attendance
    for _, doc := range docs {
        var attendance models.Attendance
        doc.DataTo(&attendance)
        attendance.ID = doc.Ref.ID
        attendances = append(attendances, attendance)
    }

    c.JSON(http.StatusOK, models.Response{
        Status:  200,
        Message: "Success",
        Data:    attendances,
    })
}

// Get attendance by date (using binary search)
func GetAttendanceByDate(c *gin.Context) {
    date := c.Query("date")
    ctx := context.Background()

    docs, err := firebase.Client.Collection("attendances").Documents(ctx).GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error fetching attendances",
        })
        return
    }

    var attendances []models.Attendance
    for _, doc := range docs {
        var attendance models.Attendance
        doc.DataTo(&attendance)
        attendance.ID = doc.Ref.ID
        attendances = append(attendances, attendance)
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

// Create attendance
func CreateAttendance(c *gin.Context) {
    var input models.AttendanceInput

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, models.Response{
            Status:  400,
            Message: err.Error(),
        })
        return
    }

    ctx := context.Background()
    id := generateAttendanceID()

    attendance := models.Attendance{
        ID:     id,
        NIM:    input.NIM,
        Date:   input.Date,
        Status: input.Status,
    }

    _, err := firebase.Client.Collection("attendances").Doc(id).Set(ctx, attendance)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error creating attendance",
        })
        return
    }

    // Update persentase kehadiran student
    updateSingleStudentPercentage(input.NIM)

    c.JSON(http.StatusCreated, models.Response{
        Status:  201,
        Message: "Attendance created successfully",
        Data:    attendance,
    })
}

// Update attendance
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

    ctx := context.Background()

    doc, err := firebase.Client.Collection("attendances").Doc(id).Get(ctx)
    if err != nil {
        c.JSON(http.StatusNotFound, models.Response{
            Status:  404,
            Message: "Attendance not found",
        })
        return
    }

    var attendance models.Attendance
    doc.DataTo(&attendance)
    attendance.Status = input.Status

    _, err = firebase.Client.Collection("attendances").Doc(id).Set(ctx, attendance)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error updating attendance",
        })
        return
    }

    // Update persentase kehadiran student
    updateSingleStudentPercentage(attendance.NIM)

    c.JSON(http.StatusOK, models.Response{
        Status:  200,
        Message: "Attendance updated successfully",
        Data:    attendance,
    })
}

// Delete attendance
func DeleteAttendance(c *gin.Context) {
    id := c.Param("id")
    ctx := context.Background()

    // Get attendance data first to know the NIM
    doc, err := firebase.Client.Collection("attendances").Doc(id).Get(ctx)
    if err != nil {
        c.JSON(http.StatusNotFound, models.Response{
            Status:  404,
            Message: "Attendance not found",
        })
        return
    }

    var attendance models.Attendance
    doc.DataTo(&attendance)

    _, err = firebase.Client.Collection("attendances").Doc(id).Delete(ctx)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.Response{
            Status:  500,
            Message: "Error deleting attendance",
        })
        return
    }

    // Update persentase kehadiran student
    updateSingleStudentPercentage(attendance.NIM)

    c.JSON(http.StatusOK, models.Response{
        Status:  200,
        Message: "Attendance deleted successfully",
    })
}

// Search attendance by student name (sequential search)
func SearchAttendanceByStudent(c *gin.Context) {
    name := c.Query("name")
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

    var students []models.Student
    for _, doc := range studentDocs {
        var student models.Student
        doc.DataTo(&student)
        student.NIM = doc.Ref.ID
        students = append(students, student)
    }

    // Search students by name
    results := utils.SequentialSearchByName(students, name)

    c.JSON(http.StatusOK, models.Response{
        Status:  200,
        Message: "Success",
        Data:    results,
    })
}

// Helper functions
func generateAttendanceID() string {
    return "A" + randomString(10)
}

func randomString(n int) string {
    const letters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result := ""
    for i := 0; i < n; i++ {
        result += string(letters[i%len(letters)])
    }
    return result
}

// Update single student percentage after attendance change
func updateSingleStudentPercentage(nim string) {
    ctx := context.Background()

    // Get all attendances for this student
    docs, err := firebase.Client.Collection("attendances").Where("nim", "==", nim).Documents(ctx).GetAll()
    if err != nil {
        return
    }

    total := len(docs)
    hadir := 0
    perBulan := make(map[string]struct{ hadir int; total int })

    for _, doc := range docs {
        var attendance models.Attendance
        doc.DataTo(&attendance)
        
        if attendance.Status == "Hadir" {
            hadir++
        }
        
        // Hitung per bulan (ambil tahun-bulan dari tanggal)
        if len(attendance.Date) >= 7 {
            bulan := attendance.Date[:7] // Format: YYYY-MM
            data := perBulan[bulan]
            data.total++
            if attendance.Status == "Hadir" {
                data.hadir++
            }
            perBulan[bulan] = data
        }
    }

    // Hitung persentase total
    persentaseTotal := 0.0
    if total > 0 {
        persentaseTotal = float64(hadir) / float64(total) * 100
    }

    // Hitung persentase per bulan
    persentasePerBulan := make(map[string]float64)
    for bulan, data := range perBulan {
        if data.total > 0 {
            persentasePerBulan[bulan] = float64(data.hadir) / float64(data.total) * 100
        }
    }

    // Update student
    firebase.Client.Collection("students").Doc(nim).Update(ctx, []firestore.Update{
        {
            Path:  "persentaseKehadiran",
            Value: persentaseTotal,
        },
        {
            Path:  "persentasePerBulan",
            Value: persentasePerBulan,
        },
    })
}