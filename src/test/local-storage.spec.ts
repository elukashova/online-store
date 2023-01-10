import { HeaderType } from '../components/header/header.types';

const storage: Record<string, string> = {};

const mockSetDataToLocalStorage = jest.fn((data: HeaderType, key: string): void => {
  delete storage[key];
  storage[key] = JSON.stringify(data);
});

const mockCheckDataInLocalStorage = jest.fn((key: string): HeaderType | null => {
  const result: HeaderType | null = key in storage ? JSON.parse(storage[key]) : null;
  return result;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Local storage', () => {
  test('local storage mock function for setting data', () => {
    const testKey: string = 'header';
    const testInfo: HeaderType = {
      cartItems: 3,
      totalPrice: 100,
    };

    expect(mockSetDataToLocalStorage(testInfo, testKey)).toBe(undefined);
    expect(mockCheckDataInLocalStorage(testKey)).toStrictEqual(testInfo);
  });
});
