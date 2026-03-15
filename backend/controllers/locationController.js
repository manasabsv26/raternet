const Location = require('../models/locationModel')
const Review = require('../models/reviewmodel');
const Plan = require('../models/planModel');
const User = require('../models/usermodel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalize = (value = '') => String(value).toLowerCase().replace(/\s+/g, ' ').trim();

const tokenizeWords = (value = '') =>
    String(value)
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean);

exports.createLocation = catchAsync(async (req,res,next)=>{
    const newLocation = await Location.create(req.body)
    console.log("newLocation: ",newLocation)    
    res.status(200).json({
        _id : newLocation._id,
        status: 'success'
    })
});

// Get locations by Company ID GET /location/:company-id
exports.getLocationsById = catchAsync(async(req, res, next) => {
    const id = req.params.id
    const locations = await Location.find({company_id : id})

    if (!locations) {

        return next(new AppError('No location found with that ID', 404));
    } else {

        res.status(200).json({
            status: 'success',
            data: {
                locations
            }
        });
    }
});

exports.updateLocation = catchAsync(async(req, res, next) => {
    const id = req.params.id

    const location = await Location.findOneAndUpdate({ "_id": id}, {
        "$set": {
                "address_line1": req.body.address_line1,
                "city": req.body.city,
                "state": req.body.price,
                "pincode": req.body.pincode
        }
    },);
    if (!location) {

        return next(new AppError('No location found with that ID', 404));
    } else {

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
    }
});

exports.deleteLocation = catchAsync(async(req, res, next) => {
    const del = await Location.deleteOne({
        _id: req.params.id
    });
    if (!del) {
        return next(new AppError('There was some problem while Deleting. Delete after some time', 500));
    }
    res.status(200).json({
        status: 'success'
    })
});

exports.getallLocations = catchAsync(async(req, res, next) => {

    
    const locations = await Location.find();
    
    res.status(200).json({
        status: 'success',
        results: locations.length,
        data: {
            locations
        }
    });
}

);

exports.searchCompanyLocations = catchAsync(async (req, res, next) => {
    const city = String(req.query.city || '').trim();
    const pincode = String(req.query.pincode || '').trim();
    const type = String(req.query.type || '').trim();

    const locationMatch = [];

    if (city) {
        const cityTokens = tokenizeWords(city);
        if (cityTokens.length > 0) {
            locationMatch.push({
                $and: cityTokens.map(token => ({
                    city: { $regex: `(^|\\s|,|-)${escapeRegex(token)}($|\\s|,|-)`, $options: 'i' }
                }))
            });
        }
    }

    if (pincode) {
        const pinPrefix = pincode.replace(/\D/g, '');
        if (pinPrefix) {
            const digits = 6;
            const scale = Math.max(digits - pinPrefix.length, 0);
            const base = Number(pinPrefix);
            const minPin = base * Math.pow(10, scale);
            const maxPin = (base + 1) * Math.pow(10, scale) - 1;
            locationMatch.push({ pincode: { $gte: minPin, $lte: maxPin } });
        }
    }

    const locations = await Location.find(locationMatch.length ? { $and: locationMatch } : {}).lean();

    if (locations.length === 0) {
        return res.status(200).json({
            status: 'success',
            results: 0,
            data: { results: [] }
        });
    }

    const companyIds = [...new Set(locations.map(l => String(l.company_id)))];
    const [companies, plans, reviews] = await Promise.all([
        User.find({ _id: { $in: companyIds } }).select('name email asn').lean(),
        Plan.find({ company_id: { $in: companyIds } }).select('company_id type_of_service').lean(),
        Review.find({ company_id: { $in: companyIds } })
            .select('company_id city locality type overall_rating feedback date')
            .lean()
    ]);

    const companyMap = {};
    companies.forEach(c => {
        companyMap[String(c._id)] = c;
    });

    const plansByCompany = {};
    plans.forEach(plan => {
        const cid = String(plan.company_id);
        if (!plansByCompany[cid]) plansByCompany[cid] = new Set();
        plansByCompany[cid].add(plan.type_of_service);
    });

    const normalizedType = type ? normalize(type) : '';
    const results = [];

    locations.forEach(location => {
        const companyId = String(location.company_id);
        const locationKey = `${companyId}_${String(location._id)}`;
        const locationCity = normalize(location.city);
        const locationState = normalize(location.state);
        const locationPin = String(location.pincode || '');

        const companyTypes = [...(plansByCompany[companyId] || new Set())];
        if (normalizedType && !companyTypes.some(t => normalize(t) === normalizedType)) {
            return;
        }

        let feedbacks = reviews.filter(review => {
            if (String(review.company_id) !== companyId) return false;
            if (normalize(review.city) !== locationCity) return false;
            const locality = normalize(review.locality);
            const stateOk = locationState ? locality.includes(locationState) : true;
            const pinOk = locationPin ? locality.includes(locationPin) : true;
            const typeOk = normalizedType ? normalize(review.type) === normalizedType : true;
            return stateOk && pinOk && typeOk;
        });

        if (normalizedType && feedbacks.length === 0) {
            return;
        }

        const avgOverallRating = feedbacks.length
            ? Number((feedbacks.reduce((sum, item) => sum + (Number(item.overall_rating) || 0), 0) / feedbacks.length).toFixed(2))
            : 0;

        const feedbackItems = feedbacks
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => ({
                id: item._id,
                feedback: item.feedback,
                type: item.type,
                overall_rating: item.overall_rating,
                date: item.date
            }));

        results.push({
            key: locationKey,
            company_id: companyId,
            company_name: companyMap[companyId]?.name || companyMap[companyId]?.asn || companyMap[companyId]?.email || companyId,
            location_id: String(location._id),
            city: location.city,
            state: location.state,
            pincode: location.pincode,
            address_line1: location.address_line1,
            location_label: `${location.address_line1}, ${location.city}, ${location.state}, ${location.pincode}`,
            service_types: normalizedType ? companyTypes.filter(t => normalize(t) === normalizedType) : companyTypes,
            avg_overall_rating: avgOverallRating,
            feedback_count: feedbackItems.length,
            feedbacks: feedbackItems
        });
    });

    res.status(200).json({
        status: 'success',
        results: results.length,
        data: { results }
    });
});