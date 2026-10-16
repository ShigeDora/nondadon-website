(function () {
  // メニュー（スマホ）
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "閉じる" : "メニュー";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "メニュー";
      }
    });
  }

  // お知らせ
  var list = document.getElementById("news-list");
  if (list) {
    var items = (window.NEWS || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });
    if (!items.length) {
      list.innerHTML = '<li class="news-empty">お知らせはまだありません。</li>';
    } else {
      list.innerHTML = "";
      items.forEach(function (n) {
        var d = n.date.split("-");
        var li = document.createElement("li");
        var t = document.createElement("time");
        t.dateTime = n.date;
        t.textContent = d[0] + "." + d[1] + "." + d[2];
        var box = document.createElement("div");
        var title = document.createElement("span");
        title.className = "news-title";
        title.textContent = n.title;
        box.appendChild(title);
        if (n.body) {
          var body = document.createElement("span");
          body.className = "news-body";
          body.textContent = n.body;
          box.appendChild(body);
        }
        li.appendChild(t);
        li.appendChild(box);
        list.appendChild(li);
      });
    }
  }

  // 年
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
