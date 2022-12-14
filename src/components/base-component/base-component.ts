export default class BaseComponent {
  public readonly element: HTMLElement;

  constructor(tag: keyof HTMLElementTagNameMap, classes: string) {
    //в отличие от видео, не задаем div как тэг по уполчанию в конструкторе, чтобы принимал все (например, хедер)
    //в отличие от видео, классы передаем не массивом, а строкой, даже если их много (типа "class1 class2 class3")
    this.element = document.createElement(tag);
    this.element.classList.add(...classes.split(' ')); //чтобы принимал и один, и несколько классов
  }
}
