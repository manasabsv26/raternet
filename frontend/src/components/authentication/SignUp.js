import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {SignUpUser} from "../../redux/actions/auth"
import formValidation from '../utils/formValidation';

const initialValues = {
    asnNo : "",
    company_email : "",
    company_password : "",
    company_password_confirm : "",
    ISP_name : "",
    type_of_service : "",
    photoUrl : "",
    webUrl : ""
}

const fieldsValidation = {
    asnNo : {
        error: "",
        validate: "string",
        minLength : 7,
        maxLength : 10
    },
    company_email : {
        error: "",
        validate: "email"
    },
    company_password : {
        error: "",
        validate: "string",
        minLength : 6,
        maxLength : 10
    },
    company_password_confirm : {
        error: "",
        validate: "string",
        minLength : 6,
        maxLength : 10
    },
    ISP_name: {
        error: "",
        validate: "text",
        minLength: 2,
        maxLength: 20
    },
    type_of_service : {
        error: "",
        validate: "text"
    },
    photoUrl : {
        error: "",
        validate: "text"
    },
    webUrl : {
        error: "",
        validate: "text",
        minLength: 2,
        maxLength: 100
    }
}


const SignUp = ({ open, setOpen }) => {
    const [values, setValues] = useState(initialValues);
    const [stage, setStage] = useState(0);
    const [url,setUrl] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [errors, setErrors] = useState({})
    const [visible, setVisible] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleClose = () => setOpen(false);
    

    const handleChange=(e)=>{
        const { name, value } = e.target
        // Set values
        setValues(prev => ({
          ...prev,
          [name]: value
        }))
    
        // set errors
        const error = formValidation(name, value, fieldsValidation) || ""
    
        setErrors(prev => ({
          ...prev,
          [name]: error
        }))
    }

    const handlefileUpload = (event)=>{
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);

        reader.onloadend = function () {
            setUrl([reader.result]);
        }.bind(this);
       
        setValues(prev => ({
          ...prev,
          image : event.target.files[0]
        }))
    }
    

    useEffect(() => {
        setStage(0);
    }, [open])


    const handleSubmit = async () => {
        try {
            enqueueSnackbar('Signing up...', { variant: 'info', key: 'verifying' });

            // Example signup data
            const signupData = {
                name: values.ISP_name,
                email: values.company_email,
                password: values.company_password,
                photo: values.photoUrl,
                asn: values.asnNo,
                contact: values.contactNo,
                services: values.services,
                webURL: values.webUrl
            };

            // Sending data to the backend
            const response = await fetch('http://localhost:7000/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }

            const responseData = await response.json();

            closeSnackbar('verifying');

            enqueueSnackbar('Signup successful!', { variant: 'success' });

            // Store token if needed
            localStorage.setItem('token', responseData.token);
            setValues(initialValues);
            setStage(0);
            setOpen(false);
            navigate('/');

        } catch (error) {
            setTimeout(() => enqueueSnackbar(error.message, {
                variant: 'error',
                key: 'err_asn'
            }), 3000);

            setTimeout(() => closeSnackbar('err_asn'), 6000);
        }
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-login">
                <DialogTitle id="form-dialog-login">
                    {stage===0 ? 'Sign Up Details' : 'Company Details'}
                </DialogTitle>
                <DialogContent>
                    {stage===0?(
                        <React.Fragment>
                            <TextField
                                name="company_email"
                                variant="outlined"
                                label="Email Address"
                                type="email"
                                value={values.company_email}
                                margin="normal"
                                error={!!errors.company_email}
                                helperText={errors.company_email}
                                onChange={handleChange}
                                fullWidth
                                autoFocus
                                required
                            />
                            <TextField
                                name="company_password"
                                variant="outlined"
                                label="Password"
                                margin="normal"
                                value={values.company_password}
                                type={visible? "text":"password"}
                                error={!!errors.company_password}
                                helperText={errors.company_password}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment:
                                        <IconButton
                                            aria-label="Toggle visibility"
                                            onClick={() => setVisible(!visible)}
                                        >
                                            {visible? <Visibility /> : <VisibilityOff /> }
                                        </IconButton>
                                }}
                                fullWidth
                                autoFocus
                                required
                            />
                            <TextField
                                name="company_password_confirm"
                                variant="outlined"
                                label="Confirm Password"
                                margin="normal"
                                error={!!errors.company_password_confirm}
                                helperText={errors.company_password_confirm}
                                type={visible? "text":"password"}
                                value={values.company_password_confirm}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment:
                                        <IconButton
                                            aria-label="Toggle visibility"
                                            onClick={() => setVisible(!visible)}
                                        >
                                            {visible? <Visibility /> : <VisibilityOff /> }
                                        </IconButton>
                                }}
                                fullWidth
                                autoFocus
                                required
                            />
                        </React.Fragment>
                    ):(
                        <React.Fragment>
                            <TextField
                                name="asnNo"
                                variant="outlined"
                                label="Autonomous System Number"
                                type="text"
                                margin="normal"
                                value={values.asnNo}
                                onChange={handleChange}
                                error={!!errors.asnNo}
                                helperText={errors.asnNo}
                                fullWidth
                                autoFocus
                                required
                            />
                            <TextField
                                name="ISP_name"
                                variant="outlined"
                                value={values.ISP_name}
                                label="ISP Company Name"
                                type="text"
                                margin="normal"
                                error={!!errors.ISP_name}
                                helperText={errors.ISP_name}
                                onChange={handleChange}
                                autoFocus
                                fullWidth
                                required/>
                            <TextField
                                name="type_of_service"
                                variant="outlined"
                                label="Type of Service"
                                type="text"
                                value={values.type_of_service}
                                margin="normal"
                                error={!!errors.type_of_service}
                                helperText={errors.type_of_service}
                                onChange={handleChange}
                                autoFocus
                                fullWidth
                                required/>
                             <TextField
                                name="photoUrl"
                                variant="outlined"
                                label="Photo URL"
                                value={values.photoUrl}
                                type="text"
                                margin="normal"
                                onChange={handleChange}
                                autoFocus
                                fullWidth
                                required/>
                             <TextField
                                name="webUrl"
                                variant="outlined"
                                label="ISP Company Website URL"
                                type="text"
                                value={values.webUrl}
                                error={!!errors.webUrl}
                                helperText={errors.webUrl}
                                margin="normal"
                                onChange={handleChange}
                                autoFocus
                                fullWidth
                                required/>
                                <Button
                                    fullWidth={true}
                                    margin="normal"
                                    onClick={() => setStage(stage-1)}
                                    color='primary'
                                    variant='contained'
                                > Back</Button>
                        </React.Fragment>
                    )}
                </DialogContent>
                {stage===0?(
                    <DialogActions>
                        <Button onClick={handleClose} variant='contained' color="secondary">Cancel</Button>
                        <Button onClick={()=>setStage(stage=>(stage+1)%2)} variant='contained' color="primary">Next</Button>
                    </DialogActions>
                ):(
                    <DialogActions>
                        <Button onClick={handleClose} variant='contained' color="secondary">Cancel</Button>
                        <Button onClick={handleSubmit} variant='contained' color="primary">Sign Up</Button>
                    </DialogActions>
                )}
            </Dialog>
        </div>
    );
}

export default SignUp;