import React, { Component } from 'react';

export default class Roon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
        };

        this.roomCode = this.props.match.params.roomCode; // match is the prop with info about how we go to the component from the react routers

        // use room code to request to get its data from the backend
        this.getRoomDetails()   // update state 
    }

    // function to get room details
    getRoomDetails() {
        fetch("/api/get-room" + "?code=" + this.roomCode).then((response) => 
            response.json()
            ).then((data) => {
                this.setState({ //change the state data
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                });
            });
    }

    render() {
        return (<div>
            <h3>{this.roomCode}</h3>
            <p>Votes: {this.state.votesToSkip}</p>
            <p>Guest Can Pause: {this.state.guestCanPause.toString()}</p>
            <p>Host: {this.state.isHost.toString()}</p>
        </div>
        );
    }
}