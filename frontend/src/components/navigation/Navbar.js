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
        display: 'none',
        [theme.breakpoints.up('md')]: {
          display: 'flex',
        }
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
    }
}))

const Navbar = ()=>{
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(true);
    const [signUp, setSignUp] = React.useState(false);
    const [logout, setLogout] = React.useState(false);
    const [title,setTitle] = React.useState("");
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
        } else{
            let user = jwtDecode(token);
            navigate('/');
            setLoggedIn(true)
            setTitle(user.asn)
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
                    <Typography variant="h6" noWrap href='/'>{title}</Typography>
                    <div className={classes.space}/>
                    <div className={classes.grow}/>
                    <IconButton edge='end' className={classes.themer} onClick={toggleTheme}>
                        {dark ? <Brightness7/>: <Brightness4/>}
                    </IconButton>
                    {loggedIn ? 
                    <div className={classes.sectionDesktop}>
                        <Button variant="outlined" color="inherit" className="logout-btn" onClick={() => setLogout(true)}>Logout</Button>
                    </div> : 
                     <div className={classes.sectionDesktop}>
                        <Button variant="outlined" color="inherit" onClick={() => setSignUp(signUp=>!signUp)}>SignUp</Button>
                    </div>}
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
                        {loggedIn ?  <ListItem button key={'Home'} onClick={() => {
                            navigate('/');
                            setOpen(false);
                        }}>
                            <ListItemIcon> <AccountCircle/></ListItemIcon>
                            <ListItemText primary={'Home'} />
                        </ListItem>: null}
                        {loggedIn ?  <ListItem button key={'Profile'} onClick={() => {
                            navigate('/profile');
                            setOpen(false);
                        }}>
                            <ListItemIcon> <AccountCircle/></ListItemIcon>
                            <ListItemText primary={'Profile'} />
                        </ListItem>: null}
                        {loggedIn ?  <ListItem button key={'Plans'} onClick={() => {
                            navigate('/plans');
                            setOpen(false);
                        }}>
                            <ListItemIcon><FeedbackIcon/></ListItemIcon>
                            <ListItemText primary={'Plans'}/>
                        </ListItem>: null}
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
            <Logout open={logout} setOpen={setLogout} setLoggedIn={setLoggedIn} setDrawerOpen={setOpen} setTitle={setTitle}/>
            <SignUp open={signUp} setOpen={setSignUp} setTitle={setTitle}/>
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
                        <Login setloggedIn={setLogin} setToken={setToken} />
                    }/>
                    <Route exact path='/profile' element={<Profile />}/>
                    <Route exact path='/plans' element={<Plans />}/>
                </Routes>
            </main>
            
        </div>
        <Footer/>
        </div>
    )
} 

export default Navbar;
