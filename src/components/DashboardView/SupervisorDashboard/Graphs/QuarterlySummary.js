import React from 'react';
import { connect } from 'react-redux';
import { QUALITY_ACTIONS } from '../../../../redux/actions/qualityActions';
import moment from 'moment';
import { Doughnut } from 'react-chartjs-2';

const mapStateToProps = state => ({
  quality_types: state.quality_types
});

// REACT COMPONENT
class QuarterlySummary extends React.Component {
  componentDidMount() {
    if (!this.props.quality_types.length) {
      this.props.dispatch({type: QUALITY_ACTIONS.FETCH_FEEDBACK_QUALITY_CATEGORIES});
    }
  }
  
  render() {
    if (!this.props.quality_types.length) return null;
    
    return (
      <Doughnut data={
          {
            labels: ['Praise', 'Instruct', 'Correct'],
            datasets: [{
              data: feedbackQualityForCurrentQuarter(this.props.data, this.props.quality_types),
              backgroundColor: ['#4AC985', '#6C9BD1', '#F79B1B']
            }]
          }
        }
      />
    );
  }
}

export default connect(mapStateToProps)(QuarterlySummary);

// reduces the feedback down into an array with three numbers,
// representing the amount of praise, instruct, or correct
// for the current quarter
const feedbackQualityForCurrentQuarter = (feedback, quality_types) => {
  const currentQuarter = moment().quarter();
  // const startOfQuarter = getStartingMonthOfCurrentQuarter(currentMonth);

  const quality = feedback.reduce((summary, entry) => {
    if (moment(entry.date_created).quarter() === currentQuarter) {
      summary[quality_types.find(type => type.id === entry.quality_id).name] += 1;
    }
    return summary;
  }, {
    praise: 0,
    instruct: 0,
    correct: 0
  });

  return Object.values(quality);
};