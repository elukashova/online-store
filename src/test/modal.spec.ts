/* eslint-disable max-lines-per-function */
import ModalWindow from '../components/modal-window/modal-window';

const modalWindow: ModalWindow = new ModalWindow(document.body);

describe('ModalWindow class', () => {
  test('defines checkInputValue() method', () => {
    expect(modalWindow.addOnlyNumbers).toBeDefined();
  });

  test('checkInputValue() method return right value for name', () => {
    const regEx = /[A-Za-zА-Яа-яЁё'-]{3,}\s[A-Za-zА-Яа-яЁё'-]{3,}\s?/;

    expect(modalWindow.checkInputValue(regEx, 'Joe Kim')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'Leonardo Wilhelm DiCaprio')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, "Frances O'Connor")).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'Анастасия Климова')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'Анастасия Климова-Виноградова')).toBeTruthy();

    expect(modalWindow.checkInputValue(regEx, 'Jo Ki')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '111 222')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '')).toBeFalsy();
  });

  test('checkInputValue() method return right value for phone number', () => {
    const regEx = /^[\\+][0-9]{9,}$/;

    expect(modalWindow.checkInputValue(regEx, '+888888888')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, '+8888888883421')).toBeTruthy();

    expect(modalWindow.checkInputValue(regEx, '+texttexttext')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '+88888888')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '')).toBeFalsy();
  });

  test('checkInputValue() method return right value for email', () => {
    // eslint-disable-next-line operator-linebreak
    const regEx =
      /^(?!\.)(?!.*\.$)(?!.*\.\.)([A-Za-z0-9!#$%&'*\\.\\.+-\\/=?^_`{|}~]{2,})@[A-Za-z0-9-\\._]{2,}\.[A-Za-z]{2,4}$/;

    expect(modalWindow.checkInputValue(regEx, 'mail@mail.ru')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'ex.mail@mail.ru')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'ex.my-mail@very-lond-domain-with-dot.mail.ru')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, 'ex_mail@mail.com')).toBeTruthy();

    expect(modalWindow.checkInputValue(regEx, 'm..ail@mail.ru')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '')).toBeFalsy();
  });

  test('checkInputValue() method return right value for card expiration', () => {
    // eslint-disable-next-line operator-linebreak
    const regEx = /((0[1-9])|(1[0-2]))\/((2[3-9])|(3[0-9])|(4[0-9])|(5[0-9])|(6[0-9])|(7[0-9])|(8[0-9])|(9[0-9]))/;

    expect(modalWindow.checkInputValue(regEx, '01/23')).toBeTruthy();
    expect(modalWindow.checkInputValue(regEx, '12/28')).toBeTruthy();

    expect(modalWindow.checkInputValue(regEx, '13/23')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '01/22')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '01.23')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '01/2023')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, 'rr/rr')).toBeFalsy();
    expect(modalWindow.checkInputValue(regEx, '')).toBeFalsy();
  });
});
