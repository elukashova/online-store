// функция для сохранения query параметров
export const setQueryParams = (key: string, value: string): void => {
  const searchParams: URLSearchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};

// функция для чтения query параметров
export const getQueryParams = (key: string): string | null => {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  const value: string | null = params.get(key);
  return value;
};
