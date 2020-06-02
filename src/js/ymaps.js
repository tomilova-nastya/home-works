import balloonRender from '../templates/balloon.hbs';
import commentsRender from '../templates/comments.hbs';
let myGeoObjects = [];


function mapInit() {
    ymaps.ready(() => {

        let myMap = new ymaps.Map('map', {
            center: [55.6, 37.6],
            zoom: 10
        });

        getExistingBalloons().then((allExistingBalloons) => {
            if(allExistingBalloons.length === 0)
                console.log('problem');

            clasterizator(myMap, allExistingBalloons);

            myMap.events.add('click', function (event) {
                let coords = event.get('coords');
                //let position = e.get('position');

                getActualBalloonContent(coords).then((balloonContent) => {
                    createPlacemarkAndOpenBalloon(myMap, balloonContent);
                });
            });
        });

    })
}

let simpleText = 'simpapuska';

function clasterizator(myMap, allExistingBalloons) {
    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
    });
    /**
     * Функция возвращает объект, содержащий данные метки.
     * Поле данных clusterCaption будет отображено в списке геообъектов в балуне кластера.
     * Поле balloonContentBody - источник данных для контента балуна.
     * Оба поля поддерживают HTML-разметку.
     * Список полей данных, которые используют стандартные макеты содержимого иконки метки
     * и балуна геообъектов, можно посмотреть в документации.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
     */
    let getPointData = function (pointData) {
        let balloonContent = getBalloonContent(allExistingBalloons, pointData);
        let balloonHTML = balloonRender(balloonContent);


        return {
            balloonContentHeader: '',
            balloonContentBody: balloonHTML,
            balloonContentFooter: '',
            clusterCaption: '<p class="balloon_address" onclick="balloonHandler()">' + balloonContent.address + '</></p>'
        };
    }

    /**
     * Функция возвращает объект, содержащий опции метки.
     * Все опции, которые поддерживают геообъекты, можно посмотреть в документации.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
     */
    let getPointOptions = function () {
        return {
            preset: 'islands#violetIcon'
        };
    };

    let points = getExistingPoints();

    let geoObjects = [];

    /**
     * Данные передаются вторым параметром в конструктор метки, опции - третьим.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark.xml#constructor-summary
     */
    for (var i = 0, len = points.length; i < len; i++) {
        geoObjects[i] = new ymaps.Placemark(points[i], getPointData(points[i]), getPointOptions());
        myGeoObjects[i] = geoObjects[i];
    }

    /**
     * Можно менять опции кластеризатора после создания.
     */
    clusterer.options.set({
        gridSize: 80,
        clusterDisableClickZoom: true
    });

    /**
     * В кластеризатор можно добавить javascript-массив меток (не геоколлекцию) или одну метку.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#add
     */
    clusterer.add(geoObjects);
    myMap.geoObjects.add(clusterer);

    /**
     * Спозиционируем карту так, чтобы на ней были видны все объекты.
     */

    myMap.setBounds(clusterer.getBounds(), {
        checkZoomRange: true
    });
}

function openBalloon(coords) {
    //найти нужную метку
    console.log(myGeoObjects);
}

function getActualBalloonContent(coords) {
    return ymaps.geocode(coords).then(response => {
        let balloonContent = {};

        balloonContent.coords = coords;
        balloonContent.address = response.geoObjects.get(0).properties.get('text');
        balloonContent.comments = getExistingReviews(coords);

        return balloonContent;
    });
}

function generateBalloonContent(placemarkData) {
    return ymaps.geocode(placemarkData.coords).then(response => {
        let balloonContent = {};

        balloonContent.coords = placemarkData.coords;
        balloonContent.address = response.geoObjects.get(0).properties.get('text');
        balloonContent.comments = placemarkData.comments;

        return balloonContent;
    });
}

function getExistingBalloons() {
    return new Promise((resolve) => {
        let existingBalloonContent = [];

        for (let i = 0; i < localStorage.length; i++) {
            let coords_string = localStorage.key(i);
            let comments_string = localStorage.getItem(coords_string);

            if (comments_string !== 'INFO') {
                ymaps.geocode(JSON.parse(coords_string)).then((response) => {
                    existingBalloonContent.push({
                        coords: JSON.parse(coords_string),
                        comments: JSON.parse(comments_string),
                        address: response.geoObjects.get(0).properties.get('text')
                    });

                    if (i === localStorage.length - 1) {
                        resolve(existingBalloonContent);
                    }
                })
            }
        }
    })
}

