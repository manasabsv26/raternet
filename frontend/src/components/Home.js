import React,{useEffect, useState, useRef } from "react";
import {useDispatch,useSelector} from "react-redux";
import {
    Typography,
    Grid,
    TextField,
    Paper,
    Divider,
    Box,
    Button
} from "@mui/material";
import { BarChart,Bar, XAxis, YAxis,CartesianGrid,Tooltip,Legend,LineChart,Line} from 'recharts';
import { jwtDecode } from "jwt-decode";
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import {fetchReviews} from '../redux/actions/reviews'
import Loading from './Loading/Loading'
import Error from './Error/Error';
import Geocode from 'react-geocode';
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

console.log("outside geocode", Geocode)
const mapContainerStyle = {
    width: "100%",
    height: "50vh",
};

const defaultCenter = { lat: 19.076, lng: 72.8777 };



const Home = (props) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [locations, setLocations] = useState([]);
    const [locationCoords, setLocationCoords] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [reviews, setReviews] = useState([]);
    const [barData,setbarData] = React.useState([]);
    const [lineData,setlineData] = React.useState(null)
    const [loading,setLoading] = React.useState(false);
    const [error,setError] = React.useState(null);
    const [services,setServices] = React.useState({});


    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_API_URL,
    });

    const baseUrl = "http://localhost:7000"; 

    // Reference Profile.js: fetch locations and set first location as default
    const fetchLocationsDropdown = async (company_id) => {
        try {
            const response = await axios.get(`${baseUrl}/locations/options/${company_id}`);
            const locs = response.data.data.locations;
            setLocations(locs);
            if (locs && locs.length > 0) {
                const locationString = `${locs[0].address_line1}, ${locs[0].city}, ${locs[0].state}, ${locs[0].pincode}`;
                setSelectedLocation(locationString);
            } else {
                setSelectedLocation("");
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };
    

    // Only fetch coordinates for map, not for dropdown
    const setInitialLocation = async (userId) => {
        try {
            const response = await axios.get(`${baseUrl}/locations/options/${userId}`);
            const locs = response.data.data.locations;
            if (!locs || locs.length === 0) {
                setLocationCoords([defaultCenter]);
                return [defaultCenter];
            }
            Geocode.setApiKey(process.env.REACT_APP_API_URL);
            Geocode.setLanguage("en");
            const locationPromises = locs.map(async (location) => {
                const address = `${location.address_line1}, ${location.city}, ${location.state}, ${location.pincode}`;
                try {
                    const geoResponse = await Geocode.fromAddress(address);
                    const { lat, lng } = geoResponse.results[0].geometry.location;
                    return { lat, lng };
                } catch (error) {
                    return null;
                }
            });
            const coordinates = (await Promise.all(locationPromises)).filter(coord => coord !== null);
            setLocationCoords(coordinates);
            return coordinates;
        } catch (error) {
            setLocationCoords([defaultCenter]);
            return [defaultCenter];
        }
    };
    
    const renderReviews = () => {
        if (!reviews || reviews.length === 0) {
            return <Typography variant="h6" color="textSecondary">No reviews available.</Typography>;
        }
    
        return (
            <React.Fragment>
                {reviews.filter(review => review.locality === selectedLocation).map(review => (
                    <Paper key={review._id} elevation={2} style={{ margin: 10, padding: 10 }}>
                        <Typography variant='h5'>{review.isp_Name}</Typography>
                        <Typography variant='h5' color='textSecondary'>{review.locality}</Typography>
                        <Divider fullWidth />
                        <Typography variant="h6">{review.feedback}</Typography>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Rating name="read-only" value={review.overallRating} readOnly />
                            <Button variant='contained' color='primary'>Know More</Button>
                        </div>
                    </Paper>
                ))}
            </React.Fragment>
        );
    };

    const renderServices = () => {
        return (
            <div style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Chip 
                    size='medium' 
                    label={`WiFi: ${isNaN(services['WiFi']) ? 0 : services['WiFi']}%`} 
                    color='secondary' 
                />
                <Chip 
                    size='medium' 
                    label={`Data: ${isNaN(services['Data']) ? 0 : services['Data']}%`} 
                    color='secondary' 
                />
                <Chip 
                    size='medium' 
                    label={`BroadBand: ${isNaN(services['Broadband']) ? 0 : services['Broadband']}%`} 
                    color='secondary' 
                />
            </div>
        );
    };
    
   
    const getReviews = async (asn,location)=>{
        try{
          const reviews = await fetchReviews(asn,location);
          displayData(reviews);
          setLoading(false)
        } catch(e){
          setError(e.message);
          setLoading(false);
        }
    }

    useEffect(() => {
        const fetchReviews = async (locationStr) => {
            if (token) {
                try {
                    const user = jwtDecode(token);
                    const data = await getReviews(user.id, locationStr);
                    setReviews(data);
                } catch (error) {
                    console.error('Error fetching reviews:', error);
                }
            } else {
                navigate('/login');
            }
        };

        const fetchAll = async () => {
            if (token) {
                try {
                    const user = jwtDecode(token);
                    await fetchLocationsDropdown(user.id);
                    await setInitialLocation(user.id);
                } catch (error) {
                    console.error('Error fetching locations');
                }
            } else {
                navigate('/login');
            }
        };

        fetchAll();
    }, [token, navigate]);

    // Fetch reviews when selectedLocation changes
    useEffect(() => {
        if (selectedLocation) {
            const fetchReviewsForLocation = async () => {
                if (token) {
                    try {
                        const user = jwtDecode(token);
                        const data = await getReviews(user.id, selectedLocation);
                        setReviews(data);
                    } catch (error) {
                        console.error('Error fetching reviews:', error);
                    }
                }
            };
            fetchReviewsForLocation();
        }
    }, [selectedLocation, token]);
    const displayData = () => {
        let averages = {
            overallRating: 0,
            priceRating: 0,
            speedRating: 0,
            serviceRating: 0
        };
        let service = {
            'WiFi': 0,
            'Broadband': 0,
            'Data': 0
        };
        let noofUsers = {};
        let data1 = [];
        let data2 = [];
        let ratings = reviews || [];
    
        if (ratings.length === 0) {
            //
            data1 = [
                { name: 'overallRating', ratings: 0 },
                { name: 'priceRating', ratings: 0 },
                { name: 'speedRating', ratings: 0 },
                { name: 'serviceRating', ratings: 0 }
            ];
    
            data2 = [{ name: 'No Data', users: 0 }];
            service = { 'WiFi': 0, 'Broadband': 0, 'Data': 0 };
    
            setbarData(data1);
            setlineData(data2);
            setServices(service);
            return; //Exit early since there's no data to process
        }
    
        //Calculate averages and user counts if reviews exist
        ratings.forEach(review => {
            averages.overallRating += Number(review.overallRating);
            averages.priceRating += Number(review.priceRating);
            averages.speedRating += Number(review.speedRating);
            averages.serviceRating += Number(review.serviceRating || 0);
            service[review.type] += 1;
            noofUsers[review.reviewDate] = noofUsers.hasOwnProperty(review.reviewDate)
                ? noofUsers[review.reviewDate] + 1
                : 1;
        });
    
        //Prepare data for Bar Chart
        for (let key in averages) {
            averages[key] /= ratings.length;
            data1.push({
                name: key,
                ratings: isNaN(averages[key]) ? 0 : averages[key] // ✅ Handle NaN
            });
        }
    
        // ✅ Prepare data for Line Chart
        for (let key in noofUsers) {
            data2.push({
                name: key,
                users: noofUsers[key]
            });
        }
    
        // ✅ Calculate service usage percentages
        for (let key in service) {
            service[key] = ratings.length ? (service[key] * 100) / ratings.length : 0;
        }
    
        setbarData(data1);
        setlineData(data2);
        setServices(service);
    };    
    
    const handleLocChange = (e)=>setSelectedLocation(e.target.value);
    const handleSearch = async ()=>{
        if (!selectedLocation) {
            console.log("No location selected!");
            return;
        }
        // This will trigger useEffect to fetch reviews for selectedLocation
        setSelectedLocation(selectedLocation);
    }

    if(error){
        return <Error message = {error}/>
    }

    if(loading){
        return <Loading message = "Loading Your Plans"/>
    }

    if (loadError) {
        return <Typography color="error">Error loading Google Maps</Typography>;
    }

    return (
        <Grid container justify="center" spacing={2}>
            <Grid item xs={6}>
                <Grid container spacing={2} style={{marginTop : 10}} >
                    <div style={{
                        width : '100%',
                        display:'flex',
                        justifyContent : 'space-between'
                    }}>
                        {/* Dropdown for Selecting Location */}
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Select Location</InputLabel>
                            <Select
                                defaultValue=""
                                value={selectedLocation || ""}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                label="Select Location"
                            >
                                {locations && locations.length > 0 ? (
                                    locations.map((location, index) => {
                                        const locationString = location.address_line1 && location.city && location.state && location.pincode
                                            ? `${location.address_line1}, ${location.city}, ${location.state}, ${location.pincode}`
                                            : "Invalid Location";

                                        return (
                                            <MenuItem 
                                                key={index} 
                                                value={locationString}
                                            >
                                                {locationString}
                                            </MenuItem>
                                        );
                                    })
                                ) : (
                                    <MenuItem disabled>No Locations Available</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {/* Search Button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={!selectedLocation} // Prevent searching if no location is selected
                            style={{ marginLeft: 10 }}
                        >
                            Search
                        </Button>
                    </div>
                    
                    <Grid item xs={12} style={{ position: "relative", height: "50vh" }}>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                zoom={10}
                                center={locationCoords[0] || defaultCenter}
                            >
                                {Array.isArray(locationCoords) && locationCoords.map((coord, index) => (
                                    <Marker key={index} position={coord} />
                                ))}
                            </GoogleMap>
                        ) : (
                            <Typography>Loading Map...</Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} style={{position: 'relative',marginTop : 20}}>
                        <Box elevation={1} style={{padding:20,height: '45vh',overflow:'auto',scrollBehavior : 'smooth'}}>
                            {renderReviews()}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <Paper elevation={2} style={{padding: 30,margin : 10}} justify="center">
                <Typography variant="h4">
                    {reviews && reviews.length > 0
                        ? `${((reviews.filter(review => review.locality === selectedLocation).length / reviews.length) * 100).toFixed(1)}% Users in ${selectedLocation}`
                        : `No users in ${selectedLocation}`}
                </Typography>
                    <br></br>
                    <Divider/>
                    <br></br>
                    {renderServices()}
                </Paper>
                <br></br>
                <Paper elevation={2} style={{padding: 10,margin : 10}} justify="center">       
                <BarChart width={600} height={250} data={barData.length > 0 ? barData : [{ name: 'No Data', ratings: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} /> {/* Set Y-axis to 5 for ratings out of 5 */}
                    <Tooltip />
                    <Bar dataKey="ratings" fill={barData.length > 0 ? "#64b5f6" : "#ccc"} />
                </BarChart>
                </Paper>
                <br></br>
                <Paper elevation={2} style={{padding: 10,margin : 10}} justify="center">  
                        {lineData && lineData.length > 1 ? (
                            <LineChart 
                                width={600} 
                                height={250} 
                                data={lineData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="#ffc107" 
                                    activeDot={{ r: 8 }} 
                                />
                            </LineChart>
                        ) : (
                            <div style={{
                                width: '600px',
                                height: '250px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#333',  // Match chart background
                                borderRadius: '8px',
                                color: '#8884d8',
                                fontSize: '18px'
                            }}>
                                No User Data Available
                            </div>
                        )}
                </Paper> 
            </Grid>
        </Grid>
    )
}

export default Home;