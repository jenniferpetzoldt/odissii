import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Grid, Avatar, Button, Table, TableHead, TableCell, TableBody, TableRow } from '@material-ui/core';
import { USER_ROLES } from '../../../constants';
import { PEOPLE_ACTIONS } from '../../../redux/actions/peopleActions';
import Edit from '@material-ui/icons/Edit';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import orderBy from 'lodash/orderBy';

const moment = require('moment');

const mapStateToProps = state => ({
    user: state.user,
    people: state.people.staff.allEmployees,
    employees: state.people.staff.supervisorEmployees,
    search: state.search,
    filter: state.filter,
    sort: state.sort,
})

const styles = {
    table: {
        marginTop: 5,
    },
    tableCell: {
        padding: 0,
        textAlign: 'center',
    },
    grid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridRow: {
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        marginRight: '10px',
        marginLeft: '10px',
    }
}

const invertDirection = {
    asc: 'desc',
    desc: 'asc'
}

class AllEmployeeList extends React.Component {
    // Gets all the employees within the company
    // initially orders the employees ascending by last name
    componentDidMount() {
        this.getEmployees();
        orderBy(this.props.people, this.props.sort.column, this.props.sort.direction);
    }

    // activates the fetchAllEmployees function within the employeeSaga 
    getEmployees = () => {
        this.props.dispatch({ type: PEOPLE_ACTIONS.FETCH_ALL_EMPLOYEES });
    }
    // Updates redux with the column and direction to sort the information
    handleSort = columnName => {
        this.props.dispatch({ type: 'ADD_COLUMN_TO_SORT', payload: columnName });
        let direction = this.props.sort.column === columnName ? invertDirection[this.props.sort.direction] : 'desc';
        this.props.dispatch({ type: 'ADD_SORT_DIRECTION', payload: direction });
    }

    // When the edit button is clicked the user is redirected to the edit employee view associated with the employee id
    handleClick = (id) => {
        this.props.history.push(`/edit/employee/${id}`);
    }

    render() {
        let content = null;
        // uses lodash orderBy function to sort the data based on column and direction
        let data = orderBy(this.props.people, this.props.sort.column, this.props.sort.direction);
        // Conditionally renders content only if the user's role is 'manager'
        if (this.props.user.role === USER_ROLES.MANAGER) {
            // filters the data based on the search paramiter entered in the search bar in the appbar
            let filteredEmployees = data.filter(
                (employee) => {
                    // toLowerCase removes case sensitivity from the search bar
                    return employee.first_name.toLowerCase().indexOf(this.props.search.toLowerCase()) !== -1 ||
                        employee.last_name.toLowerCase().indexOf(this.props.search.toLowerCase()) !== -1;
                }
            )
            content = (
                <Table style={styles.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={styles.tableCell}
                                onClick={() => this.handleSort('last_name')}>
                                <Grid style={styles.grid}>Employee Name{this.props.sort.column === 'last_name' ? (
                                    this.props.sort.direction === 'asc' ? (
                                        <ArrowDropUp />) : (<ArrowDropDown />)) : null}</Grid></TableCell>
                            <TableCell style={styles.tableCell}
                                onClick={() => this.handleSort('recent')}>
                                <Grid style={styles.grid}>Last&nbsp;Feedback{this.props.sort.column === 'recent' ? (
                                    this.props.sort.direction === 'asc' ? (
                                        <ArrowDropUp />) : (<ArrowDropDown />)) : null}</Grid></TableCell>
                            <TableCell style={styles.tableCell}>Edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((employee) => {
                            return <TableRow key={employee.id} value={employee}>
                                <TableCell style={styles.tableCell}>
                                    <Grid style={styles.gridRow}>
                                        <Avatar style={styles.avatar} alt={employee.first_name}
                                            src={employee.image_path || 'images/avatar.png'} />
                                        {employee.first_name}&nbsp;{employee.last_name}</Grid>
                                </TableCell>
                                <TableCell style={styles.tableCell}>
                                    {employee.recent && moment(employee.recent).format("MM/DD/YYYY")}
                                </TableCell>
                                <TableCell style={styles.tableCell}>
                                    <Button onClick={() => this.handleClick(employee.id)}>
                                        <Edit />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            );
        }
        return (
            <Grid>
                {content}
            </Grid>
        );
    }
}

export default withRouter(connect(mapStateToProps)(AllEmployeeList));