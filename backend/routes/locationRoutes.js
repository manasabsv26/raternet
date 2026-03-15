const express = require('express');
const LocationController = require('../controllers/locationController');
const authController = require('../controllers/authController');
const router = express.Router();



router.route('/')
    .get(LocationController.getallLocations)
    .post(LocationController.createLocation);

router.route('/search')
    .get(LocationController.searchCompanyLocations);

router.route('/options/:id')
    .delete(LocationController.deleteLocation)    // delete plan by PLAN-id
    .get(LocationController.getLocationsById)      //get Plan by COMPANY -ID
    .put(LocationController.updateLocation);     // update plan by plan id

    
module.exports = router;