function createPlacemarkAndOpenBalloon(myMap, balloonContent) {
    let myPlacemark = createPlacemark(myMap, balloonContent);
    let isDataSaved = false;

    myPlacemark.balloon.events.add('open', function () {
        let coords = balloonContent.coords;
        let commentsNode = document.querySelector('#commentsNodeId');

        balloonContent.comments = getExistingReviews(coords);
        commentsNode.innerHTML = commentsRender(balloonContent);

        let sendButton = document.querySelector('input.sendButton');
        let nameInput = document.querySelector('input.nameInput');
        let placeInput = document.querySelector('input.placeInput');
        let commentInput = document.querySelector('textarea.commentTextarea');

        let date = new Date();
        let currentDate = `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`;

        sendButton.addEventListener('click', (e) => {
            let coords = balloonContent.coords;
            let newReview = {
                name: nameInput.value,
                place: placeInput.value,
                comment: commentInput.value,
                date: currentDate
            }

            addOrUpdateReview(coords, newReview);

            isDataSaved = true;
            myPlacemark.balloon.close();
        })
    });

    myPlacemark.balloon.events.add('close', () => {
        if (!isDataSaved) {
            myMap.geoObjects.remove(myPlacemark);
        }
    });

    myPlacemark.balloon.open();
}

function createPlacemarkAndBalloon(myMap, baloonContent) {
    let myPlacemark = new ymaps.Placemark(baloonContent.coords, {
        balloonContent: balloonRender(baloonContent)
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    })

    myMap.geoObjects.add(myPlacemark);

    myPlacemark.balloon.events.add('open', function (event) {
        let sendButton = document.querySelector('input.sendButton');
        let nameInput = document.querySelector('input.nameInput');
        let placeInput = document.querySelector('input.placeInput');
        let commentInput = document.querySelector('textarea.commentTextarea');

        let date = new Date();
        let currentDate = `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`;

        sendButton.addEventListener('click', (e) => {
            let coords = baloonContent.coords;
            let newReview = {
                name: nameInput.value,
                place: placeInput.value,
                comment: commentInput.value,
                date: currentDate
            }

            addOrUpdateReview(coords, newReview);

            myPlacemark.balloon.close();
        })
    });
}

function createPlacemark(myMap, balloonContent) {
    let myPlacemark = new ymaps.Placemark(balloonContent.coords, {
        balloonContent: balloonRender(balloonContent)
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    })

    myMap.geoObjects.add(myPlacemark);

    return myPlacemark;
}

function addOrUpdateReview(coords, newReview) {
    let coords_string = JSON.stringify(coords);
    let existingReviews_string = localStorage.getItem(coords_string);
    let existingReviews = JSON.parse(existingReviews_string);

    if (existingReviews_string !== null) {
        if (existingReviews.length > 0) {
            // Обновляем ревью в localStorage
            existingReviews.push(newReview);
            localStorage.setItem(coords_string, JSON.stringify(existingReviews));
        }
    } else {
        // Или создем новое
        let reviews = [];
        reviews.push(newReview)
        localStorage.setItem(coords_string, JSON.stringify(reviews));
    }
}

function getExistingReviews(coords) {
    let coords_string = JSON.stringify(coords);
    let comments_string = localStorage.getItem(coords_string);

    return JSON.parse(comments_string);
}

function getBalloonContent(allExistingBalloons, coords) {
    for (let balloon of allExistingBalloons) {
        let existingCoords = JSON.stringify(balloon.coords);
        let currentCoords = JSON.stringify(coords);

        if (existingCoords === currentCoords) {
            return balloon;
        }
    }
}

function getExistingPlaces() {
    let existingPlaces = [];

    for (let i = 0; i < localStorage.length; i++) {
        let coords_string = localStorage.key(i);
        let comments_string = localStorage.getItem(coords_string);

        if (comments_string !== 'INFO') {
            existingPlaces.push({
                coords: JSON.parse(coords_string),
                comments: JSON.parse(comments_string)
            })
        }
    }

    return existingPlaces;
}

function getExistingPoints() {
    let existingPoints = [];

    for (let i = 0; i < localStorage.length; i++) {
        let coords_string = localStorage.key(i);

        if (coords_string !== 'loglevel:webpack-dev-server') {
            existingPoints.push(JSON.parse(coords_string));
        }
    }

    return existingPoints;
}

export {
    mapInit
}