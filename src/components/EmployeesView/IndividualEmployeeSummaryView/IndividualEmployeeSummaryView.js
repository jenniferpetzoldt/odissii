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
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
//Material Table
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import orderBy from 'lodash/orderBy';


const mapStateToProps = state => ({
    user: state.user,
    feedback: state.feedback.feedback,
    id: state.id,
    sort: state.sort
});

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
    },
    grow: {
        flexGrow: 1,
    },
    tableCell: {
        textAlign: 'center',
        padding: 0,
    },
    grid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    color: {
        color: '#f7fcff',
    }
}; //end of styles

const invertDirection = {
    asc: 'desc',
    desc: 'asc'
}

class IndividualEmployeeSummaryView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            totalQualityCount: [],
        }
    } //end of constructor

    componentDidMount() {
        this.getTotalFeedbackCount();
        orderBy(this.state.feedback, this.props.sort.column, this.props.sort.direction);
        this.props.dispatch({ type: USER_ACTIONS.FETCH_USER });
        this.props.dispatch({ type: FEEDBACK_ACTIONS.FETCH_CURRENT_EMPLOYEE_FEEDBACK, payload: { id: this.props.id } });
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

    handleSort = columnName => {
        this.props.dispatch({ type: 'ADD_COLUMN_TO_SORT', payload: columnName });
        let direction = this.props.sort.column === columnName ? invertDirection[this.props.sort.direction] : 'desc';
        this.props.dispatch({ type: 'ADD_SORT_DIRECTION', payload: direction })
    }

    render() {
        let btn = null;
        if (this.props.user.role === USER_ROLES.SUPERVISOR) {
            btn = (
                <div className="btnContainer">
                    <Button variant="fab" color="secondary" aria-label="Edit" style={styles.stickyButton}
                        onClick={this.createNewFeedbackClick}>
                        <Icon>edit_icon</Icon>
                    </Button>
                </div>
            )
        } else if (this.props.user.role === USER_ROLES.MANAGER) {
            btn = (
                <div></div>
            )
        }
        let data = orderBy(this.props.feedback.currentEmployee, this.props.sort.column, this.props.sort.direction);

        return (
            <div className="container">
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div className="outer">
                                <AppBar position="sticky">
                                    <Toolbar>
                                        {/* This arrow_back icon button will take the user back to the /employees view */}
                                        <IconButton component={Link} to={"/employees"}>
                                            <ArrowBack style={styles.color}/>
                                        </IconButton>
                                        {/* If the selected employee name is not yet render, display null, otherwise display the first name */}
                                        <h3>{this.props.feedback.currentEmployee[0] ? this.props.feedback.currentEmployee[0].first_name : null}</h3>
                                        <div style={styles.grow} />
                                    </Toolbar>
                                </AppBar>
                            <br />
                            <Typography variant="headline" className="center">Overall Summary:</Typography>
                            {/* {JSON.stringify(this.state.totalQualityCount)} */}
                            {/* This will map over the over the total feedback */}
                            {this.state.totalQualityCount.map((totalFeedback, index) => {
                                return (
                                    <DisplayOverallGraph key={index} totalFeedback={totalFeedback} />
                                )
                            })}
                            {/* This is the FAB for making a new feedback but will only show if the user is a supervisor */}
                            {btn}
                            < br/>
                            <DisplaySwipeableTabs />
                            <Typography variant="subheading" className="center">Latest Feedbacks:</Typography>
                            <div>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={styles.tableCell} onClick={() => this.handleSort('id')}>
                                                <Grid style={styles.grid}>
                                                    Category
                                                {this.props.sort.column === 'id' ? (
                                                        this.props.sort.direction === 'asc' ? (
                                                            <ArrowDropUp />) : (<ArrowDropDown />)) : null}</Grid></TableCell>
                                            <TableCell style={styles.tableCell}>
                                                <Grid style={styles.grid}>
                                                    Feedback
                                                </Grid></TableCell>
                                            <TableCell style={styles.tableCell} onClick={() => this.handleSort('date_created')}>
                                                <Grid style={styles.grid}>
                                                    Date Given
                                                {this.props.sort.column === 'date_created' ? (
                                                        this.props.sort.direction === 'asc' ? (
                                                            <ArrowDropUp />) : (<ArrowDropDown />)) : null}</Grid></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* {JSON.stringify(data)} */}
                                        {/* This will map over the array and pass it as "feedback" to the DisplayFeedback Component */}
                                        {data.map((feedbacksAtIndex, index) => {
                                            return (
                                                <DisplayFeedback key={index} feedback={feedbacksAtIndex} history={this.props.history} />
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