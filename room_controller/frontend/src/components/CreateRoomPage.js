import React, {Component} from 'react';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default class CreateRoomPage extends Component {
    defaultVotes = 2;
    constructor(props) {
        super(props);
        // default state, forces component to change state, send info to backend
        this.state = {
            guestCanPause: true,
            votesToSkip: this.defaultVotes,
        };
        this.handleVotesChange = this.handleVotesChange.bind(this)
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this)
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this); // bind method to class, can have access to this keyword in method

    }

    // updates state votes 
    handleVotesChange(e) {
        // modify state in react
        this.setState({
            votesToSkip: e.target.value, // get object that called this value and updates
        });
    }
    // updates state if users can pause/play 
    handleGuestCanPauseChange(e) {
        this.setState({
            guestCanPause: e.target.value === "true" ? true : false
        });
    }

    //
    handleRoomButtonPressed() {
        // send request to endpoint to allow to create new room
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, // kind of content
            body: JSON.stringify({  //put js object converted into json string to send
                votes_to_skip: this.state.votesToSkip,    // field names have to match the names in the server
                guest_can_pause: this.state.guestCanPause
            }),
        };
        // send request to localhost or wherever react is running on to api/create-room
        //once we get a response convert it to json
        // then take the data and do something with it
        // fetch("/api/create-room", requestOptions)
        //     .then((response) => response.json())
        //     .then((data) => console.log(data)); // prints out the json of the data sent to the endpoint server
        fetch("/api/create-room", requestOptions)
        .then((response) => response.json())
        .then((data) => this.props.history.push("/room/" + data.code));// redirect user to the webpages corresponding to the /room/code
    }

    render() { // return actual html code to display
        // return actual html code to display
         // aligns items horizontally or verically in a column structure (container)
         // uses css flexbox
         // spacing how much space in between boxes
         // 12 fills the entire screen
        return <Grid container spacing={1}>
            <Grid item xs={12} align="center">      
                <Typography component="h4" variant="h4">
                    Create A Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">      
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">
                            Guest Control of Playback State
                        </div>
                    </FormHelperText>
                    <RadioGroup row defaultValue="true" onChange={this.handleGuestCanPauseChange}>
                        <FormControlLabel 
                            value="true" 
                            control={<Radio color="primary"/>} 
                            label="Play/Pause"
                            labelPlacement="bottom"/>
                        <FormControlLabel 
                            value="false" 
                            control={<Radio color="secondary"/>} 
                            label="No Control"
                            labelPlacement="bottom"/>
                    </RadioGroup>
                </FormControl>        
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField required={true} 
                        type="number" 
                        onChange={this.handleVotesChange} 
                        defaultValue={this.defaultVotes} 
                        inputProps={{min: 1, style: { textAlign: " center" },}}/>
                    <FormHelperText>
                        <div align="center">
                            Votes Required to Skip Song
                        </div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="primary" variant="contained" onClick={this.handleRoomButtonPressed}>
                    Create A Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" to="/" component={Link}>
                    Back
                </Button>
            </Grid>

        </Grid>;    
        
    }
}