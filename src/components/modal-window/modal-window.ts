/* eslint-disable max-lines-per-function */
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

  private validInputs: HTMLElement[] = [];

  private inputsAll: HTMLElement[] = [];

  private confirmBtn: HTMLElement | null = null;

  private personalInfoForm: HTMLElement | null = null;

  constructor(private root: HTMLElement) {
    super('div', 'checkout-modal-container');
    this.element.addEventListener('click', this.closeModalCallback);
    this.render();
  }

  private render(): void {
    const modalCheckout: HTMLElement = rendered('div', this.element, 'checkout-modal checkout');
    const personalDataWrapper: HTMLElement = rendered('div', modalCheckout, 'checkout__pers-data_wrapper pers-data');
    this.personalInfoForm = rendered('form', personalDataWrapper, 'pers-data__input-wrapper');
    rendered('h2', this.personalInfoForm, 'pers-data__title person-title', 'Personal details');
    this.nameInput = rendered('input', this.personalInfoForm, 'pers-data__name-input input', '', {
      type: 'text',
      placeholder: 'Name',
      id: 'name',
      name: 'name',
      'data-regex': "([A-Za-zА-Яа-яЁё'-]{3,}\\s[A-Za-zА-Яа-яЁё'-]{3,}\\s?)",
      /* (([A-Za-zА-Яа-яЁё-]{3,}\\s?)*) */
      required: 'required',
    });
    this.phoneInput = rendered('input', this.personalInfoForm, 'pers-data__phone-input input', '', {
      type: 'text',
      placeholder: 'Phone number',
      id: 'phone',
      name: 'phone',
      'data-regex': '^[\\+][0-9]{9,}$',
      required: 'required',
    });
    this.addressInput = rendered('input', this.personalInfoForm, 'pers-data__address-input input', '', {
      type: 'text',
      placeholder: 'Delivery address',
      id: 'address',
      name: 'address',
      'data-regex': '([A-Za-zА-Яа-яЁё]{5,}[,]?\\s[0-9-.A-Za-zА-Яа-яЁё]{5,}[,]?\\s[0-9-.A-Za-zА-Яа-яЁё]{5,}[,]?\\s?)',
      required: 'required',
    });
    this.emailInput = rendered('input', this.personalInfoForm, 'pers-data__email-input input', '', {
      type: 'email',
      placeholder: 'E-mail',
      id: 'email',
      name: 'email',
      'data-regex': "([A-Za-z0-9!#$%&'*\\.+-\\/=?^_`{|}~]{2,})@[A-Za-z0-9-\\._]{2,}\\.[A-Za-z]{2,4}",
      required: 'required',
    });
    rendered('h2', this.personalInfoForm, 'card-data__title card-title', 'Credit card details');
    rendered('img', this.personalInfoForm, 'card-data__number-input-image', '', { src: '' });
    this.cardNumberInput = rendered('input', this.personalInfoForm, 'card-data__number-input input', '', {
      type: 'text',
      placeholder: 'Card number',
      id: 'card',
      name: 'card',
      'data-regex': '^[0-9]{16}$',
      required: 'required',
    });
    const cardDerailsWrapper: HTMLElement = rendered('div', this.personalInfoForm, 'card-data__input-details-wrapper');
    this.cardExpirationInput = rendered('input', cardDerailsWrapper, 'card-data__expiration-input input', '', {
      type: 'text',
      placeholder: 'MM / YY',
      id: 'card',
      name: 'card',
      'max-length': '5',
      'data-regex': '((0[1-9])|(1[0-2]))\\/((2[3-9])|(3[0-9]))',
      required: 'required',
    });
    this.cardExpirationInput.addEventListener('keypress', this.autoSlashForDate);
    this.cardCVVInput = rendered('input', this.personalInfoForm, 'card-data__cvv-input input', '', {
      type: 'text',
      placeholder: 'CVV',
      id: 'cvv',
      name: 'cvv',
      'max-length': '3',
      'data-regex': '^[0-9]{3}$',
      required: 'required',
    });
    this.personalInfoForm.addEventListener('input', this.inputHandler);
    this.inputsAll = [
      this.nameInput,
      this.phoneInput,
      this.addressInput,
      this.emailInput,
      this.cardNumberInput,
      this.cardExpirationInput,
      this.cardCVVInput,
    ];
    this.confirmBtn = rendered('input', modalCheckout, 'checkout__confirm-btn', '', {
      type: 'button',
      value: 'confirm',
      id: 'button',
      name: 'button',
    });

    this.confirmBtn.addEventListener('click', this.buttonHandler);
  }

  // временно отключила
  private closeModalCallback = (e: Event): void => {
    e.preventDefault();
    /* this.root.removeChild(this.element); */
  };

  public inputHandler = (e: Event): void => {
    if (e.target && e.target instanceof HTMLInputElement) {
      if (e.target.hasAttribute('data-regex')) {
        this.checkInput(e.target);
      }
    }
  };

  public checkInput(element: HTMLInputElement): void {
    const inputValue = element.value;
    const inputReg = element.dataset.regex;
    const input = element;
    if (inputReg) {
      const reg = new RegExp(inputReg);
      console.log(inputValue, reg);
      if (reg.test(inputValue)) {
        input.classList.add('valid');
        input.classList.remove('invalid');
        if (!this.validInputs.includes(input)) {
          this.validInputs.push(input);
        }
      } else {
        input.classList.add('invalid');
        input.classList.remove('valid');
        if (this.validInputs.includes(input)) {
          this.validInputs.splice(this.validInputs.indexOf(input));
        }
      }
      console.log(this.validInputs);
    }
  }

  public autoSlashForDate(e: Event): void {
    if (e.target && e.target instanceof HTMLInputElement) {
      const inputValue = e.target.value;
      if (inputValue.length === 2) {
        e.target.value = `${inputValue}/`;
      }
    }
  }

  public buttonHandler(e: Event): void {
    if (this.validInputs.length < this.inputsAll.length) {
      e.preventDefault();
    } else {
      console.log('Переход в мейн');
    }
  }
}
