import './filter.styles.css';
import rendered from '../../utils/render';
import cardsData from '../../assets/json/data';
import findMinAndMax from './utils/find.minmax';
import { CardDataInfoPart } from '../card/card.types';
import findCountOfCurrentProducts from '../cards-field/utils/find.current.count';
import { CountForFilter } from '../cards-field/cards-field.types';
import { FilterType, RangeTypes } from './enums.filter';

export default class Filter {
  public checkboxes: HTMLElement[] = [];

  public countFrom: HTMLElement | null = null;

  public countTo: HTMLElement | null = null;

  public lowestInput: HTMLElement | null = null;

  public highestInput: HTMLElement | null = null;

  public allCountsFrom: HTMLElement[] = [];

  public allCountsTo: HTMLElement[] = [];

  public minElement: HTMLElement | null = null;

  public maxElement: HTMLElement | null = null;

  private counts: Record<string, Record<string, number>> = {};

  // eslint-disable-next-line max-len
  constructor(private readonly container: HTMLElement, public updateActiveFilters: (filter: string) => void) {}

  // eslint-disable-next-line max-lines-per-function
  public renderCheckbox(data: string[], filterName: keyof CardDataInfoPart): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${filterName} ${filterName}`);
    rendered('legend', filterWrapper, `${filterName}__legend-1`, filterName);

    // eslint-disable-next-line max-len
    const dataObjects: CountForFilter[] = findCountOfCurrentProducts(cardsData.products, filterName);
    this.counts[filterName] = {};

    dataObjects.forEach(({ key, count }: CountForFilter): void => {
      this.counts[filterName][key] = count;
    });

    data.forEach((filter: string, index: number): void => {
      const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${filterName}__input-wrapper`);
      const checkboxWrapper: HTMLElement = rendered('div', inputWrapper, `${filterName}__checkbox-wrapper`);
      const inputElement: HTMLElement = rendered(
        'input',
        checkboxWrapper,
        `${filterName}__input-${index + 1} ${filter} ${filterName}-item`,
        '',
        {
          id: `${filter}`,
          type: 'checkbox',
          name: `${filterName}`,
        },
      );
      inputElement.addEventListener('change', (): void => this.updateActiveFilters(filter));
      rendered('label', checkboxWrapper, `${filterName}__label-${index + 1}`, `${filter}`, {
        for: `${filter}`,
      });
      const countWrapper: HTMLElement = rendered('div', inputWrapper, `${filterName}__count-wrapper`);
      this.countFrom = rendered('span', countWrapper, `${filterName}__out-from-to-${index + 1}`, '1', {
        id: `${filter}`,
      });
      rendered('span', countWrapper, `${filterName}__slash-${index + 1}`, '/');
      this.countTo = rendered('span', countWrapper, `${filterName}__out-from-to-${index + 1}`, '5');
      this.setInitialCount(filterName, filter);

      this.allCountsFrom.push(this.countFrom);

      this.checkboxes.push(inputElement);
    });
    return filterWrapper;
  }

  public setInitialCount(field: keyof CardDataInfoPart, name: string): void {
    const count = this.counts[field]?.[name] ?? 0;
    if (this.countTo && this.countFrom) {
      this.countTo.textContent = `${count}`;
      this.countFrom.textContent = `${count}`;
      this.allCountsTo.push(this.countTo);
    }
  }

  public renderInputRange(str: string): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str}`);
    rendered('legend', filterWrapper, `filters__${str}_legend`);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${str}_wrapper`);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_slider`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_value-wrapper ${str}-value`);
    const valuePrefix = str === 'price' ? '$ ' : '';
    const [minPrice, maxPrice]: number[] = findMinAndMax(cardsData.products, str);
    const [minCount, maxCount]: number[] = findMinAndMax(cardsData.products, str);
    const maxValue: string = str === 'price' ? `${maxPrice}` : `${maxCount}`;
    const minValue: string = str === 'price' ? `${minPrice}` : `${minCount}`;
    this.minElement = rendered('label', valueWrapper, `${str}-value__from`, `${valuePrefix}${minValue}`, {
      id: `from-${str}-value`,
      for: `from-${str}`,
    });
    this.maxElement = rendered('label', valueWrapper, `${str}-value__to`, `${valuePrefix}${maxValue}`, {
      id: `to-${str}-value`,
      for: `from-${str}`,
    });

    this.lowestInput = rendered('input', sliderWrapper, `filters__${str}_lowest`, '', {
      id: `from-${str}`,
      type: 'range',
      min: minValue,
      max: maxValue,
      value: minValue,
      step: '1',
    });
    this.highestInput = rendered('input', sliderWrapper, `filters__${str}_highest`, '', {
      id: `to-${str}`,
      type: 'range',
      min: minValue,
      max: maxValue,
      value: maxValue,
      step: '1',
    });
    this.addListenerToRange(this.lowestInput, this.highestInput); // вешаем функцию слушатель
    return filterWrapper;
  }

  public addListenerToRange(lowestInput: HTMLElement, highestInput: HTMLElement): void {
    if (lowestInput instanceof HTMLInputElement && highestInput instanceof HTMLInputElement) {
      lowestInput.addEventListener('input', (e: Event): void => {
        if (e.target && e.target instanceof HTMLElement) {
          if (e.target.id === RangeTypes.PriceFrom) {
            this.changeLowInput(lowestInput, highestInput, RangeTypes.PriceFrom);
            this.updateActiveFilters(`${FilterType.Price}, ${lowestInput.value}, ${highestInput.value}`);
          }
          if (e.target.id === RangeTypes.StockFrom) {
            this.changeLowInput(lowestInput, highestInput, RangeTypes.StockFrom);
            this.updateActiveFilters(`${FilterType.Count}, ${lowestInput.value}, ${highestInput.value}`);
          }
        }
      });
      highestInput.addEventListener('input', (e: Event): void => {
        if (e.target && e.target instanceof HTMLElement) {
          if (e.target.id === RangeTypes.PriceTo) {
            this.changeHighInput(lowestInput, highestInput, RangeTypes.PriceTo);
            this.updateActiveFilters(`${FilterType.Price}, ${lowestInput.value}, ${highestInput.value}`);
          }
          if (e.target.id === RangeTypes.StockTo) {
            this.changeHighInput(lowestInput, highestInput, RangeTypes.StockTo);
            this.updateActiveFilters(`${FilterType.Count}, ${lowestInput.value}, ${highestInput.value}`);
          }
        }
      });
    }
  }

  public changeLowInput(lowestInput: HTMLElement, highestInput: HTMLElement, id: string): void {
    const low: HTMLElement = lowestInput;
    const high: HTMLElement = highestInput;
    const priceFrom: HTMLElement | null = document.getElementById('from-price-value');
    const countFrom: HTMLElement | null = document.getElementById('from-stock-value');
    if (low && high && low instanceof HTMLInputElement && high instanceof HTMLInputElement) {
      const gap: number = 1;
      if (+high.value - +low.value < gap) {
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
      const gap: number = 1;
      if (+high.value - +low.value < gap) {
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
