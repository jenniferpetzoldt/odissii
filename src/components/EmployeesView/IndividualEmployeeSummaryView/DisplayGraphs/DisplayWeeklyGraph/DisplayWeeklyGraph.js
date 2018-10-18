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

const lastFourWeeksOnly = feedback => moment(feedback.date_created).isSameOrAfter(moment().subtract(4, 'weeks').startOf('isoWeek'));

const getIdForQuality = (types, name) => types.find(type => type.name === name).id;

const totalsByWeek = (feedback, quality_types) => {
    const weekFourStart = moment().subtract(4, 'weeks').startOf('isoWeek');
    const weekThreeStart = moment().subtract(3, 'weeks').startOf('isoWeek');
    const weekTwoStart = moment().subtract(2, 'weeks').startOf('isoWeek');
    const weekOneStart = moment().subtract(1, 'weeks').startOf('isoWeek');
    const thisWeekStart = moment().startOf('isoWeek');

    const blankSummary = quality_types.reduce((summary, quality) => {
        summary[quality.id] = 0;
        return summary;
    }, {});

    return feedback.reduce((summary, entry) => {
        const date =  moment(entry.date_created);
        if (date.isBetween(weekFourStart, weekThreeStart, null, '[)')) {
            summary.fourWeeksAgo[entry.id] += 1;
        } else if (date.isBetween(weekThreeStart, weekTwoStart, null, '[)')) {
            summary.threeWeeksAgo[entry.id] += 1;
        } else if (date.isBetween(weekTwoStart, weekOneStart, null, '[)')) {
            summary.twoWeeksAgo[entry.id] += 1;
        } else if (date.isBetween(weekOneStart, thisWeekStart, null, '[)')) {
            summary.oneWeekAgo[entry.id] += 1;
        }
        return summary;
    }, ({
        fourWeeksAgo: {...blankSummary},
        threeWeeksAgo: { ...blankSummary },
        twoWeeksAgo: { ...blankSummary },
        oneWeekAgo: { ...blankSummary },
    }));
};

const namesOfPastFourWeeks = () => ([
    moment().subtract(4, 'weeks').startOf('isoWeek').format('MMM DD'),
    moment().subtract(3, 'weeks').startOf('isoWeek').format('MMM DD'),
    moment().subtract(2, 'weeks').startOf('isoWeek').format('MMM DD'),
    moment().subtract(1, 'weeks').startOf('isoWeek').format('MMM DD'),
]);

const qualityByWeek = (totals, qualityId) => Object.values(totals).map(week => week[qualityId]);

class DisplayWeeklyGraph extends Component {
    componentDidMount() {
        if(!this.props.quality_types.length) {
            this.props.dispatch({type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES})
        }
    }

    render() {
        const {quality_types, data} = this.props;

        if(!(quality_types.length && data.length)) return null;

        const weekNames = namesOfPastFourWeeks();
        const fourWeeksFeedback = data.filter(lastFourWeeksOnly);
        const weeklyQualityTotals = totalsByWeek(fourWeeksFeedback, quality_types);

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
                data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'Praise')),
                backgroundColor: '#4AC985',
            },
            {
                label: 'Instruct',
                data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'Instruct')),
                backgroundColor: '#6C9BD1',
            },
            {
                label: 'Correct',
                data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'Correct')),
                backgroundColor: '#F79B1B',
            }],
            labels: weekNames,
        }
        return (
            <div>
                {/* {JSON.stringify(fourWeeksFeedback)}
                {JSON.stringify(weeklyQualityTotals)} */}
                <Bar
                    data={barData}
                    options={options}
                />
            </div>
        )
    }
}

export default connect(mapStateToProps)(DisplayWeeklyGraph);