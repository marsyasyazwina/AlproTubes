package controllers

import (
	"backend-absensi/firebase"
	"backend-absensi/models"
	"backend-absensi/utils"
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Get all students dengan sorting
func GetStudents(c *gin.Context) {
	ctx := context.Background()

	docs, err := firebase.Client.Collection("students").Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error fetching students",
		})
		return
	}

	var students []models.Student
	for _, doc := range docs {
		var student models.Student
		doc.DataTo(&student)
		student.NIM = doc.Ref.ID
		students = append(students, student)
	}

	// Apply sorting
	sortParam := c.Query("sort")
	ascending := sortParam != "desc"

	if sortParam == "name" || sortParam == "" {
		students = utils.SelectionSortByName(students, ascending)
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    students,
	})
}

// Get student by NIM
func GetStudentByNIM(c *gin.Context) {
	nim := c.Param("nim")
	ctx := context.Background()

	doc, err := firebase.Client.Collection("students").Doc(nim).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Response{
			Status:  404,
			Message: "Student not found",
		})
		return
	}

	var student models.Student
	doc.DataTo(&student)
	student.NIM = doc.Ref.ID

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    student,
	})
}

// Create student
func CreateStudent(c *gin.Context) {
	var input models.StudentInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Status:  400,
			Message: err.Error(),
		})
		return
	}

	ctx := context.Background()

	// FIX: Ambil NIM dari JSON body (bukan PostForm), fallback ke auto-generate
	nim := input.NIM
	if nim == "" {
		nim = generateNIM()
	}

	student := models.Student{
		NIM:   nim,
		Name:  input.Name,
		Class: input.Class,
		Major: input.Major,
	}

	_, err := firebase.Client.Collection("students").Doc(nim).Set(ctx, student)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error creating student",
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Status:  201,
		Message: "Student created successfully",
		Data:    student,
	})
}

// Update student
func UpdateStudent(c *gin.Context) {
	nim := c.Param("nim")
	var input models.StudentInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Status:  400,
			Message: err.Error(),
		})
		return
	}

	ctx := context.Background()

	student := models.Student{
		NIM:   nim,
		Name:  input.Name,
		Class: input.Class,
		Major: input.Major,
	}

	_, err := firebase.Client.Collection("students").Doc(nim).Set(ctx, student)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error updating student",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Student updated successfully",
		Data:    student,
	})
}

// Delete student
func DeleteStudent(c *gin.Context) {
	nim := c.Param("nim")
	ctx := context.Background()

	_, err := firebase.Client.Collection("students").Doc(nim).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Error deleting student",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Student deleted successfully",
	})
}

func generateNIM() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return fmt.Sprintf("S%08d", r.Intn(100000000))
}
