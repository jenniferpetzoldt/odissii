import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { QUALITY_ACTIONS } from '../../../../redux/actions/qualityActions';
import { Bar } from 'react-chartjs-2';

const barOptions = {
  scales: {
    xAxes: [{
        stacked: true
    }],
    yAxes: [{
        stacked: true
    }]
  }, 
};

const mapStateToProps = state => ({
  quality_types: state.quality_types
});

class PastThreeWeeks extends React.Component {
  componentDidMount() {
    if (!this.props.quality_types.length) {
      this.props.dispatch({type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES});
    }
  }

  render() {
    const { quality_types, data } = this.props;

    if (!(quality_types.length && data.length)) return null;

    // console.log('quality types:', quality_types);
    const weekNames = namesOfPastThreeWeeks();
    const threeWeeksFeedback = data.filter(lastThreeWeeksOnly);
    const weeklyQualityTotals = totalsByWeek(threeWeeksFeedback, quality_types);

    const graphData = {
      labels: weekNames,
      datasets: [
        {
          label: 'Correct',
          backgroundColor: '#F79B1B',
          data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'correct'))
        },
        {
          label: 'Instruct',
          backgroundColor: '#6C9BD1',
          data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'instruct'))
        },
        {
          label: 'Praise',
          backgroundColor: '#4AC985',
          data: qualityByWeek(weeklyQualityTotals, getIdForQuality(quality_types, 'praise'))
        },
      ]
    };

    return <Bar data={graphData} options={barOptions} />;
  }
}

export default connect(mapStateToProps)(PastThreeWeeks);


const lastThreeWeeksOnly = feedback => moment(feedback.date_created).isSameOrAfter(moment().subtract(3, 'weeks').startOf('isoWeek'));

const getIdForQuality = (types, name) => types.find(type => type.name === name).id;

// for each week for the past three whole weeks, get the sums of each quality type given 
const totalsByWeek = (feedback, quality_types) => {
  const weekThreeStart = moment().subtract(3, 'weeks').startOf('isoWeek');
  const weekTwoStart = moment().subtract(2, 'weeks').startOf('isoWeek');
  const weekOneStart = moment().subtract(1, 'weeks').startOf('isoWeek');
  const thisWeekStart = moment().startOf('isoWeek');

  const blankSummary = quality_types.reduce((summary, quality) => {
    summary[quality.id] = 0;
    return summary;
  }, {});

  return feedback.reduce((summary, entry) => {
    const date = moment(entry.date_created);    
    if (date.isBetween(weekThreeStart, weekTwoStart, 'days', '[]')) {
      summary.threeWeeksAgo[entry.quality_id] += 1;
    } else if (date.isBetween(weekTwoStart, weekOneStart, 'days', '[]')) {
      summary.twoWeeksAgo[entry.quality_id] += 1;
    } else if (date.isBetween(weekOneStart, thisWeekStart, 'days', '[]')) {
      summary.oneWeekAgo[entry.quality_id] += 1;
    }

    return summary;
  }, ({
    threeWeeksAgo: {...blankSummary},
    twoWeeksAgo: {...blankSummary},
    oneWeekAgo: {...blankSummary},
  }));
};

// get the names of the past three whole weeks from now, ie: "Oct 12"
const namesOfPastThreeWeeks = () => ([
  moment().subtract(3, 'weeks').startOf('isoWeek').format('MMM DD'),
  moment().subtract(2, 'weeks').startOf('isoWeek').format('MMM DD'),
  moment().subtract(1, 'weeks').startOf('isoWeek').format('MMM DD'),
]);

// get the tally objects for each week and return an array with only the values for a specific quality
const qualityByWeek = (totals, qualityId) => Object.values(totals).map(week => week[qualityId]);
