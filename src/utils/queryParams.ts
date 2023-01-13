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

// функция удаления значений одного параметра
export const deleteQueryParams = (key: string): void => {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  params.delete(key);
  const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};

// функция удаления значения одного параметра
export const deleteOneQueryParam = (key: string, value: string): void => {
  const searchParams = new URLSearchParams(window.location.search);
  const splitParam = searchParams.getAll(key).toString().split('~');
  splitParam.splice(splitParam.indexOf(value), 1);
  const res = splitParam.join('~').toString();
  searchParams.set(key, res);
  const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};

// удаление всех параметров
export const deleteAllQueryParams = (): void => {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  params.forEach((key) => {
    params.delete(key);
  });
  const newRelativePathQuery = `${window.location.pathname}`;
  window.history.pushState(null, '', newRelativePathQuery);
};
