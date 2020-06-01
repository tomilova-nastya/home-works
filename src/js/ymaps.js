import balloonRender from '../templates/balloon.hbs';
import commentsRender from '../templates/comments.hbs';

function mapInit() {
    ymaps.ready(() => {
        let myMap = new ymaps.Map('map', {
            center: [55.7, 37.6],
            zoom: 10
        });

        myMap.events.add('click', function (event) {
            let coords = event.get('coords');
            //let position = e.get('position');
            
            getActualBalloonContent(coords).then((balloonContent) => {
                    openBalloon(myMap, balloonContent);
                });
        });
        
    })
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

function openBalloon(myMap, balloonContent) {
    let myPlacemark = createPlacemark(myMap, balloonContent);
    let isDataSaved = false;

    myPlacemark.balloon.events.add('open', function (event) {
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

export {
    mapInit
}