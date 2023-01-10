/* eslint-disable max-lines-per-function */
import rendered from '../../utils/render';
import BaseComponent from '../base-component/base-component';
import { Observer } from '../card/card.types';
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

  private labelsAll: HTMLElement[] = [];

  private confirmBtn: HTMLElement | null = null;

  private confirmBtnText: HTMLElement | null = null;

  private personalInfoForm: HTMLElement | null = null;

  private cardNumberLogo: HTMLElement | null = null;

  private observers: Observer[] = [];

  constructor(private root: HTMLElement) {
    super('div', 'checkout-modal-container');
    this.element.addEventListener('click', this.closeModalCallback);
    this.render();
  }

  private render(): void {
    const modalCheckout: HTMLElement = rendered('div', this.element, 'checkout-modal checkout');
    const personalDataWrapper: HTMLElement = rendered('div', modalCheckout, 'checkout__pers-data_wrapper pers-data');
    this.personalInfoForm = rendered('form', personalDataWrapper, 'pers-data__input-wrapper');
    rendered('h2', this.personalInfoForm, 'pers-data__title title', 'Personal details');
    this.nameInput = rendered('input', this.personalInfoForm, 'pers-data__name-input input', '', {
      type: 'text',
      placeholder: 'Name',
      id: 'name',
      name: 'name',
      'data-regex': "([A-Za-zА-Яа-яЁё'-]{3,}\\s[A-Za-zА-Яа-яЁё'-]{3,}\\s?)",
      required: 'required',
    });
    const nameLabel = rendered(
      'label',
      this.personalInfoForm,
      'pers-data__name-label label hidden',
      'First and last name must contain at least two words, each at least 3 letters long',
      { for: 'name' },
    );
    this.phoneInput = rendered('input', this.personalInfoForm, 'pers-data__phone-input input', '', {
      type: 'text',
      placeholder: 'Phone number',
      id: 'phone',
      name: 'phone',
      'data-regex': '^[\\+][0-9]{9,}$',
      required: 'required',
    });
    const phoneLabel = rendered(
      'label',
      this.personalInfoForm,
      'pers-data__phone-label label hidden',
      'Phone number must start with "+", contain only digits and be at least 9 digits',
      { for: 'phone' },
    );
    this.addressInput = rendered('input', this.personalInfoForm, 'pers-data__address-input input', '', {
      type: 'text',
      placeholder: 'Delivery address',
      id: 'address',
      name: 'address',
      'data-regex': '([A-Za-zА-Яа-яЁё]{5,}[,]?\\s[-.A-Za-zА-Яа-яЁё]{5,}[,]?\\s[-.A-Za-zА-Яа-яЁё]{5,}[,]?\\s?)',
      required: 'required',
    });
    const addressLabel = rendered(
      'label',
      this.personalInfoForm,
      'pers-data__address-label label hidden',
      'Address must contain at least three words, each at least 5 letters long',
      { for: 'address' },
    );
    this.emailInput = rendered('input', this.personalInfoForm, 'pers-data__email-input input', '', {
      type: 'email',
      placeholder: 'E-mail',
      id: 'email',
      name: 'email',
      'data-regex':
        "^(?!\\.)(?!.*\\.$)(?!.*\\.\\.)([A-Za-z0-9!#$%&'*\\.\\.+-\\/=?^_`{|}~]{2,})@[A-Za-z0-9-\\._]{2,}\\.[A-Za-z]{2,4}$",
      required: 'required',
    });
    const emailLabel = rendered(
      'label',
      this.personalInfoForm,
      'pers-data__email-label label hidden',
      'Email in the format example@gmail.com',
      {
        for: 'email',
      },
    );
    rendered('h2', this.personalInfoForm, 'card-data__title title', 'Credit card details');
    const cardNumberWrapper: HTMLElement = rendered('div', this.personalInfoForm, 'card-data__number-input-wrapper');
    const logoWrapper: HTMLElement = rendered('div', cardNumberWrapper, 'card-data__number-logo-wrapper');
    this.cardNumberLogo = rendered('img', logoWrapper, 'card-data__number-input-image', '', {
      src: '../../../assets/icons/payment.png',
      alt: 'type of payment system',
    });
    const cardWrapper: HTMLElement = rendered('div', cardNumberWrapper, 'card-data__card-wrapper');
    this.cardNumberInput = rendered('input', cardWrapper, 'card-data__number-input input', '', {
      type: 'number',
      oninput: 'this.value = this.value.slice(0,this.maxLength)',
      placeholder: 'Card number',
      id: 'card',
      name: 'card',
      'data-regex': '^[0-9]{16}$',
      required: 'required',
      maxlength: '16',
    });
    const numberLabel = rendered(
      'label',
      cardWrapper,
      'pers-data__number-label label hidden',
      'Card number must be exactly 16 digits long',
      {
        for: 'card',
      },
    );
    const dataAndCvvWrapper: HTMLElement = rendered('div', this.personalInfoForm, 'card-data__data-cvv-wrapper');
    const dataWrapper: HTMLElement = rendered('div', dataAndCvvWrapper, 'card-data__data-wrapper');
    const cvvWrapper: HTMLElement = rendered('div', dataAndCvvWrapper, 'card-data__cvv-wrapper');
    this.cardExpirationInput = rendered('input', dataWrapper, 'card-data__expiration-input input', '', {
      type: 'text',
      placeholder: 'MM / YY',
      id: 'expiration',
      name: 'expiration',
      'data-regex': '((0[1-9])|(1[0-2]))\\/((2[3-9])|(3[0-9])|(4[0-9])|(5[0-9])|(6[0-9])|(7[0-9])|(8[0-9])|(9[0-9]))',
      required: 'required',
      maxlength: '5',
    });
    this.cardExpirationInput.addEventListener('keydown', this.autoSlashForDate);
    this.cardExpirationInput.addEventListener('keyup', this.autoSlashForDate);
    this.cardExpirationInput.addEventListener('keydown', this.addOnlyNumbers);
    /* this.cardExpirationInput.addEventListener('keyup', this.addOnlyNumbers); */
    const expirationLabel = rendered(
      'label',
      dataWrapper,
      'pers-data__expiration-label label hidden',
      'Only 12 months, year from 23. For example, 12/25.',
      {
        for: 'expiration',
      },
    );
    this.cardCVVInput = rendered('input', cvvWrapper, 'card-data__cvv-input input', '', {
      type: 'number',
      oninput: 'this.value = this.value.slice(0,this.maxLength)',
      placeholder: 'CVV',
      id: 'cvv',
      name: 'cvv',
      'max-length': '3',
      'data-regex': '^[0-9]{3}$',
      required: 'required',
      maxlength: '3',
    });
    const cvvLabel = rendered('label', cvvWrapper, 'pers-data__cvv-label label hidden', '3 digits must be entered', {
      for: 'cvv',
    });
    // eslint-disable-next-line max-len
    this.labelsAll = [cvvLabel, expirationLabel, numberLabel, nameLabel, phoneLabel, addressLabel, emailLabel];

    this.inputsAll = [
      this.nameInput,
      this.phoneInput,
      this.addressInput,
      this.emailInput,
      this.cardNumberInput,
      this.cardExpirationInput,
      this.cardCVVInput,
    ];
    const confirmBtnWrapper: HTMLElement = rendered('div', modalCheckout, 'checkout__confirm-btn-wrapper');
    this.confirmBtn = rendered('input', confirmBtnWrapper, 'checkout__confirm-btn', '', {
      type: 'button',
      value: 'confirm',
      id: 'button',
      name: 'button',
      'data-valid': 'invalid',
    });
    this.confirmBtnText = rendered(
      'label',
      confirmBtnWrapper,
      'checkout__confirm-btn-text hidden',
      'Please make sure all fields are filled in correctly',
      {
        for: 'button',
      },
    );

    // слушатели
    this.personalInfoForm.addEventListener('input', this.inputHandler);
    this.cardNumberInput.addEventListener('input', (e) => {
      if (this.cardNumberLogo) {
        this.changeLogoOfPaymentSystem(e);
      }
    });
    this.confirmBtn.addEventListener('click', (e) => {
      if (this.confirmBtnText) {
        this.buttonHandler(e);
      }
    });
  }

  private closeModalCallback = (e: Event): void => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      this.root.removeChild(this.element);
    }
  };

  public inputHandler = (e: Event): void => {
    if (e.target && e.target instanceof HTMLInputElement) {
      if (e.target.hasAttribute('data-regex')) {
        this.addClasses(e.target);
      }
    }
  };

  public addClasses(element: HTMLInputElement): void {
    const inputValue = element.value;
    const inputReg = element.dataset.regex;
    const input = element;
    if (inputReg) {
      const reg = new RegExp(inputReg);
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
          this.validInputs.splice(this.validInputs.indexOf(input), 1);
        }
      }
    }
    this.checkAllIsValid(this.validInputs, this.inputsAll);
  }

  public autoSlashForDate(e: KeyboardEvent): void {
    if (e.target && e.target instanceof HTMLInputElement) {
      const inputValue = e.target.value;
      const { key } = e;
      if (inputValue.length === 2 && key !== 'Backspace') {
        e.target.value = `${inputValue}/`;
      }
    }
  }

  public addOnlyNumbers(e: KeyboardEvent): void {
    if (e.key.length === 1 && /\D/.test(e.key)) {
      e.preventDefault();
    }
  }

  public changeLogoOfPaymentSystem(e: Event): void {
    if (e.target && e.target instanceof HTMLInputElement) {
      const inputValue = e.target.value;
      if (this.cardNumberLogo) {
        if (inputValue.startsWith('3')) {
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/american-express.png');
        } else if (inputValue.startsWith('4')) {
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/visa.png');
        } else if (inputValue.startsWith('5')) {
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/mastercard.png');
        } else {
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/payment.png');
        }
      }
    }
  }

  public checkAllIsValid(valid: HTMLElement[], full: HTMLElement[]): void {
    if (this.confirmBtn) {
      this.confirmBtn.setAttribute('data-valid', valid.length < full.length ? 'invalid' : 'valid');
      if (this.confirmBtn.getAttribute('data-valid') === 'valid') {
        this.confirmBtn.classList.add('valid-btn');
        if (this.confirmBtnText) this.confirmBtnText.classList.add('hidden');
      } else {
        this.confirmBtn.classList.remove('valid-btn');
        if (this.confirmBtnText) this.confirmBtnText.classList.remove('hidden');
      }
      this.checkLabel(this.labelsAll);
    }
  }

  public checkLabel(labelsAll: HTMLElement[]): void {
    labelsAll.forEach((label) => {
      if (label && label instanceof HTMLLabelElement) {
        if (label.control) {
          if (!label.control.classList.contains('valid')) {
            label.classList.remove('hidden');
          } else {
            label.classList.add('hidden');
          }
        }
      }
    });
  }

  public buttonHandler(e: Event): void {
    if (e.target && e.target instanceof HTMLInputElement) {
      if (e.target.hasAttribute('data-valid')) {
        if (e.target.getAttribute('data-valid') !== 'invalid') {
          this.confirmBtnCallback(e);
        }
      }
    }
  }

  private confirmBtnCallback = (e: Event): void => {
    e.preventDefault();
    this.root.removeChild(this.element);
    this.notifyObserver(e);
  };

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Subject: Observer has been attached already.');
    }
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  public notifyObserver(e?: Event): void {
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this, e);
    }
  }
}
