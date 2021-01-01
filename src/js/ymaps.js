import balloonRender from '../templates/balloon.hbs';
import commentsRender from '../templates/comments.hbs';

let allReviewsDictionary = [];

function mapInit() {
    ymaps.ready(() => {

        let myMap = new ymaps.Map('map', {
            center: [55.6, 37.6],
            zoom: 10
        });

        getExistingBalloons()
            .then(() => {
                let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
                    '{{properties.balloonContent|raw}}', {
                        build: function () {
                            customItemContentLayout.superclass.build.call(this);

                            // подтягиваю комментарии
                            let address = document.querySelector('.ballon_header').innerHTML;
                            let comments = getCommentsByAddress(address);
                            let commentsNode = document.querySelector('#commentsNodeId');
                            commentsNode.innerHTML = commentsRender({comments: comments});

                            // подтягиваю адрес для текущего элемента
                            // let currentItemSwitcher = document.querySelector('.ymaps-2-1-78-b-cluster-carousel__pager-item_current_yes');
                            // currentItemSwitcher.innerHTML = address;

                            let sendButton = document.querySelector('.sendButton');
                            sendButton.addEventListener('click', this.onSendClick)
                        },
                        onSendClick: function () {
                            let nameInput = document.querySelector('input.nameInput');
                            let placeInput = document.querySelector('input.placeInput');
                            let commentInput = document.querySelector('textarea.commentTextarea');

                            let address = document.querySelector('.ballon_header').innerHTML;
                            let coords = getCoordsByAddress(address);

                            let date = new Date();
                            let currentDate = `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`;
                            let newReview = {
                                name: nameInput.value,
                                place: placeInput.value,
                                comment: commentInput.value,
                                date: currentDate
                            }

                            addOrUpdateReview(coords, newReview, address);

                            let closeButton = document.querySelector('.ymaps-2-1-78-balloon__close-button');
                            closeButton.click();
                        }
                    });

                var clusterer = new ymaps.Clusterer({
                    preset: 'islands#invertedDarkOrangeClusterIcons',
                    clusterDisableClickZoom: true,
                    openBalloonOnClick: true,
                    groupByCoordinates: false,
                    clusterBalloonContentLayout: 'cluster#balloonCarousel',
                    clusterBalloonItemContentLayout: customItemContentLayout,
                    clusterBalloonContentWidth: 385,
                    clusterBalloonContentLayoutWidth: 385,
                    clusterBalloonContentLayoutHeight: 400,
                });
                myMap.geoObjects.add(clusterer);

                myMap.events.add('click', function (event) {
                    let coords = event.get('coords');

                    getActualBalloonContent(coords).then((balloonContent) => {
                        createPlacemarkAndOpenBalloon(myMap, balloonContent, clusterer);
                    });
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

function createPlacemarkAndOpenBalloon(myMap, balloonContent, clasterer) {
    let myPlacemark = new ymaps.Placemark(balloonContent.coords, {
        balloonContent: balloonRender(balloonContent),
        address: `${balloonContent.address}`
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    })

    clasterer.add(myPlacemark);

    let isDataSaved = false;

    myPlacemark.balloon.events.add('open', () => {
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

            addOrUpdateReview(coords, newReview, balloonContent.address);

            isDataSaved = true;
            myPlacemark.balloon.close();
        });
    });

    myPlacemark.balloon.events.add('close', () => {
        if (!isDataSaved) {
            clasterer.remove(myPlacemark);
        }
    });

    myPlacemark.balloon.open();
}

function addOrUpdateReview(coords, newReview, address) {
    let isExist = false;

    for (let review of allReviewsDictionary) {
        if (review.coords === coords) {
            review.value.push(newReview);
            isExist = true;
        }
    }

    if (!isExist) {
        allReviewsDictionary.push({
            coords: coords,
            value: [newReview],
            address: address
        })
    }
}


function getExistingBalloons() {
    return new Promise((resolve) => {
        let existingBalloonContent = [];

        if (allReviewsDictionary.length > 0) {
            for (let i = 0; i < allReviewsDictionary.length; i++) {
                ymaps.geocode(allReviewsDictionary[i].coords).then((response) => {
                    existingBalloonContent.push({
                        coords: allReviewsDictionary[i].coords,
                        comments: allReviewsDictionary[i].value,
                        address: response.geoObjects.get(0).properties.get('text')
                    });

                    if (i === allReviewsDictionary.length - 1) {
                        resolve(existingBalloonContent);
                    }
                })
            }
        } else {
            resolve([])
        }
    })
}

function getCommentsByAddress(address) {
    for (let i = 0; i < allReviewsDictionary.length; i++) {
        if (allReviewsDictionary[i].address === address) {
            return allReviewsDictionary[i].value;
        }
    }
}

function getCoordsByAddress(address) {
    for (let i = 0; i < allReviewsDictionary.length; i++) {
        if (allReviewsDictionary[i].address === address) {
            return allReviewsDictionary[i].coords;
        }
    }
}

function getExistingReviews(coords) {
    for (let review of allReviewsDictionary) {
        if (review.coords === coords) {
            return review.value;
        }
    }

    return [];
}

export {
    mapInit
}