import React,{useEffect} from "react";
import {useDispatch,useSelector} from "react-redux";
import formValidation from '../utils/formValidation';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { jwtDecode } from "jwt-decode";
import {
    Typography,
    Grid,
    TextField,
    Paper,
    Avatar,
    Button
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useState } from "react";
import ViewPlans from './ViewPlans'
import {dummy_plans} from '../../dummy-data/plan'
import {addPlan,fetchPlans,updatePlan,deletePlan} from '../../redux/actions/plans'
import Error from '../Error/Error';
import Loading from '../Loading/Loading'


const useStyles = makeStyles(theme=>({
    map : {
        padding : 10
    },
    large: {
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
    input: {
        display: 'none',
    }
}))

const values = {
    plan_name : "",
    type_of_service : "",
    type_of_plan : "",
    price : "",
    amount_data : "",
    duration : "",
    details : ""
}

const fieldsValidation = {
    plan_name : {
        error: "",
        validate: "alphanumeric"
    },
    type_of_service : {
        error: "",
        validate: "string"
    },
    type_of_plan : {
        error: "",
        validate: "string"
    },
    price : {
        error: "",
        validate: "number",
        minLength: 2,
        maxLength: 1000
    },
    amount_data : {
        error: "",
        validate: "alphanumeric"
    },
    duration : {
        error: "",
        validate: "number",
        minLength: 1,
        maxLength: 6
    },
    details : {
        error: "",
        validate: "text",
        minLength: 2,
        maxLength: 20
    }
}

const Plans = (props) => {
    const [formValues, setFormValues] = useState(values)
    const [formErrors, setFormErrors] = useState({})
    const [url,setUrl] = useState(null);
    const classes = useStyles();
    const token = localStorage.getItem('token');
    const plans = useSelector(state=>state.plans.plans);
    const dispatch = useDispatch();
    const [loading,setLoading] = React.useState(false);
    const [error,setError] = React.useState(null);
    const [isUpdate,setisUpdate] = React.useState(false);
    const [image,setImage] = React.useState(null);


    function UploadButtons({ classes }) {     
        return (
          <React.Fragment>
            <input
              accept="image/*"
              className={classes.input}
              onChange={handlefileUpload}
              type="file"
            />
            <input accept="image/*" className={classes.input} id="icon-button-file" type="file" onChange={handlefileUpload}/>
            <label htmlFor="icon-button-file">
              <IconButton color="primary" aria-label="upload picture" element="span">
                <PhotoCamera fontSize="large"/>
              </IconButton>
            </label>
          </React.Fragment>
        );
      }

    const getPlans = async (id)=>{
          try{
            await dispatch(fetchPlans(id));
            setLoading(false)
          } catch(e){
            setError(e.message);
            setLoading(false);
          }
         
      }

    React.useEffect(()=>{
        let user = jwtDecode(token);
        getPlans(user.id) 
    },[dispatch])

    const addorUpdatePlans = async ()=>{
        let action;
        if(isUpdate===true){
            action = updatePlan(formValues,image);
        }else {
            action = addPlan(formValues,image)
        }

        try{
          await dispatch(action);
        } catch(e){
          setError(e.message);
        }  
    }

    const deletePlanHandler = async (id)=>{
        try{
          await dispatch(deletePlan(id));
        } catch(e){
          setError(e.message);
        }  
    }

    const handleChange=(e)=>{
        const { name, value } = e.target
        // Set values
        setFormValues(prev => ({
          ...prev,
          [name]: value
        }))
    
        // set errors
        const error = formValidation(name, value, fieldsValidation) || ""
    
        setFormErrors(prev => ({
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
       
        setImage(
          event.target.files[0]
        )
    }

    const setValues = (id)=>{
        let plan = (plans.data?.plan || []).find(plan => plan._id === id);
        setFormValues({...plan})
        setisUpdate(true);
    }

    if(error){
        return <Error message = {error}/>
    }

    if(loading){
        return <Loading message = "Loading Your Plans"/>
    }

    return (
        <Grid container justify="center" spacing={2}>
            <Grid item xs={6}>
                <Paper elevation={3} style={{padding:20}}>
                <div style={{display:'flex',margin:10}}>
                    <Avatar alt='image' src={url} className={classes.large}/>
                    <div style={{
                        display:'flex',
                        justifyContent : 'space-between',
                        marginLeft : 40,
                        alignItems : 'center',
                        width : '100%'
                    }}>
                        <Typography variant='h4'>
                            Add Plan
                        </Typography>
                        <UploadButtons classes={classes} />
                    </div>  
                </div>
                <TextField
                    name="plan_name"
                    variant="outlined"
                    value={formValues.plan_name}
                    label="Name of Plan"
                    type="text"
                    margin="normal"
                    onChange={handleChange}
                    error={!!formErrors.plan_name}
                    helperText={formErrors.plan_name}
                    autoFocus
                    fullWidth
                    required/>
                <div style={{
                    display : 'flex',
                    justifyContent : 'space-between',
                    marginLeft : 10,
                    marginRight : 10,
                    alignItems : 'center'
                }}>
                    <FormControl style={{width:'40%'}}>
                        <InputLabel id="demo-simple-select-label">Plan Type</InputLabel>
                        <Select
                            labelId="type_of_plan"
                            name="type_of_plan"
                            value={formValues.type_of_plan}
                            onChange={handleChange}
                        >
                            <MenuItem value={'Prepaid'}>Prepaid</MenuItem>
                            <MenuItem value={'Postpaid'}>Postpaid</MenuItem>
                        </Select>
                    </FormControl>
                        <FormControl style={{width:'40%'}}>
                        <InputLabel id="demo-simple-select-label">Service Type</InputLabel>
                        <Select
                            labelId="type_of_service"
                            name="type_of_service"
                            value={formValues.type_of_service}
                            onChange={handleChange}
                        >
                            <MenuItem value={'Data'}>Data</MenuItem>
                            <MenuItem value={'WiFi'}>WiFi</MenuItem>
                            <MenuItem value={'Fiber/Broadband'}>Fiber/Broadband</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                
                <TextField
                    name="price"
                    variant="outlined"
                    value={formValues.price}
                    label="Price"
                    type="text"
                    margin="normal"
                    onChange={handleChange}
                    error={!!formErrors.price}
                    helperText={formErrors.price}
                    autoFocus
                    fullWidth
                    required/>
                <TextField
                    name="amount_data"
                    variant="outlined"
                    value={formValues.amount_data}
                    label="Data Amount(GB)"
                    type="text"
                    margin="normal"
                    onChange={handleChange}
                    error={!!formErrors.amount_data}
                    helperText={formErrors.amount_data}
                    autoFocus
                    fullWidth
                    required/>
                <TextField
                    name="duration"
                    variant="outlined"
                    value={formValues.duration}
                    label="Duration (in months)"
                    type="text"
                    margin="normal"
                    onChange={handleChange}
                    error={!!formErrors.duration}
                    helperText={formErrors.duration}
                    autoFocus
                    fullWidth
                    required/>
                <TextField
                    name="details"
                    variant="outlined"
                    value={formValues.details}
                    label="Other Details"
                    type="text"
                    margin="normal"
                    error={!!formErrors.details}
                    helperText={formErrors.details}
                    onChange={handleChange}
                    autoFocus
                    fullWidth
                    required/>
                    <div style={{ display:'flex',marginTop:10,justifyContent:'space-between'}}>
                       {isUpdate ? (
                            <Button variant="contained" color="primary" 
                            style={{width:'40%'}} onClick={addorUpdatePlans}>
                                Update Plan
                            </Button>
                       ): (
                        <Button variant="contained" color="primary" 
                            style={{width:'40%'}} onClick={addorUpdatePlans}>
                                Add Plan
                        </Button>
                       )}
                        <Button variant="contained" color="secondary" 
                            style={{width:'40%'}}
                            onClick={()=>{
                            setFormValues(values)
                            setFormErrors({})
                            setUrl(null)
                            setisUpdate(false)
                            }}>Reset</Button>
                    </div> 
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <ViewPlans plans={plans} setValues={setValues} deletePlan={deletePlanHandler}/>
            </Grid>   
        </Grid>
    )
}

export default Plans;