import React, {Component} from 'react';
import { Doughnut } from 'react-chartjs-2';

 const options = {
     responsive: true
 }
class IndividualManagerGraph extends Component {
    constructor(props){
        super(props);
        this.state = {
            supervisorSummary: {
                labels: ['Praise', 'Instruct', 'Correct'],
                datasets: [{
                data: [parseInt(this.props.feedback.praise), parseInt(this.props.feedback.instruct), parseInt(this.props.feedback.correct)],
                backgroundColor: ['#4AC985', '#6C9BD1', '#F79B1B'],
                }]
            },
        }
    }
    render(){
        return(
             <Doughnut data={this.state.supervisorSummary} options={options}/>
        );
    }
}
export default IndividualManagerGraph; 