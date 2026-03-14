import React from 'react';
import * as UI from '@mui/material';
import * as UIIcons from '@mui/icons-material'
import * as UIStyles from '@mui/styles'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { useNavigate } from 'react-router-dom';

const useStyles = UIStyles.makeStyles((theme) => ({
  footer: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(14,20,31,0.98), rgba(11,17,24,0.98))'
      : 'linear-gradient(135deg, rgba(245,249,255,0.95), rgba(234,243,255,0.95))',
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(4, 0, 3),
    width:'100%',
    left: 0,
    bottom: 0,
    zIndex: 2,
    position : 'relative',
    backdropFilter: 'blur(4px)',
    flexShrink : 0
  },
  container: {
    display : 'grid',
    gridTemplateColumns: '1.5fr 1fr auto',
    gap: theme.spacing(3),
    alignItems:'center',
    [theme.breakpoints.down('md')] : {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
    },
  },
  logo :{
      display : 'flex',
      gap: theme.spacing(1),
      alignItems:'center',
      [theme.breakpoints.down('md')]: {
        justifyContent: 'center',
      },
  },
  brandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.12)' : 'rgba(25,118,210,0.12)',
    border: `1px solid ${theme.palette.divider}`,
  },
  brandText: {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  subText: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  grow: {
      flexGrow: 1,
  },
  info : {
    display : 'flex',
    gap: theme.spacing(1),
    [theme.breakpoints.down('md')]:{
      justifyContent:'center',
      alignItems:'center'
    }
  },
  list : {
    display:'grid',
    gridTemplateColumns: 'repeat(2, minmax(100px, 1fr))',
    gap: theme.spacing(0.5, 2),
    [theme.breakpoints.down('md')]:{
      display:'grid',
      gridTemplateColumns: '1fr 1fr',
      justifyContent:'center',
      alignItems:'center'
    }
  },
  listItem : {
    margin : 0,
    cursor: 'pointer',
    color: theme.palette.grey[500],
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.grey[400],
      transform: 'translateX(2px)',
    },
  },
  socialBtn: {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
  },
  bottomNote: {
    marginTop: theme.spacing(20),
    textAlign: 'center',
    color: theme.palette.grey[500],
    fontSize: theme.typography.pxToRem(5),
    lineHeight: 1.7,
    opacity: 0.78,
  },
}));


const Footer = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  const icons = [
    { icon: <UIIcons.Instagram fontSize="medium" color="primary" />, url: 'https://www.instagram.com' },
    { icon: <UIIcons.Facebook fontSize="medium" color="primary" />, url: 'https://www.facebook.com' },
    { icon: <UIIcons.LinkedIn fontSize="medium" color="primary" />, url: 'https://www.linkedin.com' },
  ];
  
  const list = [
    { label: 'Profile', path: '/profile' },
    { label: 'Plans', path: '/plans' },
    { label: 'Customer Support', path: '/about' },
    { label: 'About', path: '/about' },
  ];
  
  return (
    <footer className={classes.footer}>
      <UI.Container maxWidth="lg" className={classes.container}>
        <div>
          <div className={classes.logo}>
            <div className={classes.brandIconWrap}>
              <NetworkCheckIcon fontSize="small" color="primary" />
            </div>
            <UI.Typography variant="h5" className={classes.brandText}>RaterNet</UI.Typography>
          </div>
          <UI.Typography variant="body2" className={classes.subText}>
            Trust signals for better broadband choices.
          </UI.Typography>
        </div>
        
        <div className={classes.list}>
          {list.map((item, index) => (
            <UI.Typography
              key={index} // ✅ Unique key added
              variant="subtitle1"
              className={classes.listItem}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </UI.Typography>
          ))}
        </div>
        
        <div className={classes.info}>
          {icons.map((icon, index) => (
            <UI.IconButton
              key={index}
              color="primary"
              className={classes.socialBtn}
              onClick={() => window.open(icon.url, '_blank', 'noopener,noreferrer')}
            >
              {icon.icon}
            </UI.IconButton>
          ))}
        </div>
      </UI.Container>
      <UI.Container maxWidth="lg">
        <UI.Typography className={classes.bottomNote}>
          © {new Date().getFullYear()} RaterNet
        </UI.Typography>
      </UI.Container>
    </footer>
  );
};


export default Footer;