import { HeaderInfo } from '../components/header/header.types';

const storage: Record<string, string> = {};

const mockSetDataToLocalStorage = jest.fn((data: HeaderInfo, key: string): void => {
  delete storage[key];
  storage[key] = JSON.stringify(data);
});

const mockCheckDataInLocalStorage = jest.fn((key: string): HeaderInfo | null => {
  const result: HeaderInfo | null = key in storage ? JSON.parse(storage[key]) : null;
  return result;
});

describe('Local storage', () => {
  test('local storage mock function for setting data', () => {
    const testKey: string = 'header';
    const testInfo: HeaderInfo = {
      cartItems: 3,
      totalPrice: 100,
    };

    expect(mockSetDataToLocalStorage(testInfo, testKey)).toBe(undefined);
    expect(mockCheckDataInLocalStorage(testKey)).toStrictEqual(testInfo);
  });
});
