import React, {Component} from 'react';
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Typography, Button, ButtonGroup } from "@material-ui/core";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null,
        };
       
    }

    // check if user is in room
    // endpoint to call on server to ask if user is in room
    // lifecycle method: alter behavior of component
    // component just rendered for the first time on the screen
    // async keyword: asychronoues operation inside the component
    // calling on server could take a while to whole app doesnt wait for this method
    async componentDidMount() {
        fetch('/api/user-in-room')
            .then((response) => response.json())
            .then((data) => {
                this.setState({     // use state in the render method, forces to rerender page
                    roomCode: data.code,
                })
            });
    }

    // render two buttons and set up links to join room and create room
    renderHomePage() {
        return (
            // grid to make everything centered
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" compact="3">
                        Listening Rooma
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/join" component={ Link }>
                            Join a Room
                        </Button>
                        <Button color="secondary" to="/create" component={ Link }>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    render() { // return actual html code to display
        return ( // redirect to correct page
            <Router>
                <Switch>
                    <Route exact path="/" render={() => {
                        return this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`}/>) : (this.renderHomePage()); //ternary operator, if room code redirect to room otherwise render homepage
                    }}/>
                    <Route path='/join' component={RoomJoinPage}/>
                    <Route path='/create' component={CreateRoomPage}/>
                    <Route path="/room/:roomCode" component={Room}></Route>
                </Switch>
            
            </Router>
        );    
        
    }
}