export default class BaseComponent {
  public readonly element: HTMLElement;

  constructor(tag: keyof HTMLElementTagNameMap = 'div', classes?: string, id?: string) {
    // классы передаем не массивом, а строкой, даже если их много (типа "class1 class2 class3")
    this.element = document.createElement(tag);

    if (classes) {
      this.element.classList.add(...classes.split(' ')); // чтобы принимал и один, и несколько классов
    }
    if (id) {
      this.element.setAttribute('id', id);
    }
  }
}
