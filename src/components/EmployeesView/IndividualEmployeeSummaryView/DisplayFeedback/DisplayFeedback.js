import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../DisplayFeedback/DisplayFeedback.css';
import { Grid } from '@material-ui/core';
//Material Table
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
//In-line Styling
import { withStyles } from '@material-ui/core/styles';
//Material avatar & icons
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';
//Date formatter
const moment = require('moment');

//This is the in-line styling for the avatars
const styles = {
    avatar: {
        margin: 10,
    },
    praiseAvatar: {
        margin: 10,
        color: '#fff',
        backgroundColor: '#4AC985',
    },
    correctAvatar: {
        margin: 10,
        color: '#fff',
        backgroundColor: '#F79B1B',
    },
    instructAvatar: {
        margin: 10,
        color: '#fff',
        backgroundColor: '#6C9BD1',
    },
    row: {
        textAlign: 'center',
        padding: 0,
    },
    grid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}; //end of styles

class DisplayFeedback extends Component {

    //This will push the user to see a more detailed page of the feedback view
    clickHandler = (event) => {
        this.props.history.push(`/feedback/detail/${this.props.feedback.feedbackId}`)
    } //end of clickHandler

    render() {

        //This is how the avatar icon changes according to the category name of the feedback
        let content = null;
        if (this.props.feedback.id === 1) {
            content = <TableCell style={styles.row}>
                        <Grid style={styles.grid}>
                            <Avatar style={styles.praiseAvatar}><Icon>thumb_up</Icon></Avatar>
                        </Grid>
                    </TableCell>
        } else if (this.props.feedback.id === 3) {
            content = <TableCell style={styles.row}>
                        <Grid style={styles.grid}>
                            <Avatar style={styles.correctAvatar}><Icon>thumb_down</Icon></Avatar>
                        </Grid>
                    </TableCell>
        } else if (this.props.feedback.id === 2) {
            content = <TableCell style={styles.row}>
                        <Grid style={styles.grid}>
                            <Avatar style={styles.instructAvatar}><Icon>thumbs_up_down</Icon></Avatar>
                        </Grid>
                    </TableCell>
        }; //end of if-else

        return (
            <TableRow>
                {/* {content} is coming from the changing avatar icon logic */}
                { content }
                {/* This is how the details of the feedback are only displaying up to a certain
                character length instead of the whole feedback displaying */}
                <TableCell onClick={this.clickHandler} style={styles.row}>
                    <Grid style={styles.grid}>
                        {this.props.feedback.details.slice(0,15)}...
                    </Grid>
                </TableCell>
                {/* This is how the date is formatted coming back from the server */}
                <TableCell style={styles.row}>
                        {moment(this.props.feedback.date_created).format("MM/DD/YY")}
                </TableCell>
            </TableRow>
        ) //end of return
    } //end of render
} //end of DisplayFeedback

export default withStyles(styles)(connect()(DisplayFeedback));