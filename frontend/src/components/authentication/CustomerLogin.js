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
    email: "",
    password: ""
};

const CustomerLogin = ({ open, setOpen }) => {
    const [values, setValues] = useState(initialValues);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            enqueueSnackbar('Logging in...', { variant: 'info', key: 'verifying' });
            const response = await fetch('http://localhost:7000/reviewer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const responseData = await response.json();
            closeSnackbar('verifying');
            enqueueSnackbar('Login successful!', { variant: 'success' });
            localStorage.setItem('token', responseData.token);
            navigate('/customer-home');
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error', key: 'err_customer_login' });
            setTimeout(() => closeSnackbar('err_customer_login'), 6000);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-customer-login">
            <DialogTitle id="form-dialog-customer-login">Customer Login</DialogTitle>
            <DialogContent>
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
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant='contained' color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} variant='contained' color="primary">Login</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerLogin;
