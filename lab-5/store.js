window.Store = {
  state: { shapes: [] },
  subscribers: [],

  init: function () {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem("shapes")); } catch (e) {}
    if (saved && saved.shapes) this.state = saved;
  },

  subscribe: function (fn) {
    this.subscribers.push(fn);
  },

  notify: function () {
    try { localStorage.setItem("shapes", JSON.stringify(this.state)); } catch (e) {}
    for (var i = 0; i < this.subscribers.length; i++) this.subscribers[i](this.state);
  },

  addShape: function (type) {
    this.state.shapes.push({
      id: "id-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
      type: type,
      color: Helpers.randomColor()
    });
    this.notify();
  },

  removeShape: function (id) {
    var next = [];
    for (var i = 0; i < this.state.shapes.length; i++) {
      if (this.state.shapes[i].id !== id) next.push(this.state.shapes[i]);
    }
    this.state.shapes = next;
    this.notify();
  },

  recolor: function (type) {
    for (var i = 0; i < this.state.shapes.length; i++) {
      if (this.state.shapes[i].type === type)
        this.state.shapes[i].color = Helpers.randomColor();
    }
    this.notify();
  },

  getCounts: function () {
    var s = 0, c = 0;
    for (var i = 0; i < this.state.shapes.length; i++) {
      if (this.state.shapes[i].type === "square") s++;
      else if (this.state.shapes[i].type === "circle") c++;
    }
    return { squares: s, circles: c };
  }
};

Store.init();
