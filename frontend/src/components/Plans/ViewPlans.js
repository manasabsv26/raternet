import React from "react";
import {Typography} from "@mui/material";
import Chip from '@mui/material/Chip';
import { 
    Grid,
    Paper,
    Divider,
    Box,
    Button
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



const ViewPlans = (props) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    const renderPlans = (plans)=>(
    <React.Fragment>
        {plans.map(plan=>(
            <Paper key={plan._id} elevation={2} style={{
                margin : 10,
                padding : 20
            }}>
                <div style={{display:'flex',justifyContent : 'space-between'}}>
                    <Typography variant='h5'>
                        {plan.plan_name}
                    </Typography>
                    <Typography variant="h6">
                        {plan.type_of_service}
                    </Typography>
                </div>
                <div style={{display:'flex',justifyContent : 'space-between',padding:10}}>
                    <Chip size='large' label={plan.price.toString()+' INR'} color='primary'/>
                    <Chip size='large' label={plan.amount_data} color='primary'/>
                  <Chip size='large' label={`${plan.duration} months`} color='primary'/>
                </div>
                <Divider fullWidth/>
                <br></br>
                <Typography variant="body2" color='textSecondary'>
                    {plan.details}
                </Typography>
                <br></br>
                <div style={{display:'flex',justifyContent : 'space-between'}}>
                    <Button 
                    variant='contained' 
                    color='primary' 
                    style={{width:'40%'}}
                    onClick={props.setValues.bind(this,plan._id)}>Update</Button>
                    <Button variant='contained'
                     color='secondary' 
                     style={{width:'40%'}}
                     onClick={props.deletePlan.bind(this,plan._id)}>Delete</Button>
                </div>
            </Paper>
        ))}
        </React.Fragment>
    )
    
    const plansArray = props.plans?.data?.plan || [];    

    return (
       <div>
            <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" centered>
            <Tab label="Prepaid" {...a11yProps(0)} />
            <Tab label="Postpaid" {...a11yProps(1)} />
            </Tabs>
            <div style={{
                height : '100vh',
                overflow : 'auto'
            }}>
                <TabPanel value={value} index={0}>    
                    {renderPlans(plansArray.filter(plan => plan.type_of_plan === "Prepaid"))}
                </TabPanel>
                <TabPanel value={value} index={1}>
                    {renderPlans(plansArray.filter(plan=>plan.type_of_plan==="Postpaid"))}
                </TabPanel>
            </div>    
       </div>
    )
}

export default ViewPlans;