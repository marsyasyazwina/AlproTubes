package main

import (
	"backend-absensi/controllers"
	"backend-absensi/firebase"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Firebase
	firebase.InitFirebase()
	defer firebase.CloseFirebase()

	// Create Gin router
	router := gin.Default()

	// ========== CORS MIDDLEWARE - PERBAIKAN ==========
	router.Use(func(c *gin.Context) {
		// Allow all origins (for development)
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Header("Access-Control-Max-Age", "86400")

		// Handle preflight OPTIONS request
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
	// =================================================

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Student routes
	studentRoutes := router.Group("/api/students")
	{
		studentRoutes.GET("/", controllers.GetStudents)
		studentRoutes.GET("/:nim", controllers.GetStudentByNIM)
		studentRoutes.POST("/", controllers.CreateStudent)
		studentRoutes.PUT("/:nim", controllers.UpdateStudent)
		studentRoutes.DELETE("/:nim", controllers.DeleteStudent)
	}

	// Attendance routes
	attendanceRoutes := router.Group("/api/attendances")
	{
		attendanceRoutes.GET("/", controllers.GetAttendances)
		attendanceRoutes.GET("/date", controllers.GetAttendanceByDate)
		attendanceRoutes.GET("/search", controllers.SearchAttendanceByStudent)
		attendanceRoutes.POST("/", controllers.CreateAttendance)
		attendanceRoutes.PUT("/:id", controllers.UpdateAttendance)
		attendanceRoutes.DELETE("/:id", controllers.DeleteAttendance)
	}

	// Stats routes
	statsRoutes := router.Group("/api/stats")
	{
		statsRoutes.GET("/today", controllers.GetTodayStats)
		statsRoutes.GET("/ranking", controllers.GetStudentRanking)
	}

	// Start server
	log.Println("Server running on port 8080")
	router.Run(":8080")
}
