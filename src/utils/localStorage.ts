import { DataToSet } from './localStorage.types';

export const checkDataInLocalStorage = <T>(key: string): T | null => {
  const response: string | null = localStorage.getItem(key);
  if (response) {
    try {
      return JSON.parse(response);
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

export const setDataToLocalStorage = (data: DataToSet, key: string): void => {
  localStorage.removeItem(key);
  localStorage.setItem(key, JSON.stringify(data));
};
