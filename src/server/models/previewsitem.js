let mongoose = require('mongoose');
let melpers  = require('../helpers/mongoose');

let PreviewsCopy = {
  diamd_no: String,
  title: String,
  price: String,
  preview: String,
  description: String        
};

let PreviewsItem = mongoose.Schema({
  diamd_no: String,
  stock_no: String,
  parent_item_no_alt: String,
  bounce_use_item: String,
  full_title: String,
  main_desc: String,
  variant_desc: String,
  series_code: String,
  issue_no: String,
  issue_seq_no: String,
  volume_tag: String,
  max_issue: String,
  price: String,
  publisher: String,
  upc_no: String,
  short_isbn_no: String,
  ean_no: String,
  cards_per_pack: String,
  pack_per_box: String,
  box_per_case: String,
  discount_code: String,  
  prnt_date: String,
  foc_vendor: String,
  ship_date: String,
  srp: String,
  category: String,
  genre: String,
  brand_code: String,
  mature: String,
  adult: String,
  oa: String,
  caut1: String,
  caut2: String,
  caut3: String,
  resol: String,
  note_price: String,
  order_form_notes: String,
  page: String,
  writer: String,
  artist: String,
  cover_artist: String,
  alliance_sku: String,
  foc_date: String,
  copy : PreviewsCopy
}, { collection: 'previewsitem' });


async function findByPreview(preview) {
  var regex = new RegExp('^' + preview + '.*', 'i');  
  return await this
    .find({ diamd_no: regex })
    .exec();
}

PreviewsItem.statics.findByPreview = findByPreview;
PreviewsItem.plugin(melpers);
module.exports = mongoose.model('previewsitem', PreviewsItem);