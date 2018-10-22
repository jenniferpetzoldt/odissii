import React, { Component } from 'react';
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

class ManagerOverviewGraph extends Component {
    render() {
        let managerOverview = {
            labels: this.props.supervisors,
            datasets: [
                {
                    label: 'Praise',
                    backgroundColor: '#4AC985',
                    data: this.props.praise
                },
                {
                    label: 'Instruct',
                    // backgroundColor: '#6F97C4',
                    backgroundColor: '#6C9BD1',
                    data: this.props.instruct
                },
                {
                    label: 'Correct',
                    backgroundColor: '#F79B1B',
                    data: this.props.correct
                },
            ]
        }
        return (
            <div>
                <Bar data={managerOverview} options={barOptions} />
            </div>
        );
    }
}
export default ManagerOverviewGraph; 