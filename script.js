document.addEventListener("DOMContentLoaded", function () {
  const hasLodash = typeof window._ !== "undefined";

  // Приветствие пользователя
  const greetingEl = document.getElementById("user-greeting");
  const savedName = localStorage.getItem("rc_userName");

  if (greetingEl && savedName) {
    const prettyName =
      hasLodash && typeof _.startCase === "function"
        ? _.startCase(savedName.toLowerCase())
        : savedName;

    greetingEl.textContent = `С возвращением, ${prettyName}!`;
  }

  // Авто-проставление 
  (function enhanceResponsiveTables() {
    if (!hasLodash) return;

    const tables = document.querySelectorAll("table");
    _.forEach(tables, function (table) {
      const ths = table.querySelectorAll("thead th");
      if (!ths || ths.length === 0) return;

      const headers = _.map(ths, function (th) {
        return _.trim(th.textContent || "");
      });

      const rows = table.querySelectorAll("tbody tr");
      _.forEach(rows, function (tr) {
        const tds = tr.querySelectorAll("td");
        _.forEach(tds, function (td, index) {
          if (!td.getAttribute("data-label") && headers[index]) {
            td.setAttribute("data-label", headers[index]);
          }
        });
      });
    });
  })();

  // Контактная форма
  const contactFormClass = document.querySelector(".contact-form");
  if (contactFormClass) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const msgBox = document.querySelector(".form-message");

    contactFormClass.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!nameInput || !emailInput) return;

      if (!nameInput.value.trim() || !emailInput.value.trim()) {
        if (msgBox) msgBox.textContent = "Пожалуйста, заполните обязательные поля.";
        return;
      }

      localStorage.setItem("rc_userName", nameInput.value.trim());

      if (msgBox) msgBox.textContent = "Спасибо! Ваше сообщение отправлено (демо).";

      if (messageInput) messageInput.value = "";
    });
  }

  // Форма выбора региона
  const regionForm = document.querySelector(".region-form");
  if (regionForm) {
    const regionSelect = document.getElementById("region");
    const regionOutput = document.querySelector(".region-output");

    const savedRegion = localStorage.getItem("rc_region");
    if (savedRegion && regionSelect) {
      regionSelect.value = savedRegion;
      if (regionOutput) regionOutput.textContent = `Вы ранее выбирали регион: ${savedRegion}.`;
    }

    regionForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!regionSelect || !regionSelect.value) {
        if (regionOutput) regionOutput.textContent = "Пожалуйста, выберите регион.";
        return;
      }

      let regionName = regionSelect.value;
      if (hasLodash && typeof _.startCase === "function") {
        regionName = _.startCase(regionName.toLowerCase());
      }

      localStorage.setItem("rc_region", regionName);

      if (regionOutput) regionOutput.textContent = `Регион сохранён: ${regionName}.`;
    });
  }

  // Взаимодействие с основным видео на главной
  const mainVideo = document.querySelector(".video-section video");
  if (mainVideo) {
    mainVideo.addEventListener("mouseenter", function () {
      try {
        const playPromise = mainVideo.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(() => {});
        }
      } catch (e) {}
    });
  }

  // 1. Получение содержимого H1
  const mainTitleEl = document.querySelector("h1");
  if (mainTitleEl) {
    console.log(mainTitleEl.textContent);
  }

  // 2. Кнопка для получения текущего времени
  const timeBtn = document.getElementById("get-time-button");
  if (timeBtn) {
    timeBtn.addEventListener("click", function () {
      const currentTime = new Date().toLocaleString();
      alert(currentTime);
    });
  }

  // 3. Доп. обработка отправки контактной формы
  const contactFormId = document.querySelector("#contact-form");
  if (contactFormId) {
    contactFormId.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const dataObject = {};

      for (const pair of formData.entries()) {
        dataObject[pair[0]] = pair[1];
      }

      localStorage.setItem("contactFormData", JSON.stringify(dataObject));
      this.style.display = "none";

      const resultMessage = document.getElementById("result-message");
      if (resultMessage) resultMessage.style.display = "block";
    });

    const storedDataRaw = localStorage.getItem("contactFormData");
    if (storedDataRaw) {
      try {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData && storedData.name) {
          const greetNode = document.createTextNode(`Добрый день, ${storedData.name}`);
          document.body.insertBefore(greetNode, contactFormId);
        }
      } catch (e) {}
    }
  }

  // 4. Определение расстояния до заданных координат (НГТУ)
  const distanceInfoEl = document.getElementById("distance-info");
  if (distanceInfoEl) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const targetLat = 55.016564; // НГТУ
          const targetLng = 82.931665;

          function degToRad(degrees) {
            return degrees * (Math.PI / 180);
          }

          function calcDistance(lat1, lng1, lat2, lng2) {
            const earthRadiusKm = 6371;
            const dLat = degToRad(lat2 - lat1);
            const dLon = degToRad(lng2 - lng1);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(degToRad(lat1)) *
                Math.cos(degToRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return earthRadiusKm * c;
          }

          const distanceInKilometers = calcDistance(userLat, userLng, targetLat, targetLng);
          distanceInfoEl.innerHTML = `${distanceInKilometers.toFixed(2)} км`;
        },
        function () {
          distanceInfoEl.innerHTML = "Не удалось получить геолокацию.";
        }
      );
    } else {
      distanceInfoEl.innerHTML = "Геолокация не поддерживается.";
    }
  }

  // 5. Управление видео и аудио 
  document.querySelectorAll('[data-action="play"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const mediaEl =
        e.target.closest("video, audio") ||
        e.target.parentElement.querySelector("video, audio");
      if (mediaEl && typeof mediaEl.play === "function") mediaEl.play();
    });
  });

  document.querySelectorAll('[data-action="pause"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const mediaEl =
        e.target.closest("video, audio") ||
        e.target.parentElement.querySelector("video, audio");
      if (mediaEl && typeof mediaEl.pause === "function") mediaEl.pause();
    });
  });

  document.querySelectorAll('[data-action="forward"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const mediaEl =
        e.target.closest("video, audio") ||
        e.target.parentElement.querySelector("video, audio");
      if (mediaEl) mediaEl.currentTime += 15;
    });
  });

  document.querySelectorAll('[data-action="backward"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const mediaEl =
        e.target.closest("video, audio") ||
        e.target.parentElement.querySelector("video, audio");
      if (mediaEl) mediaEl.currentTime -= 15;
    });
  });

  // 6. Список статей с фильтрацией
  const articles = [
    { title: "«Повесть временных лет»", description: "(летописный свод, начало XII века) — базовый источник по ранней истории Руси (Киевская Русь, князья, принятие христианства)." },
    { title: "«Россия и Европа»", description: "Н. Я. Данилевский (1869) — известный труд о месте России в европейской цивилизации и идее культурно‑исторических типов." },
    { title: "«Россия: критика исторического опыта»", description: " П. Я. Чаадаев (публикация «Философического письма», 1836) — одна из самых знаменитых работ, вызвавшая большой спор о пути России." },
  ];

  const articlesContainer = document.getElementById("articles-list");
  const searchInput = document.getElementById("search-input");

  if (articlesContainer) {
    function renderArticles(list) {
      articlesContainer.innerHTML = "";
      list.forEach(function (article) {
        const card = document.createElement("div");
        card.classList.add("article-item");
        card.innerHTML = `<h3>${article.title}</h3><p>${article.description}</p>`;
        articlesContainer.appendChild(card);
      });
    }

    const initialList =
      hasLodash && typeof _.sortBy === "function" ? _.sortBy(articles, ["title"]) : articles;

    renderArticles(initialList);

    if (searchInput) {
      const doSearch = function () {
        const searchValue = searchInput.value.trim().toLowerCase();

        const filtered =
          hasLodash && typeof _.filter === "function"
            ? _.filter(initialList, (a) => a.title.toLowerCase().includes(searchValue))
            : initialList.filter((a) => a.title.toLowerCase().includes(searchValue));

        renderArticles(filtered);
      };

      const handler =
        hasLodash && typeof _.debounce === "function" ? _.debounce(doSearch, 250) : doSearch;

      searchInput.addEventListener("input", handler);
    }
  }

  // 7. GET-запрос с XMLHttpRequest 
  const apiOutput = document.getElementById("api-output");
  if (apiOutput) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/path/to/api-endpoint");
    xhr.responseType = "json";
    xhr.send();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 && xhr.response) {
          apiOutput.innerHTML = "<pre>" + JSON.stringify(xhr.response, null, 2) + "</pre>";
        } else {
          apiOutput.textContent = "Не удалось получить данные с сервера.";
        }
      }
    };
  }
});