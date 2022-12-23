import './card.styles.css';
import rendered from '../../utils/render/render';
import { CardData } from './card.types';
import BaseComponent from '../base-component/base-component';

export default class CartCard extends BaseComponent {
  public title: string;

  public category: string;

  public size: string;

  public rating: number;

  public images: string[];

  public description: string;

  constructor(data: CardData) {
    super('div', 'cart__items_container cart-items');
    this.title = data.title;
    this.category = data.category;
    this.rating = data.rating;
    this.size = data.size;
    this.images = data.images.slice();
    this.description = data.description;
    this.render();
  }

  public render(): void {
    const cartInfoContainer: HTMLElement = rendered('div', this.element, 'cart-items__info');
    const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
    rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
    rendered('span', totalNumWrapper, 'info-items__number', '2');
    const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
    rendered('img', totalPagesWrapper, 'info-pages__btn-left', '', {
      src: '../../assets/icons/cart-icon__left.svg',
    });
    rendered('span', totalPagesWrapper, 'info-pages__pages-total', '1');
    rendered('img', totalPagesWrapper, 'info-pages__btn-right', '', {
      src: '../../assets/icons/cart-icon__right.svg',
    });
    const firstItem: HTMLElement = rendered('div', this.element, 'cart-items__item cart-item');
    rendered('span', firstItem, 'cart-item__order', '1');
    rendered('img', firstItem, 'cart-item__img', '', {
      src: this.images[0],
    });
    const firstItemDescr: HTMLElement = rendered('div', firstItem, 'cart-item__description');
    rendered('span', firstItemDescr, 'cart-item__description_title', this.title);
    rendered('span', firstItemDescr, 'cart-item__description_category', this.category);
    rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${this.size}`);
    rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${this.rating.toString()}`);
    rendered('p', firstItemDescr, 'cart-item__description_text', this.description);
  }
}
