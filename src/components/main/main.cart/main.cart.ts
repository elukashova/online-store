import './main.cart.styles.css';
import Page from '../page-component';
import rendered from '../../../utils/render/render';
import Cart from '../../shopping-cart/shopping-cart';
// import cardsData from '../../../assets/json/data';
// import { CardData } from '../../card/card.types';
import Header from '../../header/header';
// import { checkDataInLocalStorage } from '../../../utils/localStorage';
// import { JsonObj } from '../../../utils/localStorage.types';

export default class MainCart extends Page {
  // private readonly storageInfo: JsonObj | null = checkDataInLocalStorage('addedItems');

  // private readonly data: CardData;

  private readonly cart: Cart = new Cart(this.header);

  constructor(id: string, public readonly header: Header) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    container.append(this.cart.element);
  }
}
