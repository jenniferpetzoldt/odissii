import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import axios from 'axios';
import { FEEDBACK_ACTIONS } from '../../../redux/actions/feedbackActions';
import { USER_ACTIONS } from '../../../redux/actions/userActions';
import { USER_ROLES } from '../../../constants';
//Components
import DisplayFeedback from './DisplayFeedback/DisplayFeedback';
import DisplayOverallGraph from './DisplayGraphs/DisplayOverallGraph/DisplayOverallGraph';
import DisplaySwipeableTabs from './DisplaySwipeableTabs/DisplaySwipeableTabs';
//Styling
import './IndividualEmployeeSummaryView.css';
import { withStyles } from '@material-ui/core/styles';
//Buttons
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
//Material Table
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const mapStateToProps = state => ({
    user: state.user,
    feedback: state.feedback.feedback,
    id: state.id,
});

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'black',
    },
}; //end of styles

class IndividualEmployeeSummaryView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            totalQualityCount: [],
        }
    } //end of constructor

    componentDidMount() {
        this.getTotalFeedbackCount();
        this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
        this.props.dispatch({ type: FEEDBACK_ACTIONS.FETCH_CURRENT_EMPLOYEE_FEEDBACK });
    } //end of componentDidMount

    //This will get the total feedback of each category for the employee
    getTotalFeedbackCount() {
        axios.get(`/api/feedback/employeeFeedbackCount/${this.props.id}`)
            .then((response) => {
                this.setState({
                    totalQualityCount: response.data
                })
            }).catch((error) => {
                console.log('error in getTotalFeedbackCount', error);
                alert('Cannot get total client feedback counts!')
            });
    } //end of getTotalFeedbackCount()

    createNewFeedbackClick = (event) => {
        this.props.history.push('/feedback/new');
    }

    render() {
        let btn = null;
        if (this.props.user.isLoading && this.props.user.userName && this.props.user.role !== USER_ROLES.MANAGER) {
            btn = (
                <div className="btnContainer">
                    <Button variant="fab" color="secondary" aria-label="Edit" style={styles.stickyButton}
                        onClick={this.createNewFeedbackClick}>
                        <Icon>edit_icon</Icon>
                    </Button>
                </div>
            )
        } else if (this.props.user.isLoading && this.props.user.userName && this.props.user.role !== USER_ROLES.SUPERVISOR) {
            btn = (
                <div></div>
            )
        }

        return (
            <div>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div className="outer">
                            <div className="header">
                                <h1>
                                    {/* This arrow_back icon button will take the user back to the /employees view */}
                                    <Button component={Link} to={"/employees"}>
                                        <Icon>arrow_back</Icon>
                                    </Button>
                                    {/* If the selected employee name is not yet render, display null, otherwise display the first name */}
                                    {this.props.feedback.currentEmployee[0] ? this.props.feedback.currentEmployee[0].first_name : null}
                                </h1>
                            </div>
                            <h2>Overall Summary:</h2>
                            {/* {JSON.stringify(this.state.totalQualityCount)} */}
                            {/* This will map over the over the total feedback */}
                            {this.state.totalQualityCount.map((totalFeedback, index) => {
                                return (
                                    <DisplayOverallGraph key={index} totalFeedback={totalFeedback} />
                                )
                            })}
                            {/* This is the FAB for making a new feedback but will only show if the user is a supervisor */}
                            { btn }
                            <h2>Feedbacks:</h2>
                            <DisplaySwipeableTabs />
                            <h2>Latest Feedbacks:</h2>
                            <div>
                                <Table>
                                    <TableHead>
                                        <TableRow styles={styles.row}>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Feedback</TableCell>
                                            <TableCell>Date Given</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* {JSON.stringify(this.props.feedback.currentEmployee)} */}
                                        {/* This will map over the array and pass it as "feedback" to the DisplayFeedback Component */}
                                        {this.props.feedback.currentEmployee.map((feedbacksAtIndex, index) => {
                                            return (
                                                <DisplayFeedback key={index} feedback={feedbacksAtIndex} />
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(connect(mapStateToProps)(IndividualEmployeeSummaryView));