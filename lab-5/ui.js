window.UI = {
  initUI: function (Store) {
    var board = document.getElementById("board");
    var $ = function (id) { return document.getElementById(id); };

    var btnSquare = $("btnAddSquare");
    var btnCircle = $("btnAddCircle");
    var btnReSq = $("btnRecolorSquares");
    var btnReCi = $("btnRecolorCircles");

    var cntSq = $("countSquares");
    var cntCi = $("countCircles");

    btnSquare.onclick = function () { Store.addShape("square"); };
    btnCircle.onclick = function () { Store.addShape("circle"); };
    btnReSq.onclick = function () { Store.recolor("square"); };
    btnReCi.onclick = function () { Store.recolor("circle"); };

    board.onclick = function (evt) {
      var e = evt || window.event;
      var t = e.target || e.srcElement;
      while (t && t !== board && (!t.className || t.className.indexOf("shape") === -1))
        t = t.parentNode;
      if (!t || t === board) return;
      Store.removeShape(t.getAttribute("data-id"));
    };

    Store.subscribe(function (state) {
      var shapes = state.shapes;
      var counts = Store.getCounts();
      cntSq.innerText = counts.squares;
      cntCi.innerText = counts.circles;

      var map = {};
      for (var i = 0; i < shapes.length; i++) map[shapes[i].id] = shapes[i];

      var children = board.children;
      for (var j = children.length - 1; j >= 0; j--) {
        var el = children[j];
        if (!map[el.getAttribute("data-id")]) board.removeChild(el);
      }

      for (var k = 0; k < shapes.length; k++) {
        var s = shapes[k];
        var found = board.querySelector('[data-id="' + s.id + '"]');
        if (!found) {
          found = document.createElement("div");
          found.className = "shape " + s.type;
          found.setAttribute("data-id", s.id);
          board.appendChild(found);
        }
        found.style.backgroundColor = s.color;
      }
    });

    var s = Store.state;
    for (var i = 0; i < Store.subscribers.length; i++) {
      Store.subscribers[i](s);
    }
  }
};
