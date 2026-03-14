import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from "@mui/styles/useTheme";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const Logout = ({ open, setOpen, setLoggedIn, setDrawerOpen, setTitle, setToken }) => {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleClose = () => setOpen(false);

    const handleSubmit = () => {
        // Close overlays first for a clean transition.
        setDrawerOpen(false);
        setOpen(false);

        enqueueSnackbar('Logging out...', { variant: 'info', autoHideDuration: 1200 });

        // Clear auth and route in one step to avoid timing races.
        localStorage.removeItem('token');
        setLoggedIn(false);
        if (setTitle) setTitle('RaterNet');
        if (setToken) setToken(null);

        navigate('/login', { replace: true });
        enqueueSnackbar('Logged out successfully!', { variant: 'success', autoHideDuration: 2000 });
    }

    return (
        <div>
             <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-logout">
                <DialogTitle id="form-dialog-logout">Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ color: theme.palette.text.primary }}>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="outlined" color="primary">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Logout;