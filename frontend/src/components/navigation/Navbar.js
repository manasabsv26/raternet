import React, {useEffect} from 'react';
import { jwtDecode } from "jwt-decode";
import { makeStyles,useTheme } from '@mui/styles';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import Footer from '../footer/Footer'
import {AccountCircle} from "@mui/icons-material";
import Login from "../authentication/Login";
import SignUp from "../authentication/SignUp";
import CustomerSignUp from "../authentication/CustomerSignUp";
import CustomerHome from "../CustomerHome";
import CompanyProfile from "../authentication/CompanyProfile";
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import Logout from "../authentication/Logout";
import {Routes, Route} from "react-router";
import Home from "../Home";
import About from "../About";
import Plans from "../Plans/Plans"
import {Brightness4, Brightness7} from "@mui/icons-material";
import {ThemeContext} from "../../context/ThemeContext";
import Button from '@mui/material/Button';
import Profile from '../Profile';
import { useNavigate } from "react-router-dom";



const drawerWidth = 240;
const useStyles = makeStyles((theme)=>({
    root : {
        display: 'flex'
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    space : {
        marginRight: theme.spacing(3),
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerContainer: {
        overflow: 'auto',
    },
    sectionDesktop: {
                display: 'flex',
                alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    themer: {
        color: theme.palette.text.primary,
        marginRight : 5
    },
    toolbarActions: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginRight: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            gap: theme.spacing(0.5),
            marginRight: 0,
        },
    },
    logoutButton: {
        whiteSpace: 'nowrap',
        minWidth: 96,
        [theme.breakpoints.down('sm')]: {
            minWidth: 72,
            padding: '4px 8px',
            fontSize: '0.75rem',
        },
    }
}))

const Navbar = ()=>{
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(true);
    const [signUp, setSignUp] = React.useState(false);
    const [customerSignUp, setCustomerSignUp] = React.useState(false);
    const [logout, setLogout] = React.useState(false);
    const [title,setTitle] = React.useState("");
    const [userType, setUserType] = React.useState(null);
    const {dark, toggleTheme} = React.useContext(ThemeContext);
    const [openProfile, setOpenProfile] = React.useState(false);
    const handleProfileClickOpen = () => setOpenProfile(true);
    const handleDrawerToggle = () => setOpen(!open);
    const history = useNavigate();
    const setLogin = ()=>setLoggedIn(loggedIn=>!loggedIn);
    const [token,setToken] = React.useState(localStorage.getItem('token'))

    const navigate = useNavigate();

    useEffect(() => {
        if(token === null) {
            navigate('/login');
            setLoggedIn(false)
            setTitle("RaterNet")
            setUserType(null);
        } else{
            let user = jwtDecode(token);
            setLoggedIn(true)
            setUserType(user.type);
            if (user.type === 'customer') {
                navigate('/customer-home');
                setTitle(user.name || user.email || "Customer");
            } else {
                navigate('/');
                setTitle(user.asn || user.name || "Company");
            }
        }
    }, [token])

    
    return (
        <div>
        <div className={classes.root}>
             <CssBaseline />
             <AppBar position="fixed" className={classes.appBar}>
                <Toolbar variant='dense'>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setOpen(!open)}
                        edge="start"
                        className={classes.menuButton}>
                        <MenuIcon />
                    </IconButton> 
                    {/* Hide title on login page */}
                    {window.location.pathname !== '/login' && (
                        <Typography variant="h6" noWrap href='/'>{title}</Typography>
                    )}
                    <div className={classes.space}/>
                    <div className={classes.grow}/>
                    <div className={classes.toolbarActions}>
                        <IconButton edge='end' className={classes.themer} onClick={toggleTheme}>
                            {dark ? <Brightness7/>: <Brightness4/>}
                        </IconButton>
                        {loggedIn ? 
                        <div className={classes.sectionDesktop}>
                            <Button variant="outlined" color="inherit" className={classes.logoutButton} onClick={() => setLogout(true)}>Logout</Button>
                        </div> : 
                        null}
                    </div>
                </Toolbar>
             </AppBar>
             <Drawer
                className={classes.drawer}
                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                open={open}
                onClose={handleDrawerToggle}
                classes={{
                    paper: classes.drawerPaper,
                }}>
                <Toolbar variant='dense' />
                <div className={classes.drawerContainer}>
                    <List>
                        {/* Only show Home, Profile, Plans for company users */}
                        {loggedIn && userType !== 'customer' ? (
                            <>
                                <ListItem button key={'Home'} onClick={() => {
                                    navigate('/');
                                    setOpen(false);
                                }}>
                                    <ListItemIcon> <AccountCircle/></ListItemIcon>
                                    <ListItemText primary={'Home'} />
                                </ListItem>
                                <ListItem button key={'Profile'} onClick={() => {
                                    navigate('/profile');
                                    setOpen(false);
                                }}>
                                    <ListItemIcon> <AccountCircle/></ListItemIcon>
                                    <ListItemText primary={'Profile'} />
                                </ListItem>
                                <ListItem button key={'Plans'} onClick={() => {
                                    navigate('/plans');
                                    setOpen(false);
                                }}>
                                    <ListItemIcon><FeedbackIcon/></ListItemIcon>
                                    <ListItemText primary={'Plans'}/>
                                </ListItem>
                            </>
                        ) : null}
                        <ListItem button key={'About'} onClick={() => {
                            navigate('/about');
                            setOpen(false);
                        }}>
                            <ListItemIcon><InfoIcon/></ListItemIcon>
                            <ListItemText primary={'About'} />
                        </ListItem>
                    </List>
                    <Divider/>
                </div>
            </Drawer>
            <Logout open={logout} setOpen={setLogout} setLoggedIn={setLoggedIn} setDrawerOpen={setOpen} setTitle={setTitle} setToken={setToken}/>
            <SignUp open={signUp} setOpen={setSignUp} setTitle={setTitle}/>
            <CustomerSignUp open={customerSignUp} setOpen={setCustomerSignUp}/>
            <main style={{
                width : '100%',
                justifyContent : 'center',
                padding : 30,
                alignItems : 'center'
            }}>
                <Toolbar variant='dense'/>
                <Routes>
                    <Route exact path='/' element={<Home />}/>
                    <Route exact path='/about' element={<About />}/>
                    <Route exact path='/login' element={
                        <Login
                            setloggedIn={setLogin}
                            setToken={setToken}
                            onOpenCompanySignUp={() => setSignUp(true)}
                            onOpenCustomerSignUp={() => setCustomerSignUp(true)}
                        />
                    }/>
                    <Route exact path='/profile' element={<Profile />}/>
                    <Route exact path='/plans' element={<Plans />}/>
                    <Route exact path='/customer-home' element={<CustomerHome />} />
                </Routes>
            </main>
            
        </div>
        <Footer/>
        </div>
    )
} 

export default Navbar;
