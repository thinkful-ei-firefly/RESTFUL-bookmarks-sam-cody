function makeBookmarksArray() {
  return[
    {
      id: 1,
      title: 'One',
      url: 'http://www.one.com',
      description: 'Searcher..',
      rating: "5.0"
    },
    {
      id: 2,
      title: 'Two',
      url: 'http://www.two.com',
      description: 'Searcher..',
      rating: "3.0"
    },
    {
      id: 3,
      title: 'Three',
      url: 'http://www.three.com',
      description: 'Searcher..',
      rating: "1.0"
    }
  ]
}

module.exports = {
  makeBookmarksArray
}