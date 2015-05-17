let mongoose = require('mongoose');
let pagedlist = require('../helpers/pagedlist');

let Person = {
  _id: mongoose.Schema.ObjectId,
  FullName: String
};

let Series = { 
  _id: String,
  Name: String
};

let Publisher= {
  _id: mongoose.Schema.ObjectId,
  Name: String
};

let Category = {
  _id: String,
  Name: String,
  ForConsumers: Boolean
};

let Genre = {
  _id: String,
  Name: String
};

let Preview = { 
  PreviewNumber: String,
  Page: String
};

let ItemSchema = mongoose.Schema({
  StockNumber: String,
  ParentItem: String,
  Title: String,
  Description: String,
  VariantDescription: String,
  Series: Series,
  IssueNumber: String,
  IssueSequenceNumber: String,
  VolumeTag: String,
  MaxIssue: String,
  Price: String,
  Publisher: Publisher,
  UPCNumber: String,
  ShortISBNNumber: String,
  EANNumber: String,
  CardsPerPack: String,
  PackPerBox: String,
  BoxPerCase: String,
  DiscountCode: String,
  Increment: String,
  PrintDate: String,
  FOCVendor: String,
  ShipDate: String,
  StandardRetailPrice: String,
  Category: Category,
  Genre: Genre,
  BrandCode: String,
  Mature: String,
  Adult: String,
  Caution1: String,
  Caution2: String,
  Caution3: String,
  Writer: Person,
  Artist: Person,
  CoverArtist: Person,
  AllianceSKU: String,
  FOCDate: String,
  Previews: [ Preview ]
}, 
  { collection: 'item' }
);
ItemSchema.statics.findAll = findAll;


/**
 * Finds all Items
 *
 * @param {Number} page
 * @param {Number} pagesize 
 * @return {Array[Item]}
 */
async function findAll({ page = 1, pagesize = 24 }) {  

  let options = {
    skip: (page - 1) * pagesize,
    limit: pagesize    
  };

  let sorter = {
    'Previews.PreviewNumber': 'asc'
  };
  
  let items = await this
    .find(null, null, options)
    .sort(sorter)
    .exec();

  let total = await this
    .count(null)
    .exec();

  return pagedlist(items, page, pagesize, total);
}


// Export Model
module.exports = mongoose.model('item', ItemSchema);