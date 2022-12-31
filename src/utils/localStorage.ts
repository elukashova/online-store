import { DataToSet, JsonObj } from './localStorage.types';

export const checkDataInLocalStorage = (key: string): JsonObj | null => {
  const response: string | null = localStorage.getItem(key);
  let result: JsonObj | null = null;
  if (response) {
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.log(e);
    }
  }
  return result;
};

export const setDataToLocalStorage = (data: DataToSet, key?: string): void => {
  if (Array.isArray(data)) {
    localStorage.removeItem('addedPosters');
    const addedItems: JsonObj = {};

    data.forEach((value) => {
      addedItems[`item${value}`] = value;
    });

    localStorage.setItem('addedPosters', JSON.stringify(addedItems));
  } else if (key) {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(data));
  }
};
