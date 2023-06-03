import './filter.styles.css';
import rendered from '../../utils/render';
import cardsData from '../../assets/json/data';
import findMinAndMax from './utils/find.minmax';
import { CardDataInfo } from '../card/card.types';
import { RangeFilters, RangeSettings } from './enums.filter';
import Card from '../card/card';
import findCountOfCurrentProducts from '../cards-field/utils/find.current.count';
import { CountForFilter, FilterNames } from '../cards-field/cards-field.types';

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

  public filterName!: keyof CardDataInfo;

  public prefix: string = '';

  constructor(
    private readonly container: HTMLElement,
    public updateActiveFilters: (filter: string) => void,
    filterName: keyof CardDataInfo,
    prefix?: string,
  ) {
    this.filterName = filterName;
    if (prefix) {
      this.prefix = prefix;
    }
  }

  public createCheckbox(data: string[]): HTMLElement {
    const filterWrapper: HTMLElement = rendered(
      'fieldset',
      this.container,
      `filters__${this.filterName} ${this.filterName}`,
    );
    rendered('legend', filterWrapper, `${this.filterName}__legend-1`, this.filterName);

    this.createCheckboxInLoop(data, this.createCheckboxItem.bind(this, filterWrapper));

    return filterWrapper;
  }

  private createCheckboxItem(filterWrapper: HTMLElement, filter: string, index: number): void {
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${this.filterName}__input-wrapper`);
    const checkboxWrapper: HTMLElement = rendered('div', inputWrapper, `${this.filterName}__checkbox-wrapper`);
    const inputElement: HTMLElement = rendered(
      'input',
      checkboxWrapper,
      `${this.filterName}__input-${index + 1} ${filter} ${this.filterName}-item`,
      '',
      {
        id: `${filter}`,
        type: 'checkbox',
        name: `${this.filterName}`,
      },
    );
    inputElement.addEventListener('change', (): void => this.updateActiveFilters(filter));
    rendered('label', checkboxWrapper, `${this.filterName}__label-${index + 1}`, `${filter}`, {
      for: `${filter}`,
    });
    const countWrapper: HTMLElement = rendered('div', inputWrapper, `${this.filterName}__count-wrapper`);
    this.countFrom = rendered('span', countWrapper, `${this.filterName}__out-from-to-${index + 1}`, '0', {
      id: `${filter}`,
    });
    this.allCountsFrom.push(this.countFrom);
    rendered('span', countWrapper, `${this.filterName}__slash-${index + 1}`, '/');
    this.countTo = rendered('span', countWrapper, `${this.filterName}__out-from-to-${index + 1}-to`, '0', {
      id: `${filter}-to`,
    });
    this.allCountsTo.push(this.countTo);
    this.checkboxes.push(inputElement);
  }

  // eslint-disable-next-line max-len
  private createCheckboxInLoop(dataForLoop: string[], renderFunction: (item: string, index: number) => void): void {
    dataForLoop.forEach((item, index) => {
      renderFunction(item, index);
    });
  }

  public setCountsTo(cardsAll: Card[]): void {
    const counts = findCountOfCurrentProducts(cardsAll, this.filterName);
    counts.forEach((count: CountForFilter): void => {
      const countEl = this.allCountsTo.find((elem) => elem.id.replace(/-to$/, '') === count.key);
      if (countEl) {
        countEl.textContent = `${count.count}`;
      }
    });
  }

  public createInputRange(data: keyof CardDataInfo): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${data}`);
    rendered('legend', filterWrapper, `filters__${data}_legend`);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${data}_wrapper`);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${data}_slider`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${data}_value-wrapper ${data}-value`);
    let valuePrefix = '';
    if (data === FilterNames.PRICE) {
      valuePrefix = '$ ';
    }
    const [minValue, maxValue] = findMinAndMax(cardsData.products, data);
    this.minElement = rendered('label', valueWrapper, `${data}-value__from`, `${valuePrefix}${minValue}`, {
      id: `from-${data}-value`,
      for: `from-${data}`,
    });
    this.maxElement = rendered('label', valueWrapper, `${data}-value__to`, `${valuePrefix}${maxValue}`, {
      id: `to-${data}-value`,
      for: `to-${data}`,
    });

    this.lowestInput = rendered('input', sliderWrapper, `filters__${data}_lowest`, '', {
      id: `from-${data}`,
      type: 'range',
      min: `${minValue}`,
      max: `${maxValue}`,
      value: `${minValue}`,
      step: '1',
    });
    this.highestInput = rendered('input', sliderWrapper, `filters__${data}_highest`, '', {
      id: `to-${data}`,
      type: 'range',
      min: `${minValue}`,
      max: `${maxValue}`,
      value: `${maxValue}`,
      step: '1',
    });
    this.addListenerToRange(this.lowestInput, this.highestInput);
    return filterWrapper;
  }

  public addListenerToRange(lowestInput: HTMLElement, highestInput: HTMLElement): void {
    if (lowestInput instanceof HTMLInputElement && highestInput instanceof HTMLInputElement) {
      lowestInput.addEventListener('input', (e: Event): void => {
        if (e.target && e.target instanceof HTMLElement) {
          if (e.target.id === RangeSettings.PriceFrom) {
            this.changeLowInput(lowestInput, highestInput, RangeSettings.PriceFrom);
            this.updateActiveFilters(`${RangeFilters.Price}, ${lowestInput.value}, ${highestInput.value}`);
          }
          if (e.target.id === RangeSettings.StockFrom) {
            this.changeLowInput(lowestInput, highestInput, RangeSettings.StockFrom);
            this.updateActiveFilters(`${RangeFilters.Count}, ${lowestInput.value}, ${highestInput.value}`);
          }
        }
      });
      highestInput.addEventListener('input', (e: Event): void => {
        if (e.target && e.target instanceof HTMLElement) {
          if (e.target.id === RangeSettings.PriceTo) {
            this.changeHighInput(lowestInput, highestInput, RangeSettings.PriceTo);
            this.updateActiveFilters(`${RangeFilters.Price}, ${lowestInput.value}, ${highestInput.value}`);
          }
          if (e.target.id === RangeSettings.StockTo) {
            this.changeHighInput(lowestInput, highestInput, RangeSettings.StockTo);
            this.updateActiveFilters(`${RangeFilters.Count}, ${lowestInput.value}, ${highestInput.value}`);
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

      if (id === RangeSettings.PriceFrom) {
        if (priceFrom) {
          priceFrom.textContent = `$ ${low.value}`;
        }
      }
      if (id === RangeSettings.StockFrom) {
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
      if (id === RangeSettings.PriceTo) {
        if (priceTo) {
          priceTo.textContent = `$ ${high.value}`;
        }
      }
      if (id === RangeSettings.StockTo) {
        if (countTo) {
          countTo.textContent = `${high.value}`;
        }
      }
      high.setAttribute('value', `${high.value}`);
    }
  }
}
