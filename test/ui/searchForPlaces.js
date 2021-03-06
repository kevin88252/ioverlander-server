"use strict"

const SEARCH_FOR_PLACES = 'http://localhost:3000/country_places_list/159/1/'

module.exports = {
  'Search for Places': (browser) => {

    browser
      .url(HOMEPAGE_URL)
      .waitForElementVisible('body', 3000)
      .pause(1000)
      .execute('return window.map.getCenter()', [], (center) => {
        INITIAL_COORDS = [center.value.lat, center.value.lng].join(', ')
        INITIAL_URL = browser.url()
      })
      .setValue('[data-el="place-search"]', 'Nicaragua')
      .submitForm('[data-el="place-search-form"]')
      .pause(500)
      .execute('return window.map.getCenter()', [], (center) => {
        FINAL_COORDS = [center.value.lat, center.value.lng].join(', ')
        FINAL_URL = browser.url()
      })
      .pause(2500, () => {
        browser.assert.notEqual(INITIAL_COORDS, FINAL_COORDS, 'The map has moved')
        browser.assert.notEqual(INITIAL_COORDS, FINAL_COORDS, 'The URL was updated with co-ordinates')
        browser.end()
      })
  },
  'Place type filter': (browser) => {
    browser
      .url(HOMEPAGE_URL + '?lat=12.374880155986922&lng=-84.869384765625&zoom=8')
      .click('.filter-container > button')
      .waitForElementVisible('.place-type-filter-list', 250)
      .click('.place-type-filter-list > li:first-child label')
      .assert.elementNotPresent('img[src="/assets/icons/camping-pin.png"]')
      .click('.place-type-filter-list > li:first-child label')
      .assert.elementPresent('img[src="/assets/icons/camping-pin.png"]')
  }
}
