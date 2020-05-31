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
                balloonContent.comments = [{
                    name: "Никифоров Степан",
                    place: "Шоколадница",
                    comment: "Слошком много народу!! Не приходите",
                    date: "20.05.2020"
                },
                    {
                        name: "Василиса",
                        place: "Тату-салон Мнтра",
                        comment: "Прекрасные мастера умеющие в градиент + уютная обстановка, стирильно. Первый класс!",
                        date: "15.02.2021"
                    }];
                openPopup(myMap, balloonContent);
                console.log(balloonContent.address);
            });
        });
    })
}

function openPopup(myMap, balloonContent) {
    let myPlacemark = new ymaps.Placemark(balloonContent.coords, {
        balloonContent: balloonRender(balloonContent)
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    })

    myMap.geoObjects.add(myPlacemark);
    myPlacemark.balloon.open();
}

export {
    mapInit
}