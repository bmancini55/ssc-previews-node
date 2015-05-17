let express = require('express');
let Models  = require('../models');
let Item    = Models.Item;

async function index(req, res) {
  let page      = req.query.page;
  let pagesize  = req.query.pagesize;
  let preview   = 'MAY15';
  let model = { 
        page: page, 
        pagesize: pagesize,
        items: null        
      };  

  model.items = await Item.findAll({ page: page, pagesize: pagesize });
  res.render('home/index', model);
}


module.exports = {
  index: index.bind()
};