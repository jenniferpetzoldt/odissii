import React, {Component} from 'react'; 
import {Input, Button, Typography, FormLabel} from '@material-ui/core'; 
import axios from 'axios';
import '../../ResetPassword/resetpassword.css'; 
import swal from 'sweetalert'
class NewPassword extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            email_address: '',
            password: '',
            confirm_password: '', 
            today: '', 
            token: this.props.match.params.token
        };
    }
    handleChange = (property, event) => {
        const today = new Date(); 
        this.setState({
            [property]: event.target.value, 
            today: today
        });
       
    }
    handleSubmit = () => {
        if(this.state.password === this.state.confirm_password){
            axios({
                method: 'PUT',
                url: '/api/user/resetpassword',
                data: this.state
            }).then((response) => {
                swal('Update successful! Please login with your new password.');
                //send an email with nodemailer that includes the token 
                this.props.history.push('/home'); 
            }).catch((error) => {
                console.log(error);
                swal('Something went wrong');
            });
        } else {
            swal('Passwords do not match! Please try again.');
        }
       
    }
    render(){
        return(
            <div className="reset-form">
            <Typography variant="headline">Create New Password</Typography>
            <FormLabel>Email address:
                <Input onChange={(event)=>this.handleChange('email_address', event)} /><br/>
            </FormLabel>
            <FormLabel>New password:
                <Input type="password" onChange={(event)=>this.handleChange('password', event)} /><br/>
            </FormLabel>
            <FormLabel>Confirm password:
                <Input type="password" onChange={(event)=>this.handleChange('confirm_password', event)} /><br/>
            </FormLabel>
                <Button onClick={this.handleSubmit}>Submit</Button>
            </div>
        );
    }
}
export default NewPassword; 