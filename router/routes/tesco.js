var express = require('express');
var router = express.Router();
var engine = require('../../engine/tesco');
var TescoCategory = require('../../database').TescoCategory;

router.get('/pullproducts',
	function (req, res, next) {
		helper.pullDepartments(function(depts, err){
			if(err) return res.json(err);
			TescoCategory.bulkCreate(depts, {updateOnDuplicate: ['updated_at']}).then(function(){
				res.send("Done");
			}).error(function(err){
				res.status(500).send(err);
			});
		});
	}
);

module.exports = router;