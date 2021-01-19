import React, { Component } from 'react';
import { Grid, Button, Typography } from "@material-ui/core";
import { Link }  from "react-router-dom";

export default class Room extends Component {
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
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this)
    }

    // function to get room details
    // edit: make sure response is valid
    getRoomDetails() {
        return fetch("/api/get-room" + "?code=" + this.roomCode)
            .then((response) => {
                if (!response.ok) {
                    this.props.leaveRoomCallback(); // so it clears the state in the homepage
                    this.props.history.push("/");
                }
                return response.json() // if ok then continue
            }).then((data) => {
                this.setState({ //change the state data
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                });
            });
    }

    // leave room 
    // edit: added line 49 to set state of homepage roomCode: null
    leaveButtonPressed() {
        // call endpoint /api/leave-room
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            this.props.leaveRoomCallback(); // so it clears the state in the homepage
            this.props.history.push("/");    // code redirect to homepage
        });
    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Votes: {this.state.votesToSkip}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Guest Can Pause: {this.state.guestCanPause.toString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Host: {this.state.isHost.toString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={this.leaveButtonPressed}>
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
        
        );
    }
}
// <div>
// <h3>{this.roomCode}</h3>
// <p>Votes: {this.state.votesToSkip}</p>
// <p>Guest Can Pause: {this.state.guestCanPause.toString()}</p>
// <p>Host: {this.state.isHost.toString()}</p>
// </div>