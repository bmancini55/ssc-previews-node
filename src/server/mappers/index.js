module.exports = function(db, es) {
  return {
    categoryMapper: require('./category-mapper')(db, es),
    genreMapper: require('./genre-mapper')(db, es),
    itemMapper: require('./item-mapper')(db, es),
    personMapper: require('./person-mapper')(db, es),
    previewsitemMapper: require('./previewsitem-mapper')(db, es),
    publisherMapper: require('./publisher-mapper')(db, es),
    seriesMapper: require('./series-mapper')(db, es)
  };
};