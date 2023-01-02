import { DataToSet, JsonObj, PosterStorageInfoType } from './localStorage.types';

export const checkDataInLocalStorage = (key: string): PosterStorageInfoType[] | null => {
  const response: string | null = localStorage.getItem(key);
  let result: PosterStorageInfoType[] | null = null;
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

export const setDataToLocalStorage = (data: DataToSet, key?: string): void => {
  if (Array.isArray(data)) {
    localStorage.removeItem('addedPosters');

    localStorage.setItem('addedPosters', JSON.stringify(data));
  } else if (key) {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(data));
  }
};
