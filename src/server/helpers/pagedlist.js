
/** 
 * Attaches paging information to the Array
 * 
 * @param {Array} list 
 * @param {Number} page
 * @param {Number} pagesize
 * @param {Number} total
 */
module.exports = function(list, page = 1, pagesize = 24, total) {  
  list.page = page;
  list.pagesize = pagesize;
  list.total = total || list.length;
  list.lastpage = Math.max(list.total / pagesize);
  list.islastpage = list.lastpage === page;
  list.isfirstpage = page === 1;
  return list;
};