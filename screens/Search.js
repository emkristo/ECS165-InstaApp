import React from 'react';
import { ListItem } from 'react-native-elements'
import { StyleSheet, Platform, Image, Text, TextInput, View, Button, ScrollView, RefreshControl, } from 'react-native'
import * as firebase from 'firebase';
import { ImagePicker } from 'expo';
import { COLOR_PINK, COLOR_BACKGRND, COLOR_DGREY, COLOR_LGREY, COLOR_PURPLEPINK } from './../components/commonstyle';
import PostView from '../utils/Post'


const list = [
    {
        name: 'Amy Farha',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'Vice President'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Vice Chairman'
    },
]

export default class HomeScreen extends React.Component {
    // initialize state
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            name: "user",
            isLoading: true,
            postList: null,
            refreshing: false,
            query: '',
            searchResults: [],
        };
    }

    // authenticate user
    componentDidMount() {
        users_ref = firebase.firestore().collection("users");
        users_ref.doc(firebase.auth().currentUser.uid).get().then(function(doc) {
            console.log("inside get " + firebase.auth().currentUser.uid)
            this.getPosts(10, firebase.auth().currentUser, doc.data().first);

            this.setState({
                isLoading: false,
                postList: null,  //this may be bad because I'm relying on getPosts to take longer so test it with this removed later
            })

            console.log("does it work here? " + this.state.postList)
            //this.forceUpdate();
        }.bind(this)).catch ((error) => {console.error(error);});
    }



    componentWillReceiveProps(newprops) {

        console.log("in component will receive props")
        users_ref = firebase.firestore().collection("users");
        users_ref.doc(firebase.auth().currentUser.uid).get().then(function(doc) {
            console.log("inside get " + firebase.auth().currentUser.uid)
            this.getPosts(10, firebase.auth().currentUser, doc.data().first);

            this.setState({
                isLoading: false,
                postList: null, //this may be bad because I'm relying on getPosts to take longer so test it with this removed later
            })

            console.log("does it work here? " + this.state.postList)
            //this.forceUpdate();
        }.bind(this)).catch ((error) => {console.error(error);});

    }

    getPosts(numPosts, currUser, firstName){
        this.setState({postList: null})
        var postList = [];
        var postIDs = [];
        //Get up to 10 most recent posts from users that this user follows
        follows_ref = firebase.firestore().collection("Follows");               //get the Follows collection
        var followed = [];                                                      //this will contain the users that this user follows
        follows_ref
        .where("userID", "==", firebase.auth().currentUser.uid)                 //look in follows table for this user
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {                               //for each match
                followed.push(doc.data().followedID);                           //add to followed array
            });


            posts_ref = firebase.firestore().collection("Posts")                //get the Posts collection
            var numPosts = 0
            posts_ref
            .orderBy("timestamp", "desc")                                               //order by time
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {                           //for each match
                    if ((followed.includes(doc.data().userID) || (firebase.auth().currentUser.uid == doc.data().userID)) && numPosts < 10) {  //if this post's poster is followed by this user
                        console.log("user followed: " + doc.data().userID)
                        postIDs.push(doc.data().postID);
                        numPosts++
                    }

                });
                postIDs.forEach(function(thisPostID) {
                    postList.push(<PostView postID={thisPostID} />);
                })

                console.log(postIDs)
                //postList = postIDs.map((id)=> <PostView postID={id} />)
                console.log("here")

                console.log(postList)
                this.setState(
                    {
                        currentUser: currUser,
                        name: firstName,
                        postList: postList,
                    }
                );
            }.bind(this))
        }.bind(this))
    }

    _onRefresh = () => {
        this.setState({refreshing: true, postList: null});
        users_ref = firebase.firestore().collection("users");
        users_ref.doc(firebase.auth().currentUser.uid).get().then(function(doc) {
            console.log("inside get " + firebase.auth().currentUser.uid)
            this.getPosts(10, firebase.auth().currentUser, doc.data().first);

            this.setState({
                isLoading: false,
                refreshing: false,
            })

            console.log("refresh " + this.state.postList)
            this.forceUpdate()
            //this.forceUpdate();
        }.bind(this)).catch ((error) => {console.error(error);});
    }

    updateSearch = (value) => {
        this.setState({ query: value });
        console.log(this.state.query)
        users_ref = firebase.firestore().collection("users");
        users_ref
            .where("first", "==", value)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    console.log(doc.data().first);
                    console.log(doc.data().last);
                });
            })
    }

    render() {
        if(this.state.isLoading) {
            return ( false )
        }
        console.log( "inside homescreen render" + this.state.loading + " - " + this.state.name);

        console.log("inside render " + this.state.postList)

        return (
            <View style={styles.container}>
                <View style={{flex:1, flexDirection:'row', alignItems:'flex-end'}} >
                    <Text style={styles.textPink}>
                        Welcome, {this.state.name}!
                    </Text>
                </View>
                <View style={{flex: 1, flexDirection:'column'}}>
                    <TextInput
                        style={styles.search} placeholder={"SEARCH"}
                        onChangeText={this.updateSearch}
                        value={this.state.query}
                    />
                    {
                        list.map((l) => (
                            <ListItem
                                roundAvatar
                                avatar={{uri: l.avatar_url}}
                                key={l.name}
                                title={l.name}
                            />
                        ))
                    }
                    <Button title="New Post Upload" color= '#f300a2'
                        onPress={() => this.props.navigation.navigate('NewPostUpload')}
                    />
                    <Button title="View Emma's Profile" color= '#f300a2'
                        onPress={() => this.props.navigation.navigate('Profile', {userID: 'qZC2oLFxa8NgzyesghbtmujjQcO2'})}
                    />
                </View>
                <View style={{flex: 7, flexDirection: 'column'}}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40}}
                                refreshControl={ <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} /> }>
                        {this.state.postList}
                    </ScrollView>

                </View>
                <View style={{flex:1, flexDirection: 'row',alignItems:'flex-end', marginLeft: 10, marginRight: 10,}}>
                    <View style={{flex:1, flexDirection:'column',marginRight:10,}}>
                        <Button title="View Profile" color= '#f300a2'
                            onPress={() => this.props.navigation.navigate('Profile', {userID: firebase.auth().currentUser.uid})}
                        />
                    </View>
                    <View style={{flex:1, flexDirection:'column',}}>
                        <Button
                            title="Log Out"
                            color= '#f300a2'
                            onPress={() => firebase.auth().signOut().then(function() {
                            console.log('Signed Out');
                            this.props.navigation.navigate('Login')
                            }.bind(this))}
                        />
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        fontSize: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR_BACKGRND,
    },
    textPink: {
        color: COLOR_PINK,
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
})