import { Event } from "./event";

class DataList {
  constructor(defaults = {}) {
    this.defaults = defaults;
    this.emptyIndices = [];
    this.listElements = [];
    this.onAdd = new Event();
    this.onModify = new Event();
    this.onRemove = new Event();
  }

  add(data) {
    const element = Object.assign({}, this.defaults, data);
    element.id = this.emptyIndices.pop() ?? this.listElements.length;

    this.listElements[element.id] = element;
    this.onAdd.invoke(element);
  }

  set(id, values) {
    const element = this.listElements[id];
    if (element) {
      this.listElements[id] = Object.assign({}, element, values);
      this.onModify.invoke(element, this.listElements[id]);
    }
  }

  remove(id) {
    const element = this.listElements[id];
    if (element) {
      this.listElements[id] = undefined;
      this.emptyIndices.push(id);
      this.onRemove.invoke(element);
    }
  }

  clear() {
    for (let i = 0; i < this.listElements.length; i++) {
      this.remove(i);
    }
  }
}

export { DataList };
