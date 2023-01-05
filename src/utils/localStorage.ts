import { DataToSet, JsonObj, PosterStorageType } from './localStorage.types';

export const checkProductDataInLocalStorage = (key: string): PosterStorageType[] | null => {
  const response: string | null = localStorage.getItem(key);
  let result: PosterStorageType[] | null = null;
  if (response) {
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.log(e);
    }
  }
  return result;
};

export const checkHeaderDataInLocalStorage = (key: string): JsonObj | null => {
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

export const checkPromoDataInLocalStorage = (key: string): string[] | null => {
  const response: string | null = localStorage.getItem(key);
  let result: string[] | null = null;
  if (response) {
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.log(e);
    }
  }
  return result;
};

export const setDataToLocalStorage = (data: DataToSet, key: string): void => {
  localStorage.removeItem(key);
  localStorage.setItem(key, JSON.stringify(data));
};
