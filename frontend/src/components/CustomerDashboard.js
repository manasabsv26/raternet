import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Rating,
    Divider
} from '@mui/material';
import { useSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const typeOptions = ['All', 'WiFi', 'Fiber/Broadband', 'Data', 'Mobile Prepaid', 'Mobile Postpaid'];

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [type, setType] = useState('All');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.type !== 'customer') {
            enqueueSnackbar('Unauthorized: Only customers can access this page.', { variant: 'error' });
            navigate('/');
        }
    }, [navigate, enqueueSnackbar]);

    const searchSummary = useMemo(() => {
        if (!city && !pincode && type === 'All') return 'Search by city, pin code, and type.';
        return `${results.length} result${results.length === 1 ? '' : 's'} found`;
    }, [city, pincode, type, results.length]);

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (city.trim()) params.append('city', city.trim());
        if (pincode.trim()) params.append('pincode', pincode.trim());
        if (type !== 'All') params.append('type', type);
        return params.toString();
    };

    const handleSearch = async () => {
        if (!city.trim() && !pincode.trim() && type === 'All') {
            enqueueSnackbar('Enter city or pin code or choose type to search.', { variant: 'warning' });
            return;
        }
        setLoading(true);
        try {
            const query = buildQuery();
            const response = await fetch(`http://localhost:7000/locations/search?${query}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to search companies');
            }
            setResults(data?.data?.results || []);
            if ((data?.data?.results || []).length === 0) {
                enqueueSnackbar('No matching ISP locations found.', { variant: 'info' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Search failed', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={2}>
            <Typography variant='h5' gutterBottom>
                Discover ISPs by Area
            </Typography>
            <Typography variant='body2' color='textSecondary' gutterBottom>
                Match by city words and similar pin prefixes.
            </Typography>

            <Box display='flex' flexWrap='wrap' gap={2} mt={2} mb={2}>
                <TextField
                    label='City'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ minWidth: 220 }}
                />
                <TextField
                    label='Pin Code'
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ minWidth: 160 }}
                />
                <FormControl style={{ minWidth: 210 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                        {typeOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant='contained'
                    color='primary'
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </Box>

            <Typography variant='subtitle2' color='textSecondary' style={{ marginBottom: 12 }}>
                {searchSummary}
            </Typography>

            <Grid container spacing={2}>
                {results.map(item => (
                    <Grid item xs={12} md={6} lg={4} key={item.key}>
                        <Card
                            variant='outlined'
                            onClick={() => setSelectedCard(item)}
                            style={{ cursor: 'pointer', height: '100%' }}
                        >
                            <CardContent>
                                <Typography variant='h6' gutterBottom>{item.company_name}</Typography>
                                <Typography variant='body2' color='textSecondary'>{item.location_label}</Typography>
                                <Box mt={1} mb={1} display='flex' flexWrap='wrap' gap={1}>
                                    {(item.service_types || []).map(service => (
                                        <Chip key={service} label={service} size='small' color='secondary' />
                                    ))}
                                </Box>
                                <Box display='flex' alignItems='center' gap={1}>
                                    <Rating readOnly precision={0.1} value={Number(item.avg_overall_rating) || 0} />
                                    <Typography variant='body2'>
                                        {Number(item.avg_overall_rating || 0).toFixed(1)} overall
                                    </Typography>
                                </Box>
                                <Typography variant='caption' color='textSecondary'>
                                    {item.feedback_count} feedback{item.feedback_count === 1 ? '' : 's'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={Boolean(selectedCard)}
                onClose={() => setSelectedCard(null)}
                fullWidth
                maxWidth='md'
            >
                <DialogTitle>
                    {selectedCard?.company_name} - {selectedCard?.location_label}
                </DialogTitle>
                <DialogContent dividers>
                    {(selectedCard?.feedbacks || []).length === 0 && (
                        <Typography>No feedback yet for this company and location.</Typography>
                    )}
                    {(selectedCard?.feedbacks || []).map(item => (
                        <Box key={item.id} mb={2}>
                            <Typography variant='body1'>{item.feedback}</Typography>
                            <Box display='flex' alignItems='center' gap={2} mt={0.5}>
                                <Chip size='small' label={item.type} />
                                <Rating readOnly value={Number(item.overall_rating) || 0} size='small' />
                                <Typography variant='caption' color='textSecondary'>
                                    {item.date ? new Date(item.date).toLocaleString() : ''}
                                </Typography>
                            </Box>
                            <Divider style={{ marginTop: 10 }} />
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCard(null)} color='primary'>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomerDashboard;
