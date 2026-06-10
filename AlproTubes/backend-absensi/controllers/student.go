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

func GetStudents(c *gin.Context) {
	// Copy ke slice untuk sorting
	students := make([]models.Student, data.StudentCount)
	for i := 0; i < data.StudentCount; i++ {
		students[i] = data.Students[i]
	}

	sortParam := c.Query("sort")
	ascending := sortParam != "desc"
	students = utils.SelectionSortByName(students, ascending)

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Success",
		Data:    students,
	})
}

func GetStudentByNIM(c *gin.Context) {
	nim := c.Param("nim")

	for i := 0; i < data.StudentCount; i++ {
		if data.Students[i].NIM == nim {
			c.JSON(http.StatusOK, models.Response{
				Status:  200,
				Message: "Success",
				Data:    data.Students[i],
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, models.Response{
		Status:  404,
		Message: "Student not found",
	})
}

func CreateStudent(c *gin.Context) {
	var input models.StudentInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Status:  400,
			Message: err.Error(),
		})
		return
	}

	if data.StudentCount >= len(data.Students) {
		c.JSON(http.StatusInternalServerError, models.Response{
			Status:  500,
			Message: "Student array is full",
		})
		return
	}

	nim := generateNIM()
	student := models.Student{
		NIM:                 nim,
		Name:                input.Name,
		Class:               input.Class,
		Major:               input.Major,
		PersentaseKehadiran: 0,
	}

	data.Students[data.StudentCount] = student
	data.StudentCount++

	c.JSON(http.StatusCreated, models.Response{
		Status:  201,
		Message: "Student created successfully",
		Data:    student,
	})
}

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

	for i := 0; i < data.StudentCount; i++ {
		if data.Students[i].NIM == nim {
			data.Students[i].Name = input.Name
			data.Students[i].Class = input.Class
			data.Students[i].Major = input.Major

			c.JSON(http.StatusOK, models.Response{
				Status:  200,
				Message: "Student updated successfully",
				Data:    data.Students[i],
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, models.Response{
		Status:  404,
		Message: "Student not found",
	})
}

func DeleteStudent(c *gin.Context) {
	nim := c.Param("nim")

	found := false
	for i := 0; i < data.StudentCount; i++ {
		if data.Students[i].NIM == nim {
			found = true
			// Geser semua elemen ke kiri
			for j := i; j < data.StudentCount-1; j++ {
				data.Students[j] = data.Students[j+1]
			}
			data.Students[data.StudentCount-1] = models.Student{}
			data.StudentCount--
		}
	}

	if !found {
		c.JSON(http.StatusNotFound, models.Response{
			Status:  404,
			Message: "Student not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Status:  200,
		Message: "Student deleted successfully",
	})
}

func generateNIM() string {
	b := make([]byte, 4)
	rand.Read(b)
	return "S" + hex.EncodeToString(b)
}