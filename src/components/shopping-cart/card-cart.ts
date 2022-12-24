import rendered from '../../utils/render/render';
import { CardDataType } from '../card/card.types';
import BaseComponent from '../base-component/base-component';
import Header from '../header/header';

export default class CartCard extends BaseComponent {
  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  constructor(private data: CardDataType, private itemsQuantity: number, private header: Header) {
    super('div', 'cart-items__item cart-item');
    this.title = data.title;
    this.category = data.category;
    this.rating = data.rating;
    this.size = data.size;
    this.images = data.images.slice();
    this.description = data.description;
    this.render();
  }

  public render(): void {
    rendered('span', this.element, 'cart-item__order', `${this.itemsQuantity}`);
    rendered('img', this.element, 'cart-item__img', '', {
      src: this.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', this.element, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', this.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', this.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${this.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${this.rating.toString()}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', this.description);
  }
}
