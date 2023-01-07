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

export const getUrl = (): string | null => {
  const currentUrl = window.location.href;
  console.log(currentUrl);
  return currentUrl;
};

// функция удаления query параметров
export const deleteQueryParams = (key: string): void => {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  params.delete(key);
  const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};

// функция удаления одного параметра
export const deleteOneQueryParam = (key: string, value: string): void => {
  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.getAll(key).toString().split('-');
  success.splice(success.indexOf(value), 1);
  const res = success.join('-').toString();
  searchParams.set(key, res);
  const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};
