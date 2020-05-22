/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

filterNameInput.addEventListener('keyup', function(e) {
    let cookiesInBrowser = getParsedCookies();
    let chunk = e.target.value;

    listTable.innerHTML = '';
    for (let cookieObject of cookiesInBrowser) {
        if (isMatching(cookieObject.name, chunk) ||
            isMatching(cookieObject.value, chunk)) {
            addCookieInTable(cookieObject);
        }
    }
});

addButton.addEventListener('click', () => {
    // Обновляю и добавляю cookie в браузере
    document.cookie = encodeURIComponent(addNameInput.value) + '=' + encodeURIComponent(addValueInput.value);

    // Обновляю cookie в таблице
    let cookiesInTable = listTable.children;
    const newCookie = {name: addNameInput.value, value: addValueInput.value};
    
    if (cookiesInTable.length > 0) {
        let cookieIsExist = updateCookieInTableIfExist(cookiesInTable, newCookie);

        if(cookieIsExist) {
            return;
        }
    }

    // Добавляю cookie в таблицу
    addCookieInTable(newCookie);
});

function addCookieInTable(newCookie) {
    let tr = document.createElement('tr');
    let nameCell = document.createElement('th');
    let valueCell = document.createElement('th');

    listTable.appendChild(tr);

    nameCell.innerHTML = newCookie.name;
    tr.appendChild(nameCell);
    valueCell.innerHTML = newCookie.value;
    tr.appendChild(valueCell);

    // Добавляю кнопку удаления в строку cookie
    let removeCell = document.createElement('th');
    let removeButton = document.createElement('button');

    tr.appendChild(removeCell);
    removeButton.innerHTML = 'Удалить';
    removeCell.appendChild(removeButton);

    // Добавляю обработчик на нажатие кнопки удаления
    removeButton.addEventListener('click', (event) => {
        let cookieRaw = event.target.parentNode.parentNode;

        removeCookieFromBrowser(cookieRaw);
        removeCookieFromTable(cookieRaw);
    })
}

function updateCookieInTableIfExist(cookiesInTable, newCookie) {
    for (let cookieRaw of cookiesInTable) {
        let cookieNameNode = cookieRaw.children[0];
        let cookieValueNode = cookieRaw.children[1];

        if (cookieNameNode.innerHTML === newCookie.name) {
            cookieValueNode.innerHTML = newCookie.value;

            return true;
        }
    }

    return false;
}

function removeCookieFromBrowser(cookieRaw) {
    let cookieName = encodeURIComponent(cookieRaw.children[0].innerHTML);

    let cookieDate= new Date();
    cookieDate.setTime(cookieDate.getTime() - 1);
    document.cookie = cookieName + "=; expires=" + cookieDate.toGMTString();
};

function removeCookieFromTable(cookieRaw) {
    cookieRaw.remove();
};

function isMatching(cookieName, chunk) {
    cookieName = cookieName.toLowerCase();
    chunk = chunk.toLowerCase();

    if (cookieName.indexOf(chunk) === -1) {
        return false;
    }

    return true;
}

function getParsedCookies() {
    let allCookies = document.cookie.split('; ');
    let result = [];

    for (let cookie of allCookies) {
        let parsedCookie = cookie.split('=');

        result.push({ name: parsedCookie[0], value: parsedCookie[1]});
    }

    return result;
}
