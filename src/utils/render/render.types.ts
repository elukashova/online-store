//типы, которые мне нужны для задания аттрибутов html элементам

export type Attribute = [string, string]; // например ['src', 'путь к картинке']

export type Rendered = (element: string, parent: Element, classes: string, attrData?: Attribute) => HTMLElement;
