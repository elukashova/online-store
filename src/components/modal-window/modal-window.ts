import rendered from '../../utils/render/render';
import BaseComponent from '../base-component/base-component';
import './modal-window.styles.css';

export default class ModalWindow extends BaseComponent {
  private nameInput: HTMLElement | null = null;

  private phoneInput: HTMLElement | null = null;

  private addressInput: HTMLElement | null = null;

  private emailInput: HTMLElement | null = null;

  private cardNumberInput: HTMLElement | null = null;

  private cardExpirationInput: HTMLElement | null = null;

  private cardCVVInput: HTMLElement | null = null;

  private confirmBtn: HTMLElement | null = null;

  constructor(private root: HTMLElement) {
    super('div', 'checkout-modal-container');
    this.element.addEventListener('click', this.closeModalCallback);
    this.render();
  }

  private render(): void {
    const modalCheckout: HTMLElement = rendered('div', this.element, 'checkout-modal checkout');
    const personalDataWrapper: HTMLElement = rendered('div', modalCheckout, 'checkout__pers-data_wrapper pers-data');
    rendered('h2', personalDataWrapper, 'pers-data__title', 'Personal details');
    const persInputWrapper: HTMLElement = rendered('div', personalDataWrapper, 'pers-data__input-wrapper');
    this.nameInput = rendered('input', persInputWrapper, 'pers-data__name-input', '', {
      type: 'text',
      placeholder: 'Name',
    });
    this.phoneInput = rendered('input', persInputWrapper, 'pers-data__phone-input', '', {
      type: 'text',
      placeholder: 'Phone number',
    });
    this.addressInput = rendered('input', persInputWrapper, 'pers-data__address-input', '', {
      type: 'text',
      placeholder: 'Delivery address',
    });
    this.emailInput = rendered('input', persInputWrapper, 'pers-data__email-input', '', {
      type: 'email',
      placeholder: 'E-mail',
    });
    const cardDataWrapper: HTMLElement = rendered('div', modalCheckout, 'checkout__card-data_wrapper card-data');
    rendered('h2', cardDataWrapper, 'card-data__title', 'Credit card details');
    const cardInputWrapper: HTMLElement = rendered('div', cardDataWrapper, 'card-data__input-wrapper');
    this.cardNumberInput = rendered('input', cardInputWrapper, 'card-data__number-input', '', {
      type: 'text',
      placeholder: 'Card number',
    });
    const cardDerailsWrapper: HTMLElement = rendered('div', cardInputWrapper, 'card-data__input-details-wrapper');
    this.cardExpirationInput = rendered('input', cardDerailsWrapper, 'card-data__expiration-input', '', {
      type: 'text',
      placeholder: 'MM / YYYY',
    });
    this.cardCVVInput = rendered('input', cardDerailsWrapper, 'card-data__cvv-input', '', {
      type: 'text',
      placeholder: 'CVC',
    });
    this.confirmBtn = rendered('button', modalCheckout, 'checkout__confirm-btn', 'confirm');
  }

  private closeModalCallback = (e: Event): void => {
    e.preventDefault();
    this.root.removeChild(this.element);
  };
}
