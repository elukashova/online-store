/* eslint-disable max-lines-per-function */
import rendered from '../../utils/render';
import BaseComponent from '../base-component/base-component';
import { Observer } from '../card/card.types';
import './modal-window.styles.css';

export default class ModalWindow extends BaseComponent {
  private nameInput: HTMLInputElement | null = null;

  private phoneInput: HTMLInputElement | null = null;

  private addressInput: HTMLInputElement | null = null;

  private emailInput: HTMLInputElement | null = null;

  private cardNumberInput: HTMLInputElement | null = null;

  public cardExpirationInput: HTMLInputElement | null = null;

  private cardCVVInput: HTMLInputElement | null = null;

  private validInputs: HTMLInputElement[] = [];

  private inputsAll: HTMLInputElement[] = [];

  private labelsAll: HTMLLabelElement[] = [];

  private confirmBtn: HTMLInputElement | null = null;

  private confirmBtnText: HTMLElement | null = null;

  private personalInfoForm: HTMLFormElement | null = null;

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
    const nameLabel: HTMLLabelElement = rendered(
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
    const phoneLabel: HTMLLabelElement = rendered(
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
    const addressLabel: HTMLLabelElement = rendered(
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
    const emailLabel: HTMLLabelElement = rendered(
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
    const numberLabel: HTMLLabelElement = rendered(
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
      'data-regex': '((0[1-9])|(1[0-2]))\\/((2[3-9])|([3-9][0-9]))',
      required: 'required',
      maxlength: '5',
    });
    this.cardExpirationInput.addEventListener('keydown', this.autoSlashForDate);
    this.cardExpirationInput.addEventListener('keydown', this.addOnlyNumbers);
    const expirationLabel: HTMLLabelElement = rendered(
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
    const cvvLabel: HTMLLabelElement = rendered(
      'label',
      cvvWrapper,
      'pers-data__cvv-label label hidden',
      '3 digits must be entered',
      {
        for: 'cvv',
      },
    );

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
    this.cardNumberInput.addEventListener('input', (): void => {
      if (this.cardNumberLogo) {
        this.changeLogoOfPaymentSystem(this.cardNumberInput?.value);
      }
    });
    this.confirmBtn.addEventListener('click', (): void => {
      if (this.confirmBtnText) {
        this.confirmButtonHandler();
      }
    });
  }

  // закрытие модального окна
  private closeModalCallback = (e: Event): void => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      this.root.removeChild(this.element);
    }
  };

  // проверяем наличие атрибута с регулярным выражением у инпута
  public inputHandler = (): void => {
    this.inputsAll.forEach((input) => {
      if (input instanceof HTMLInputElement && input.hasAttribute('data-regex')) {
        this.addClasses(input);
      }
    });
  };

  // смена классов valid / invalid
  public addClasses(element: HTMLInputElement): void {
    const inputValue: string = element.value;
    const inputReg: string | undefined = element.dataset.regex;
    const input: HTMLInputElement = element;
    if (inputReg) {
      const reg: RegExp = new RegExp(inputReg);
      if (this.checkInputValue(reg, inputValue)) {
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

  public checkInputValue(regex: RegExp, inputValue: string): boolean {
    return regex.test(inputValue);
  }

  // добавление слэша в срок действия карты
  public autoSlashForDate(e: KeyboardEvent): void {
    if (e.target && e.target instanceof HTMLInputElement) {
      const inputValue: string = e.target.value;
      const { key }: KeyboardEvent = e;
      if (inputValue.length === 2 && key !== 'Backspace') {
        e.target.value = `${inputValue}/`;
      }
    }
  }

  // запрет на добавление нечисловых значений
  public addOnlyNumbers(e: KeyboardEvent): void {
    if (e.key.length === 1 && /\D/.test(e.key)) {
      e.preventDefault();
    }
  }

  // метод смены логотипа платежной системы
  public changeLogoOfPaymentSystem(value: string | undefined): void {
    if (this.cardNumberLogo) {
      switch (value?.charAt(0)) {
        case '3':
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/american-express.png');
          break;
        case '4':
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/visa.png');
          break;
        case '5':
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/mastercard.png');
          break;
        default:
          this.cardNumberLogo.setAttribute('src', '../../../assets/icons/payment.png');
          break;
      }
    }
  }

  // проверяем что все инпуты валидны
  public checkAllIsValid(valid: HTMLElement[], full: HTMLElement[]): void {
    if (this.confirmBtn) {
      // сравниваем длину массива валидных инпутов с длиной массива всех инпутов
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

  // добавляем или убираем классы для подсказок
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

  public confirmButtonHandler(): void {
    if (this.confirmBtn && this.confirmBtn.hasAttribute('data-valid')) {
      if (this.confirmBtn.getAttribute('data-valid') !== 'invalid') {
        this.confirmBtnCallback();
      }
    }
  }

  private confirmBtnCallback = (): void => {
    const e = new Event('confirm');
    e.preventDefault();
    this.root.removeChild(this.element);
    this.notifyObserver(e);
  };

  // три метода, нужные для обсервера
  public attachObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const observerIndex: number = this.observers.indexOf(observer);
    this.observers.splice(observerIndex, 1);
  }

  public notifyObserver(e?: Event): void {
    for (let i: number = 0; i < this.observers.length; i += 1) {
      this.observers[i].update(this, e);
    }
  }
}
