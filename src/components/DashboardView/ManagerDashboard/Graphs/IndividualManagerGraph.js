import React, {Component} from 'react';
import { Doughnut } from 'react-chartjs-2';

 const options = {
     responsive: true
 }
class IndividualManagerGraph extends Component {
    render(){
        let supervisorSummary = {
            labels: ['Praise', 'Instruct', 'Correct'],
            datasets: [{
            data: [this.props.feedback.praise, this.props.feedback.instruct, this.props.feedback.correct],
            backgroundColor: ['#4AC985', '#6C9BD1', '#F79B1B'],
            }]
        };
        return(
             <Doughnut data={supervisorSummary} options={options}/>
        );
    }
}
export default IndividualManagerGraph; 