import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const initialValues = {
    name: "",
    email: "",
    password: "",
    phone: ""
};

const CustomerSignUp = ({ open, setOpen }) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            enqueueSnackbar('Signing up...', { variant: 'info', key: 'verifying' });
            const response = await fetch('http://localhost:7000/reviewer/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }
            const responseData = await response.json();
            closeSnackbar('verifying');
            enqueueSnackbar('Signup successful!', { variant: 'success' });
            localStorage.setItem('token', responseData.token);
            setValues(initialValues);
            setOpen(false);
            navigate('/customer-home');
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error', key: 'err_customer_signup' });
            setTimeout(() => closeSnackbar('err_customer_signup'), 6000);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-customer-signup">
            <DialogTitle id="form-dialog-customer-signup">Customer Sign Up</DialogTitle>
            <DialogContent>
                <TextField
                    name="name"
                    label="Name"
                    variant="outlined"
                    margin="normal"
                    value={values.name}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    name="password"
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    name="phone"
                    label="Phone Number"
                    variant="outlined"
                    margin="normal"
                    value={values.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant='contained' color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} variant='contained' color="primary">Sign Up</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerSignUp;
