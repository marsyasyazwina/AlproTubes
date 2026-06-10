package utils

import (
	"backend-absensi/models"
	"sort"
)

// Sequential Search untuk mencari siswa berdasarkan nama (tanpa break/continue)
func SequentialSearchByName(students []models.Student, searchName string) []models.Student {
	var results []models.Student

	if searchName == "" {
		return students
	}

	for i := 0; i < len(students); i++ {
		isMatch := true
		searchLower := toLower(searchName)
		nameLower := toLower(students[i].Name)

		if len(searchLower) > len(nameLower) {
			isMatch = false
		} else {
			for j := 0; j < len(searchLower) && isMatch; j++ {
				if nameLower[j] != searchLower[j] {
					isMatch = false
				}
			}
		}

		if isMatch {
			results = append(results, students[i])
		}
	}

	return results
}

// Binary Search untuk mencari absensi berdasarkan tanggal (data harus terurut)
func BinarySearchByDate(attendances []models.Attendance, searchDate string) *models.Attendance {
	// Sort data terlebih dahulu
	sorted := make([]models.Attendance, len(attendances))
	copy(sorted, attendances)

	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Date < sorted[j].Date
	})

	left := 0
	right := len(sorted) - 1
	var result *models.Attendance = nil
	found := false

	for left <= right && !found {
		mid := (left + right) / 2

		if sorted[mid].Date == searchDate {
			result = &sorted[mid]
			found = true
		} else if sorted[mid].Date < searchDate {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	return result
}

// Helper function to lowercase string
func toLower(s string) string {
	result := ""
	for _, c := range s {
		if c >= 'A' && c <= 'Z' {
			result += string(c + 32)
		} else {
			result += string(c)
		}
	}
	return result
}
