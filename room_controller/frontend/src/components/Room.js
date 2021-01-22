import React, { Component } from 'react';
import { Grid, Button, Typography } from "@material-ui/core";
import { Link }  from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,    // use to indicate if settings option should be shown
            spotifyAuthenticated: false,
        };

        this.roomCode = this.props.match.params.roomCode; // match is the prop with info about how we go to the component from the react routers

        // use room code to request to get its data from the backend
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);// leave button
        this.updateShowSettings = this.updateShowSettings.bind(this); // update showSetting in this.state
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getRoomDetails();   // update state 
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
                if (this.state.isHost){
                    this.authenticateSpotify();    // call here if user is host
                }   
            });
    }

    //
    authenticateSpotify() {
        fetch('/spotify/is-authenticated').then((response) => response.json()).then((data) =>{
            this.setState({
                spotifyAuthenticated: data.status});
                if (!data.status) {
                    fetch('/spotify/get-auth-url').then((response) => response.json()).then((data) => {
                        window.location.replace(data.url); // js native.redirect user to url to authenticate app
                    });
                }
        });

    }

    // updateShowSettings(value) {
    //     this.setState( {
    //         showSettings: value,
    //     });
    // }
    updateShowSettings(value) {
        this.setState( {
            showSettings: value,
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

    // method that returns html settings
    // only want to show settings when user is host
    renderSettingsButton() {
        return(
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                    Room Settings
                </Button>
            </Grid>
        );
    }

    // render what the settings are
    // add grid container because it is its own page
    renderSettings() {
        return(
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <CreateRoomPage 
                    update={true} 
                    votesToskip={this.state.votesToSkip} 
                    guestCanPause={this.state.guestCanPause} 
                    roomCode={this.roomCode} 
                    updateCallback={this.getRoomDetails}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>
                    Close Settings
                </Button>
            </Grid>
        </Grid>
        );
    } 

    render() {
        // render this view when updateShowsSettings is true and showSettings is true
        if (this.state.showSettings) {
            return this.renderSettings();
        }
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
                {this.state.isHost ? this.renderSettingsButton() : null}    
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
