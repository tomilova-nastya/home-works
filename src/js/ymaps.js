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
                let obj = {};
                obj.coords = coords;
                obj.address = response.geoObjects.get(0).properties.get('text');
                obj.comments = [];
                openPopup(myMap, obj);
            });
        });
    })
}

function openPopup(myMap, obj) {
    let myPlacemark = new ymaps.Placemark(obj.coords, {
        balloonContent: balloonRender()
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