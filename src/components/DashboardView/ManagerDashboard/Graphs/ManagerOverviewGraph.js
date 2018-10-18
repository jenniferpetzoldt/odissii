import React, {Component} from 'react';
import {Bar} from 'react-chartjs-2';

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

class ManagerOverviewGraph extends Component {
    render(){
    let  managerOverview = {
        labels: this.props.supervisors,
        datasets: [
          {
            label: 'Correct',
            backgroundColor: '#F79B1B',
            data: this.props.correct
          },
          {
            label: 'Instruct',
            // backgroundColor: '#6F97C4',
            backgroundColor: '#6C9BD1',
            data: this.props.instruct
          },
          {
            label: 'Praise',
            backgroundColor: '#4AC985',
            data: this.props.praise
        }
      ]}
        return(
            <div>
                <Bar data={managerOverview} options={barOptions}/>
            </div>
        );
    }
}
export default ManagerOverviewGraph; 