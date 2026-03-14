exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: 'success',
            data: { users }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 const User = require('./../models/usermodel');
 const catchAsync = require('./../utils/catchAsync');
 const Apperror = require('./../utils/appError');
 const filterObj = (obj, ...allowedFields) => {
     const newObj = {};
     Object.keys(obj).forEach(el => {
         if (allowedFields.includes(el)) newObj[el] = obj[el];
     });
     return newObj;
 };
 exports.updateMe = catchAsync(async(req, res, next) => {
     // 1) Create error if user POSTs password data
     if (req.body.password || req.body.passwordConfirm) {
         return next(
             new Apperror(
                 'This route is not for password updates. Please use /updateMyPassword.',
                 400
             )
         );
     }

     // 2) Filtered out unwanted fields names that are not allowed to be updated
     const filteredBody = filterObj(req.body, 'email');

     // 3) Update user document
     if (!req.user) {
         return next(new Apperror('invalid access to the route', 400));
     }

     const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
         new: true,
         runValidators: true
     });

     res.status(200).json({
         status: 'success',
         data: {
             user: updatedUser
         }
     });
 });
 exports.deleteMe = catchAsync(async(req, res, next) => {
     if (!req.user) {
         return next(new Apperror('invalid access to the route', 400));
     }
     await User.findByIdAndUpdate(req.user.id, { active: false });

     res.status(204).json({
         status: 'success',
         data: null
     });
 });
 exports.getProfile = async (req, res) => {
    try {
        const asn = req.params.asn;

        // Fetch user based on ASN
        const user = await User.findOne({ asn });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
