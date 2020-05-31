import balloonRender from '../templates/balloon.hbs';

function mapInit() {
    ymaps.ready(() => {
        let myMap = new ymaps.Map('map', {
            center: [55.7, 37.6],
            zoom: 10
        });

        myMap.events.add('click', function(e) {
            let coords = e.get('coords');
            let geoCoords = ymaps.geocode(coords);
            let position = e.get('position');

            geoCoords.then(response => {
                let balloonContent = {};

                balloonContent.coords = coords;
                balloonContent.address = response.geoObjects.get(0).properties.get('text');
                // научиться доставать массив объектов с полями name, place, comment, date
                balloonContent.comments = [];

                openBalloon(myMap, balloonContent);
            });
        });
    })
}

function openBalloon(myMap, balloonContent) {
    let myPlacemark = new ymaps.Placemark(balloonContent.coords, {
        balloonContent: balloonRender(balloonContent)
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    })

    myMap.geoObjects.add(myPlacemark);
    myPlacemark.balloon.open();

    let isTheDataSent = false;

    myPlacemark.balloon.events.add('open', function() {
        let sendButton = document.querySelector('input.sendButton');
        sendButton.addEventListener('click', (e) => {
            let coords = balloonContent.coords;
            let date = new Date();
            let newReview = {
                name: document.querySelector('input.nameInput').value,
                place: document.querySelector('input.placeInput').value,
                comment: document.querySelector('textarea.commentTextarea').value,
                date: `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`
            }

            saveReview(coords, newReview);

            isTheDataSent = true;
            myPlacemark.balloon.close();
        })
    });

    myPlacemark.balloon.events.add('close', function () {
        if (!isTheDataSent) {
            myMap.geoObjects.remove(myPlacemark);
        }
    });
}

function saveReview(coords, newReview) {
    // взять из json файла существующие объекты
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', 'http://localhost:8080/reviews.json');
    xhr.send();

    // найти есть ли среди объектов место с нашими кординатами и правильно запомнить
    xhr.onload = function () {
        let existingReviews = xhr.response;

        let isExist = false;

        if (existingReviews) {
            if (existingReviews.length > 0) {
                for (let extReview in existingReviews) {
                    if (extReview.key === coords) {
                        extReview.value.push(newReview);
                        isExist = true;
                    }
                }
            }

            if(!isExist) {
                existingReviews.push({
                    key: coords,
                    value: newReview
                });
            }
        }

        // записать результат в файл
        xhr.open("POST", '../../text.txt', true);
        //Send the proper header information along with the request
        xhr.send(existingReviews);
    };
}

export {
    mapInit
}