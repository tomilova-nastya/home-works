function mapInit() {
    ymaps.ready(() => {
        let myMap = new ymaps.Map('map', {
            center: [55.7, 37.6],
            zoom: 10
        });

        myMap.events.add('click', function(e) {
            var coords = e.get('coords');
            var geoCoords = ymaps.geocode(coords);
            var position = e.get('position');

            geoCoords.then(response => {
                var obj = {};
                obj.coords = coords;
                obj.address = response.geoObjects.get(0).properties.get('text');
                obj.comments = [];
                openPopup(obj, response.geoObjects);
            });
        });
    })
}

function openPopup(obj, geoObjects) {
    var myPlaceMark = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [55.75, 37.63]
        },
        properties: {
            // Контент метки.
            iconContent: 'icon контент',
            hintContent: 'hint контент'
        }
    }, {});

    geoObjects
        .add(myPlaceMark)
        .add(new ymaps.Placemark(obj.coords, {
            balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        }));
}

export {
    mapInit,
    openPopup
}