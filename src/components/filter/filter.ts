import './filter.styles.css';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import findMinAndMaxPrice from './utils/find.minmax.price';
import findMinAndMaxCount from './utils/find.minmax.stock';
import RangeTypes from './enums.filter';

export default class Filter {
  public checkboxes: HTMLElement[] = [];

  constructor(private readonly container: HTMLElement, private readonly name: string) {}

  public renderCheckbox<T>(data: T[], str: string): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str} ${str}`);
    rendered('legend', filterWrapper, `${str}__legend-1`, this.name);
    data.forEach((item, ind) => {
      const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${str}__input-wrapper`);
      const inputElement: HTMLElement = rendered(
        'input',
        inputWrapper,
        `${str}__input-${ind + 1} ${item} ${str}-item`,
        '',
        {
          id: `${item}`,
          type: 'checkbox',
          name: `${str}`,
        },
      );
      rendered('label', inputWrapper, `${str}__label-${ind + 1}`, `${item}`, {
        for: `${str}-${ind + 1}`,
      });
      rendered('span', inputWrapper, `${str}__out-of-${ind + 1}`, ' 1/5');
      this.checkboxes.push(inputElement);
    });
    return filterWrapper;
  }

  public renderInputRange(str: string): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str}`);
    rendered('legend', filterWrapper, `filters__${str}_legend`, this.name);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${str}_wrapper`);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_slider`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_value-wrapper ${str}-value`);
    const [minPrice, maxPrice]: number[] = findMinAndMaxPrice(cardsData.products);
    const [minCount, maxCount]: number[] = findMinAndMaxCount(cardsData.products);
    const maxValue: string = str === 'price' ? `${maxPrice}` : `${maxCount}`;
    const minValue: string = str === 'price' ? `${minPrice}` : `${minCount}`;
    if (str === 'price') {
      rendered('span', valueWrapper, `${str}-value__from`, `$ ${minValue}`, { id: `from-${str}-value` });
      rendered('span', valueWrapper, `${str}-value__to`, `$ ${maxValue}`, { id: `to-${str}-value` });
    } else {
      rendered('span', valueWrapper, `${str}-value__from`, `${minValue}`, { id: `from-${str}-value` });
      rendered('span', valueWrapper, `${str}-value__to`, `${maxValue}`, { id: `to-${str}-value` });
    }

    const lowestInput: HTMLElement = rendered('input', sliderWrapper, `filters__${str}_lowest`, '', {
      id: `from-${str}`,
      type: 'range',
      min: minValue,
      max: maxValue,
      value: minValue,
    });
    const highestInput: HTMLElement = rendered('input', sliderWrapper, `filters__${str}_highest`, '', {
      id: `to-${str}`,
      type: 'range',
      min: minValue,
      max: maxValue,
      value: maxValue,
    });
    this.changeInputRange(lowestInput, highestInput); // вешаем функцию слушатель
    return filterWrapper;
  }

  public changeInputRange(lowestInput: HTMLElement, highestInput: HTMLElement): void {
    lowestInput.addEventListener('input', (e) => {
      if (e.target === document.getElementById('from-price')) {
        this.changeLowInput(lowestInput, highestInput, RangeTypes.PriceFrom);
      }
      if (e.target === document.getElementById('from-stock')) {
        this.changeLowInput(lowestInput, highestInput, RangeTypes.StockFrom);
      }
    });
    highestInput.addEventListener('input', (e) => {
      if (e.target === document.getElementById('to-price')) {
        this.changeHighInput(lowestInput, highestInput, RangeTypes.PriceTo);
      }
      if (e.target === document.getElementById('to-stock')) {
        this.changeHighInput(lowestInput, highestInput, RangeTypes.StockTo);
      }
    });
  }

  public changeLowInput(lowestInput: HTMLElement, highestInput: HTMLElement, id: string): void {
    const low: HTMLElement = lowestInput;
    const high: HTMLElement = highestInput;
    const priceFrom: HTMLElement | null = document.getElementById('from-price-value');
    const countFrom: HTMLElement | null = document.getElementById('from-stock-value');
    if (low && high && low instanceof HTMLInputElement && high instanceof HTMLInputElement) {
      const gap = 1;
      if (+high.value - +low.value <= gap) {
        low.value = (+high.value - gap).toString();
      }

      if (id === RangeTypes.PriceFrom) {
        if (priceFrom) {
          priceFrom.textContent = `$ ${low.value}`;
        }
      }
      if (id === RangeTypes.StockFrom) {
        if (countFrom) {
          countFrom.textContent = `${low.value}`;
        }
      }
      low.setAttribute('value', `${low.value}`);
    }
  }

  public changeHighInput(lowestInput: HTMLElement, highestInput: HTMLElement, id: string): void {
    const low: HTMLElement = lowestInput;
    const high: HTMLElement = highestInput;
    const priceTo: HTMLElement | null = document.getElementById('to-price-value');
    const countTo: HTMLElement | null = document.getElementById('to-stock-value');
    if (low && high && low instanceof HTMLInputElement && high instanceof HTMLInputElement) {
      const gap = 1;
      if (+high.value - +low.value <= gap) {
        high.value = (+low.value + gap).toString();
      }
      if (id === RangeTypes.PriceTo) {
        if (priceTo) {
          priceTo.textContent = `$ ${high.value}`;
        }
      }
      if (id === RangeTypes.StockTo) {
        if (countTo) {
          countTo.textContent = `${high.value}`;
        }
      }
      high.setAttribute('value', `${high.value}`);
    }
  }
}
