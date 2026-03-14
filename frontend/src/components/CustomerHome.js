import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import { Paper, Box, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl, Divider } from '@mui/material';
import { useSnackbar } from "notistack";

const CustomerHome = () => {
    const reviewTypeOptions = ['WiFi', 'Fiber/Broadband', 'Data', 'Mobile Prepaid', 'Mobile Postpaid'];
    const [reviews, setReviews] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [companyMap, setCompanyMap] = useState({});
    const [plans, setPlans] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocationState, setSelectedLocationState] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [timePeriod, setTimePeriod] = useState('');
    const [pendingCompany, setPendingCompany] = useState('');
    const [pendingTimePeriod, setPendingTimePeriod] = useState('');
    const [stats, setStats] = useState({ numReviews: 0, numCompanies: 0 });
    const [addReviewOpen, setAddReviewOpen] = useState(false);
    const [editReviewOpen, setEditReviewOpen] = useState(false);
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewForm, setEditReviewForm] = useState({
        feedback: '',
        price_rating: '',
        service_rating: '',
        speed_rating: '',
        overall_rating: ''
    });
    const [reviewForm, setReviewForm] = useState({
        company_id: '',
        location_id: '',
        feedback: '',
        city: '',
        locality: '',
        type: '',
        price_rating: '',
        service_rating: '',
        speed_rating: '',
        overall_rating: '',
    });
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        // Check user type
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.type !== 'customer') {
            enqueueSnackbar('Unauthorized: Only customers can access this page.', { variant: 'error' });
            navigate('/');
            return;
        }
        // Fetch companies and the user's reviews on mount
        fetchCompanies();
        fetchReviews(payload.id, '', '');
    }, [navigate, enqueueSnackbar]);

    // Re-fetch when filters change
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        fetchReviews(payload.id, selectedCompany, timePeriod);
    }, [selectedCompany, timePeriod]);

    const fetchCompanies = async () => {
    const res = await fetch('http://localhost:7000/users');
    const data = await res.json();
    const users = data.data.users || [];
    setCompanies(users);
    // Build a map for quick lookup
    const map = {};
    users.forEach(u => { map[u._id] = u.name || u.email; });
    setCompanyMap(map);
    };

    const fetchReviews = async (userId, companyFilter, timeFilter) => {
        const uid = userId || (() => {
            const t = localStorage.getItem('token');
            return t ? JSON.parse(atob(t.split('.')[1])).id : null;
        })();
        if (!uid) return;
        const res = await fetch(`http://localhost:7000/review/user/${uid}`);
        const data = await res.json();
        let reviewsList = data.data.review || [];
        // Filter by company
        if (companyFilter) {
            reviewsList = reviewsList.filter(r => r.company_id === companyFilter);
        }
        // Filter by time period
        if (timeFilter) {
            const now = new Date();
            reviewsList = reviewsList.filter(r => {
                const reviewDate = new Date(r.date);
                if (timeFilter === 'week') {
                    return (now - reviewDate) < 7 * 24 * 60 * 60 * 1000;
                } else if (timeFilter === 'month') {
                    return (now - reviewDate) < 30 * 24 * 60 * 60 * 1000;
                }
                return true;
            });
        }
        // Sort by latest first
        reviewsList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setReviews(reviewsList);
        setStats({
            numReviews: reviewsList.length,
            numCompanies: new Set(reviewsList.map(r => r.company_id)).size
        });
    };

    const handleFilterChange = (e) => {
        if (e.target.name === 'company') {
            setPendingCompany(e.target.value);
            fetchPlans(e.target.value);
        }
        if (e.target.name === 'time') setPendingTimePeriod(e.target.value);
    };

    const handleSearch = () => {
        setSelectedCompany(pendingCompany);
        setTimePeriod(pendingTimePeriod);
        // fetchReviews will be triggered by useEffect above
    };

    const fetchPlans = async (companyId) => {
        if (!companyId) {
            setPlans([]);
            setSelectedPlan('');
            return;
        }
        const res = await fetch(`http://localhost:7000/plan/options/${companyId}`);
        const data = await res.json();
        setPlans(data.data.plan || []);
        setSelectedPlan('');
    };

    const fetchLocations = async (companyId) => {
        if (!companyId) {
            setLocations([]);
            setSelectedLocationState('');
            return;
        }
        const res = await fetch(`http://localhost:7000/locations/options/${companyId}`);
        const data = await res.json();
        setLocations(data?.data?.locations || []);
        setSelectedLocationState('');
    };

    const handleReviewFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'location_id') {
            const selectedLocation = locations.find(loc => loc._id === value);
            if (!selectedLocation) {
                setReviewForm(prev => ({ ...prev, location_id: '', city: '', locality: '' }));
                setSelectedLocationState('');
                return;
            }
            const localityValue = `${selectedLocation.address_line1}, ${selectedLocation.city}, ${selectedLocation.state}, ${selectedLocation.pincode}`;
            setReviewForm(prev => ({
                ...prev,
                location_id: value,
                city: selectedLocation.city,
                locality: localityValue
            }));
            setSelectedLocationState(selectedLocation.state);
            return;
        }

        setReviewForm(prev => ({ ...prev, [name]: value }));

        if (name === 'company_id') {
            fetchPlans(value);
            fetchLocations(value);
            setSelectedPlan('');
            setReviewForm(prev => ({ ...prev, location_id: '', city: '', locality: '' }));
            setSelectedLocationState('');
        }

        if (e.target.name === 'plan_id') {
            setSelectedPlan(e.target.value);
            const selectedPlanObj = plans.find(p => p._id === e.target.value);
            if (selectedPlanObj?.type_of_service) {
                setReviewForm(prev => ({ ...prev, type: selectedPlanObj.type_of_service }));
            }
        }
    };

    const handleAddReview = async () => {
        if (!reviewForm.company_id || !reviewForm.location_id || !reviewForm.feedback || !reviewForm.city || !reviewForm.locality || !reviewForm.type) {
            enqueueSnackbar('Please select company and location, then fill feedback and type.', { variant: 'warning' });
            return;
        }

        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const reviewData = {
            ...reviewForm,
            user_id: payload.id,
            plan_id: selectedPlan,
            timestamp: new Date().toISOString()
        };
        const res = await fetch('http://localhost:7000/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        if (res.ok) {
            enqueueSnackbar('Review added!', { variant: 'success' });
            setAddReviewOpen(false);
            setReviewForm({
                company_id: '',
                location_id: '',
                feedback: '',
                city: '',
                locality: '',
                type: '',
                price_rating: '',
                service_rating: '',
                speed_rating: '',
                overall_rating: '',
            });
            setLocations([]);
            setSelectedLocationState('');            setSelectedPlan('');
            fetchReviews(payload.id, selectedCompany, timePeriod);
        } else {
            enqueueSnackbar('Failed to add review.', { variant: 'error' });
        }
    };

    // Open dialog and prefill form
    const handleUpdateReview = (reviewId) => {
        const review = reviews.find(r => r._id === reviewId);
        if (!review) return;
        setEditReviewId(reviewId);
        setEditReviewForm({
            feedback: review.feedback || '',
            price_rating: review.price_rating || '',
            service_rating: review.service_rating || '',
            speed_rating: review.speed_rating || '',
            overall_rating: review.overall_rating || ''
        });
        setEditReviewOpen(true);
    };

    // Handle form change
    const handleEditReviewFormChange = (e) => {
        setEditReviewForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Submit PATCH to backend
    const handleEditReviewSubmit = async () => {
        const res = await fetch(`http://localhost:7000/review/${editReviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editReviewForm)
        });
        if (res.ok) {
            enqueueSnackbar('Review updated!', { variant: 'success' });
            setEditReviewOpen(false);
            setEditReviewId(null);
            fetchReviews(null, selectedCompany, timePeriod);
        } else {
            enqueueSnackbar('Failed to update review.', { variant: 'error' });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const res = await fetch(`http://localhost:7000/review/${reviewId}`, { method: 'DELETE' });
        if (res.ok) {
            enqueueSnackbar('Review deleted!', { variant: 'success' });
            fetchReviews(null, selectedCompany, timePeriod);
        } else {
            enqueueSnackbar('Failed to delete review.', { variant: 'error' });
        }
    };

    return (
        <Box display="flex" p={2}>
            {/* Left: Statistics and Add Review */}
            <Box width="30%" mr={2}>
                <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                    <Typography variant="h6">Statistics</Typography>
                    <Divider style={{ margin: '10px 0' }} />
                    <Typography>Number of reviews added: {stats.numReviews}</Typography>
                    <Typography>Number of companies reviewed: {stats.numCompanies}</Typography>
                </Paper>
                <Paper elevation={2} style={{ padding: 20 }}>
                    <Typography variant="h6">Add Review</Typography>
                    <Divider style={{ margin: '10px 0' }} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Company</InputLabel>
                        <Select name="company_id" value={reviewForm.company_id} onChange={handleReviewFormChange} required>
                            {companies.map(c => (
                                <MenuItem key={c._id} value={c._id}>{c.name || c.email}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" disabled={!reviewForm.company_id}>
                        <InputLabel>Location</InputLabel>
                        <Select name="location_id" value={reviewForm.location_id} onChange={handleReviewFormChange} required>
                            {locations.map(loc => (
                                <MenuItem key={loc._id} value={loc._id}>
                                    {`${loc.address_line1}, ${loc.city}, ${loc.state}, ${loc.pincode}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Plans dropdown appears after company is selected */}
                    {plans.length > 0 && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Plan</InputLabel>
                            <Select name="plan_id" value={selectedPlan} onChange={handleReviewFormChange} required>
                                {plans.map(p => (
                                    <MenuItem key={p._id} value={p._id}>{p.plan_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField name="feedback" label="Feedback" fullWidth margin="normal" value={reviewForm.feedback} onChange={handleReviewFormChange} required />
                    <TextField name="city" label="City" fullWidth margin="normal" value={reviewForm.city} InputProps={{ readOnly: true }} required />
                    <TextField name="state" label="State" fullWidth margin="normal" value={selectedLocationState} InputProps={{ readOnly: true }} required />
                    <TextField name="locality" label="Locality" fullWidth margin="normal" value={reviewForm.locality} InputProps={{ readOnly: true }} required />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Type</InputLabel>
                        <Select name="type" value={reviewForm.type} onChange={handleReviewFormChange}>
                            {reviewTypeOptions.map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField name="price_rating" label="Price Rating" type="number" fullWidth margin="normal" value={reviewForm.price_rating} onChange={handleReviewFormChange} required />
                    <TextField name="service_rating" label="Service Rating" type="number" fullWidth margin="normal" value={reviewForm.service_rating} onChange={handleReviewFormChange} required />
                    <TextField name="speed_rating" label="Speed Rating" type="number" fullWidth margin="normal" value={reviewForm.speed_rating} onChange={handleReviewFormChange} required />
                    <TextField name="overall_rating" label="Overall Rating" type="number" fullWidth margin="normal" value={reviewForm.overall_rating} onChange={handleReviewFormChange} required />
                    <Button variant="contained" color="primary" fullWidth style={{ marginTop: 10 }} onClick={handleAddReview}>Add Review</Button>
                </Paper>
            </Box>
            {/* Right: Reviews List with Filters */}
            <Box width="70%">
                <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                    <Typography variant="h6">Reviews</Typography>
                    <Box display="flex" mb={2} alignItems="center">
                        <FormControl style={{ minWidth: 200, marginRight: 20 }}>
                            <InputLabel>Company</InputLabel>
                            <Select name="company" value={pendingCompany} onChange={handleFilterChange}>
                                <MenuItem value="">All</MenuItem>
                                {companies.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name || c.email}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl style={{ minWidth: 150, marginRight: 20 }}>
                            <InputLabel>Time Period</InputLabel>
                            <Select name="time" value={pendingTimePeriod} onChange={handleFilterChange}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="week">Last Week</MenuItem>
                                <MenuItem value="month">Last Month</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
                    </Box>
                    <Box style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {reviews.map(r => (
                            <Paper key={r._id} elevation={1} style={{ padding: 10, marginBottom: 10 }}>
                                <Typography variant="subtitle1"><strong>Company:</strong> {companyMap[r.company_id] || r.company_id}</Typography>
                                <Typography variant="body2"><strong>Feedback:</strong> {r.feedback}</Typography>
                                <Typography variant="body2"><strong>City:</strong> {r.city} | <strong>Locality:</strong> {r.locality}</Typography>
                                <Typography variant="body2"><strong>Type:</strong> {r.type}</Typography>
                                <Typography variant="body2"><strong>Date:</strong> {new Date(r.date).toLocaleString()}</Typography>
                                <Box display="flex" justifyContent="flex-end" mt={1}>
                                    <Button variant="outlined" color="primary" size="small" style={{ marginRight: 8 }} onClick={() => handleUpdateReview(r._id)}>Update</Button>
                                    <Button variant="outlined" color="secondary" size="small" onClick={() => handleDeleteReview(r._id)}>Delete</Button>
                                </Box>
            {/* Edit Review Dialog */}
            <Dialog open={editReviewOpen} onClose={() => setEditReviewOpen(false)}>
                <DialogTitle>Edit Review</DialogTitle>
                <DialogContent>
                    <TextField name="feedback" label="Feedback" fullWidth margin="normal" value={editReviewForm.feedback} onChange={handleEditReviewFormChange} required />
                    <TextField name="price_rating" label="Price Rating" type="number" fullWidth margin="normal" value={editReviewForm.price_rating} onChange={handleEditReviewFormChange} required />
                    <TextField name="service_rating" label="Service Rating" type="number" fullWidth margin="normal" value={editReviewForm.service_rating} onChange={handleEditReviewFormChange} required />
                    <TextField name="speed_rating" label="Speed Rating" type="number" fullWidth margin="normal" value={editReviewForm.speed_rating} onChange={handleEditReviewFormChange} required />
                    <TextField name="overall_rating" label="Overall Rating" type="number" fullWidth margin="normal" value={editReviewForm.overall_rating} onChange={handleEditReviewFormChange} required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditReviewOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleEditReviewSubmit} color="primary" variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
                            </Paper>
                        ))}
                        {reviews.length === 0 && <Typography>No reviews found.</Typography>}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );

}
export default CustomerHome;
