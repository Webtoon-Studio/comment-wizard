const { JSDOM } = require("jsdom");

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

Object.defineProperty(window.document, "cookie", {
  writable: true,
  value: "NEO_SES=something",
});
