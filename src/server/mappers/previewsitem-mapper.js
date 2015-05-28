let MongoDB = require('mongodb');
let pagedlist = require('../helpers/pagedlist');

/*
{
  _id: ObjectID
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
  copy : {
    diamd_no: String,
    title: String,
    price: String,
    preview: String,
    description: String        
  }
}
*/

module.exports = function(db) {
	let collection = db.collection('previewsitems');

  return {
    findByPreview: findByPreview,
    insertOne: insertOne,
    updateCopy: updateCopy
  };

	async function findByPreview(preview) {
	  let regex = new RegExp('^' + preview + '.*', 'i');  
	  let result = await collection
	    .find({ diamd_no: regex })
	    .toArrayAsync();

    return new pagedlist(result);
	}

  async function insertOne(previewsitem) {
    let result = await collection.insertOneAsync(previewsitem);        
    return result.ops[0];
  }

  async function updateCopy(copy) {
    let filter = { 
      diamd_no: copy.diamd_no 
    };
    let update = { 
      $set: { copy: copy }        
    };
    let options = {
      returnOriginal: false
    };

    let result = await collection.findOneAndUpdateAsync(filter, update, options);
    return result.value
  }

};