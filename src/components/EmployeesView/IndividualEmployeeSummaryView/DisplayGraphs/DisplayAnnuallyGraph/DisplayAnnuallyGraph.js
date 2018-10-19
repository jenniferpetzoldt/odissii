import React, { Component } from 'react';
import { connect } from 'react-redux';
import { QUALITY_ACTIONS } from '../../../../../redux/actions/qualityActions';
//Chart
import { Bar } from 'react-chartjs-2';
//Date formatter
const moment = require('moment');

const mapStateToProps = state => ({
    quality_types: state.quality_types
});

const getIdForQuality = (types, name) => types.find(type => type.name === name).id;

const getMonthlyNames = () => {
    const names = [];
    for (let i = 12; i > 0; i--) {
        names.push(moment().subtract(i, 'months').format('MMM'));
    }
    return names;
}

const qualityByMonth = (totals, qualityId) => Object.values(totals).map(month => month[qualityId]);

const totalsByMonth = (feedback, quality_types) => {
    const months = [12,11,10,9,8,7,6,5,4,3,2,1];
    const now = moment();
    const feedbackByMonth = months.map(sortFeedbackByMonth(feedback));
    return feedbackByMonth.map(feedback => getQualityTotalsForMonth(feedback, quality_types));
};

const sortFeedbackByMonth = feedback => monthNumber => {
    const monthStart = moment().subtract(monthNumber, 'months').startOf('month');
    const monthEnd = moment().subtract(monthNumber, 'months').endOf('month');

    return feedback.filter(entry => {
        const entryDate = moment(entry.date_created);
        return entryDate >= monthStart && entryDate <= monthEnd;
    });
};

const getQualityTotalsForMonth = (feedbackForMonth, quality_types) => {
    const blankMonthlySummary = quality_types.reduce((summary, quality) => {
        summary[quality.id] = 0;
        return summary;
    }, {});

    return feedbackForMonth.reduce((summary, entry) => {
        summary[entry.id] += 1;
        return summary;
    }, {...blankMonthlySummary});
};

class DisplayAnnuallyGraph extends Component {
    componentDidMount() {
        if (!this.props.quality_types.length) {
            this.props.dispatch({ type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES })
        }
    }

    render() {
        const { quality_types, data } = this.props;

        if (!(quality_types.length && data.length)) return null;

        const monthlyTotals = totalsByMonth(data, quality_types);

        const options = {
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        suggestedMax: 5,
                    }
                }]
            },
        }

        let barData = {
            datasets: [{
                label: 'Praise',
                data: qualityByMonth(monthlyTotals, getIdForQuality(quality_types, 'praise')),
                backgroundColor: '#4AC985',
            },
            {
                label: 'Instruct',
                data: qualityByMonth(monthlyTotals, getIdForQuality(quality_types, 'instruct')),
                backgroundColor: '#6C9BD1',
            },
            {
                label: 'Correct',
                data: qualityByMonth(monthlyTotals, getIdForQuality(quality_types, 'correct')),
                backgroundColor: '#F79B1B',
            }],
            labels: getMonthlyNames(),
        }

        return (
            <div>
                {/* {JSON.stringify(monthlyTotals)} */}
                <Bar
                    data={barData}
                    options={options}
                />
            </div>
        )
    }
}

export default connect(mapStateToProps)(DisplayAnnuallyGraph);