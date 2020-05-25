function mapInit() {
  ymaps.ready(() => {
    let moscow_map = new ymaps.Map('map', {
      center: [55.7, 37.6],
      zoom: 10
    })
  })
}

export {
  mapInit
}