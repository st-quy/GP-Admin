export const fromStoredData = (storageData) => {
  try {
    
    if (typeof storageData === 'string' && storageData.startsWith('eyJ')) {
      return storageData;
    }
    return JSON.parse(storageData);
  } catch (error) {
    console.error('Error parsing storage data:', error);
    return storageData;
  }
};

export const toStoredData = (data) => {
  
  if (typeof data === 'string' && data.startsWith('eyJ')) {
    return data;
  }
  return JSON.stringify(data);
};

export const getStorageData = (key) => {
  const storedData = localStorage.getItem(key);
  return storedData ? fromStoredData(storedData) : null;
};

export const setStorageData = (key, data) =>
  localStorage.setItem(key, toStoredData(data));

export const removeStorageData = (key) => localStorage.removeItem(key);
