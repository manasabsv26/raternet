import React,{useState} from 'react';
import Button from '@mui/material/Button';
import {Grid,Paper,Typography} from '@mui/material'
import { useSnackbar } from "notistack";
import TextField from '@mui/material/TextField';
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ThemeContext} from "../../context/ThemeContext";
import { makeStyles } from '@mui/styles';
import formValidation from '../utils/formValidation';
import { useNavigate } from "react-router-dom";


const useStyles = makeStyles(theme=>({
    logo : {
        [theme.breakpoints.down('md')] : {
            display : 'none'
        }
    },
    paper :{
        padding : 30,
        borderRadius: 14,
        border: `1px solid ${theme.palette.divider}`,
        [theme.breakpoints.up('md')] : {
            marginLeft:30,
            marginRight:30
        }
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: 600,
    },
    helperText: {
        color: theme.palette.text.secondary,
    },
    logoImg: {
        maxWidth: '90%',
        height: 'auto',
        marginTop: 36,
    }
}))

const fieldsValidation = {
    email : {
        error: "",
        validate: "email"
    },
    password : {
        error: "",
        validate: "string",
        minLength : 0
    },
}

const Login = ({ setloggedIn, setToken, onOpenCompanySignUp, onOpenCustomerSignUp }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const {dark} = React.useContext(ThemeContext);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    // Company login state
    const [companyValues, setCompanyValues] = useState({
        email: "",
        password: "",
    });
    const [companyErrors, setCompanyErrors] = useState({})
    const [companyVisible, setCompanyVisible] = useState(false);

    // Customer login state
    const [customerValues, setCustomerValues] = useState({
        email: "",
        password: "",
    });
    const [customerErrors, setCustomerErrors] = useState({})
    const [customerVisible, setCustomerVisible] = useState(false);


    // Company login field change
    const handleCompanyChange=(e)=>{
        const { name, value } = e.target
        setCompanyValues(prev => ({ ...prev, [name]: value }))
        const error = formValidation(name, value, fieldsValidation) || ""
        setCompanyErrors(prev => ({ ...prev, [name]: error }))
    }

    // Customer login field change
    const handleCustomerChange=(e)=>{
        const { name, value } = e.target
        setCustomerValues(prev => ({ ...prev, [name]: value }))
        const error = formValidation(name, value, fieldsValidation) || ""
        setCustomerErrors(prev => ({ ...prev, [name]: error }))
    }


    // Company login submit
    const handleCompanySubmit = async () => {
        if (companyErrors.emailError || companyErrors.passwordError) {
            return;
        } else {
            enqueueSnackbar('Logging in...', { variant: 'info', key: 'logging_in' });
            try {
                const response = await fetch('http://localhost:7000/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: companyValues.email,
                        password: companyValues.password
                    })
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message || 'Invalid Credentials');
                }
                closeSnackbar('logging_in');
                enqueueSnackbar('Logged in Successfully!', { variant: 'success', key: 'logged_in' });
                localStorage.setItem('token', responseData.token);
                setloggedIn();
                setToken(responseData.token);
                navigate('/');
            } catch (e) {
                closeSnackbar('logging_in');
                enqueueSnackbar(e.message, { variant: 'error', key: 'error' });
            }
        }
    };

    // Customer login submit
    const handleCustomerSubmit = async () => {
        if (customerErrors.emailError || customerErrors.passwordError) {
            return;
        } else {
            enqueueSnackbar('Logging in...', { variant: 'info', key: 'logging_in_customer' });
            try {
                const response = await fetch('http://localhost:7000/reviewer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: customerValues.email,
                        password: customerValues.password
                    })
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message || 'Invalid Credentials');
                }
                closeSnackbar('logging_in_customer');
                enqueueSnackbar('Logged in Successfully!', { variant: 'success', key: 'logged_in_customer' });
                localStorage.setItem('token', responseData.token);
                setloggedIn();
                setToken(responseData.token);
                navigate('/');
            } catch (e) {
                closeSnackbar('logging_in_customer');
                enqueueSnackbar(e.message, { variant: 'error', key: 'error_customer' });
            }
        }
    };
    
    return (
        <div>
            <Grid container spacing={2} direction="row" alignItems="flex-start">
                <Grid item md={6} xs={12} >
                    <Paper elevation={2} className={classes.paper}>
                        <Typography variant='h6' className={classes.sectionTitle}>Company Login</Typography>
                        <Typography variant='caption' className={classes.helperText}>
                            The company can login into this portal if they have officially registered.
                        </Typography>
                        <TextField
                            name="email"
                            variant="outlined"
                            label="Company Email Address"
                            type="email"
                            value={companyValues.email}
                            margin="normal"
                            onChange={handleCompanyChange}
                            helperText={companyErrors.email}
                            error={!!companyErrors.email}
                            fullWidth
                            required
                        />
                        <TextField
                            name="password"
                            variant="outlined"
                            label="Password"
                            value={companyValues.password}
                            margin="normal"
                            type={companyVisible? "text":"password"}
                            helperText={companyErrors.password}
                            error={!!companyErrors.password}
                            onChange={handleCompanyChange}
                            InputProps={{
                                endAdornment:
                                <IconButton
                                    aria-label="Toggle visibility"
                                    onClick={() => setCompanyVisible(!companyVisible)}
                                >
                                    {companyVisible? <Visibility /> : <VisibilityOff /> }
                                </IconButton>
                            }}
                            fullWidth
                            required
                        />
                        <Button onClick={handleCompanySubmit} color="primary" variant="contained" style={{width:'100%',marginTop:10}}>
                            Company Login
                        </Button>
                        <Typography variant="body2" style={{ marginTop: 12, textAlign: 'center' }}>
                            New company?{' '}
                            <Button color="primary" size="small" onClick={onOpenCompanySignUp}>
                                Sign up
                            </Button>
                        </Typography>
                    </Paper>

                    <Paper elevation={2} className={classes.paper} style={{marginTop: 30}}>
                        <Typography variant='h6' className={classes.sectionTitle}>Customer Login</Typography>
                        <Typography variant='caption' className={classes.helperText}>
                            Customers can login below using their registered email and password.
                        </Typography>
                        <TextField
                            name="email"
                            variant="outlined"
                            label="Customer Email Address"
                            type="email"
                            value={customerValues.email}
                            margin="normal"
                            onChange={handleCustomerChange}
                            helperText={customerErrors.email}
                            error={!!customerErrors.email}
                            fullWidth
                            required
                        />
                        <TextField
                            name="password"
                            variant="outlined"
                            label="Password"
                            value={customerValues.password}
                            margin="normal"
                            type={customerVisible? "text":"password"}
                            helperText={customerErrors.password}
                            error={!!customerErrors.password}
                            onChange={handleCustomerChange}
                            InputProps={{
                                endAdornment:
                                <IconButton
                                    aria-label="Toggle visibility"
                                    onClick={() => setCustomerVisible(!customerVisible)}
                                >
                                    {customerVisible? <Visibility /> : <VisibilityOff /> }
                                </IconButton>
                            }}
                            fullWidth
                            required
                        />
                        <Button onClick={handleCustomerSubmit} color="secondary" variant="contained" style={{width:'100%',marginTop:10}}>
                            Customer Login
                        </Button>
                        <Typography variant="body2" style={{ marginTop: 12, textAlign: 'center' }}>
                            New customer?{' '}
                            <Button color="secondary" size="small" onClick={onOpenCustomerSignUp}>
                                Sign up
                            </Button>
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={6} xs={0} justifyContent="center" className={classes.logo}>
                    {dark ? <img src='rnlogod.png' className={classes.logoImg} alt='RaterNet logo'/> 
                    : <img src='rnlogo.png' className={classes.logoImg} alt='RaterNet logo'/>}
                </Grid>
            </Grid>
        </div>
    );
}

export default Login;