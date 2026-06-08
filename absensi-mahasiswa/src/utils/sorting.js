// Selection Sort untuk sorting nama (tanpa break/continue)
export const selectionSortByName = (data, ascending = true) => {
  const arr = [...data];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let targetIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      let condition = false;
      if (ascending) {
        condition = arr[j].name.toLowerCase() < arr[targetIndex].name.toLowerCase();
      } else {
        condition = arr[j].name.toLowerCase() > arr[targetIndex].name.toLowerCase();
      }
      
      if (condition) {
        targetIndex = j;
      }
    }
    
    if (targetIndex !== i) {
      const temp = arr[i];
      arr[i] = arr[targetIndex];
      arr[targetIndex] = temp;
    }
  }
  
  return arr;
};

// Insertion Sort untuk sorting persentase kehadiran (tanpa break/continue)
export const insertionSortByPercentage = (data, ascending = true) => {
  const arr = [...data];
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    const current = arr[i];
    let j = i - 1;
    let shouldShift = true;
    
    while (j >= 0 && shouldShift) {
      let condition = false;
      if (ascending) {
        condition = current.persentase < arr[j].persentase;
      } else {
        condition = current.persentase > arr[j].persentase;
      }
      
      if (condition) {
        arr[j + 1] = arr[j];
        j = j - 1;
      } else {
        shouldShift = false;
      }
    }
    
    arr[j + 1] = current;
  }
  
  return arr;
};