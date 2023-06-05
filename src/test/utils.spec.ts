import cardsData from '../assets/json/data';
import findMinAndMax from '../components/filter/utils/find.minmax';

const data = cardsData.products;
const price = 'price';
const count = 'count';

describe('findMinAndMax function', () => {
  test('is defined', () => {
    expect(findMinAndMax).toBeDefined();
  });

  test('return right min and max value for price', () => {
    expect(findMinAndMax(data, price)).toEqual([60, 125]);
    expect(findMinAndMax(data, price)).not.toEqual([2, 140]);
    expect(findMinAndMax(data, price)).not.toEqual([59, 141]);
  });

  test('return right min and max value for count', () => {
    expect(findMinAndMax(data, count)).toEqual([2, 140]);
    expect(findMinAndMax(data, count)).not.toEqual([60, 125]);
    expect(findMinAndMax(data, count)).not.toEqual([1, 141]);
  });
});
