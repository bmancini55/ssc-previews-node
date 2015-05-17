let mongoose  = require('mongoose');
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

let Item = mongoose.Schema({
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


async function search({ page = 1, pagesize = 24, previews, publisher, writer, artist }) {
  let filter = {};

  if(previews) {
    filter['Previews.PreviewNumber'] = new RegExp('^' + previews);
  }

  if(publisher) {
    filter['Publisher._id'] = mongoose.Types.ObjectId(publisher);
  }

  if(writer) {
    filter['Writer._id'] = mongoose.Types.ObjectId(writer);
  }

  if(artist) {
    filter['Artist._id'] = mongoose.Types.ObjectId(artist);
  }

  let results = await this
    .find(filter, null, { skip: (page - 1) * pagesize, limit: pagesize })
    .sort({ 'Previews.PreviewNumber': 1 })
    .exec();

  let total = await this
    .count(filter)
    .exec();

  return pagedlist(results, page, pagesize, total);
}

Item.statics.search = search;
require('../helpers/mongoose-plugins')(Item);
module.exports = mongoose.model('item', Item);