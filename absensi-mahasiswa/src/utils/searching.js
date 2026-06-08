// Sequential Search untuk mencari mahasiswa berdasarkan nama (tanpa break/continue)
export const sequentialSearchByName = (data, searchName) => {
  const results = [];
  const searchLower = searchName.toLowerCase();
  
  if (searchLower.length === 0) {
    return data;
  }
  
  for (let i = 0; i < data.length; i++) {
    const nameLower = data[i].name.toLowerCase();
    let isMatch = true;
    let j = 0;
    
    while (j < searchLower.length && isMatch) {
      if (j >= nameLower.length || nameLower[j] !== searchLower[j]) {
        isMatch = false;
      }
      j = j + 1;
    }
    
    if (isMatch) {
      results.push(data[i]);
    }
  }
  
  return results;
};

// Binary Search untuk mencari absensi berdasarkan tanggal (data harus terurut)
export const binarySearchByDate = (data, searchDate) => {
  let left = 0;
  let right = data.length - 1;
  let result = null;
  let found = false;
  
  while (left <= right && !found) {
    const mid = Math.floor((left + right) / 2);
    
    if (data[mid].date === searchDate) {
      result = data[mid];
      found = true;
    } else if (data[mid].date < searchDate) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
};

// Sort data sebelum binary search
export const sortAttendanceByDate = (data) => {
  const arr = [...data];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j].date > arr[j + 1].date) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  
  return arr;
};