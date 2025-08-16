import { Event } from "./event";

const onSaveAdd = new Event();
const onSaveRemove = new Event();

function canSave() {
  try {
    const x = "__storage_test__";
    window.localStorage.setItem(x, x);
    window.localStorage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      window.localStorage &&
      window.localStorage.length !== 0
    );
  }
}

function saveCount() {
  return window.localStorage.length;
}

function getKey(index) {
  return window.localStorage.key(index);
}

function getValue(key) {
  return window.localStorage.getItem(key);
}

function save(key, value) {
  window.localStorage.setItem(key, value);
  onSaveAdd.invoke();
}

function deleteSave(key) {
  window.localStorage.removeItem(key);
  onSaveRemove.invoke();
}

export {
  canSave,
  saveCount,
  getKey,
  getValue,
  save,
  deleteSave,
  onSaveAdd,
  onSaveRemove,
};
