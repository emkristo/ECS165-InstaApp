import React from 'react'
// import { StyleSheet, Platform, Image, Text, View, Button, ScrollView, RefreshControl, } from 'react-native'
import { StyleSheet, Platform, ScrollView, RefreshControl, TextInput, View, KeyboardAvoidingView } from 'react-native'
import * as firebase from 'firebase';
import { ImagePicker } from 'expo';
import { COLOR_PINK, COLOR_BACKGRND, COLOR_DGREY, COLOR_LGREY, COLOR_PURPLEPINK } from './../components/commonstyle';
import PostView from '../utils/Post'
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, ActionSheet, Root } from 'native-base';
import { getTheme } from '../native-base-theme/components';
import { custom } from '../native-base-theme/variables/custom';
import { withNavigation } from 'react-navigation';
import {ListItem}  from 'react-native-elements'

var BUTTONS = ["Take a Photo", "Upload a Photo", "Cancel"];
var LOCATIONS = ["NewPostCamera", "NewPostUpload", "HomeScreen"]
var CANCEL_INDEX = 2;


var searchResults = []

//remove duplicates from https://reactgo.com/removeduplicateobjects/


export default class SearchTags extends React.Component {
    // initialize state
    constructor(props) {
        super(props);
        this.state = {query: '', searchResults: []}
    }

    // authenticate user
    componentDidMount() {

    }
    componentWillReceiveProps() {
        this.setState({query: ''})
        searchResults = []

    }
    componentWillUnmount() {
        searchResults = []
    }
    updateSearch = (value) => {
        searchResults = []
        let currThis = this;
        if (value) {
            users_ref = firebase.firestore().collection("Tags");
            users_ref
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        //var fullName = doc.data().first + " " + doc.data().last
                        if (doc.data().tag.toLowerCase().includes(value.toLowerCase())) {

                            let currThis = this;

                                searchResults.push(
                                    {
                                        tag: doc.data().tag
                                    }
                                );
                                currThis.setState({searchResults: searchResults, postarray: doc.data().posts})


                        }
                    }.bind(this));
                }.bind(this))
            }
            return searchResults
        }

    handleUpdate = async(query) => {
        this.setState({
          query: query
        }, () => {
          if (query && query.length > 1 ) {
              this.updateSearch(query)
          } else {
              searchResults = []
              this.setState({searchResults: searchResults})
          }
        })
    };


    render() {

        const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
        return (
            <Root>
            <Container style={styles.container}>
                <Content contentContainerStyle={styles.content}>
                <View style={{flex: 1, flexDirection:'column', marginTop: 50}}>
                        <View style={{marginTop:30}}>
                            <Button style={{backgroundColor: '#f300a2', width: 170, justifyContent: 'center'}} onPress={() =>this.props.navigation.navigate('Search')}>
                                <Text style={{color: 'white'}}>People Search</Text>
                            </Button>
                        </View>
                         <TextInput
                             style={styles.search}
                             placeholder={"Search"}
                             placeholderTextColor='#f300a2'
                             onChangeText={query => this.handleUpdate(query) }
                             value={this.state.query}
                         />
                         <KeyboardAvoidingView
                             style={styles.container}
                             keyboardVerticalOffset = {keyboardVerticalOffset}
                             behavior="padding"
                             enabled
                         >
                         <ScrollView>
                         {
                             this.state.searchResults.map(e => e['name']).map((e, i, final) => final.indexOf(e) === i && i).filter(e => searchResults[e]).map(e => searchResults[e]).map((l) => (
                                 <ListItem

                                     key={l.tag}
                                     title={l.tag}
                                     onPress={() => this.props.navigation.navigate('SearchPostView', {postarray: this.state.postarray})}
                                     containerStyle={styles.result}
                                     titleStyle={styles.resultText}
                                     chevronColor='white'
                                     chevron
                                 />
                             ))
                         }
                         </ScrollView>


                         </KeyboardAvoidingView>
                        </View>
                </Content>


                <Footer style={styles.footer}>
                    <FooterTab style={styles.footertab}>

                        <Button
                            onPress={() => this.props.navigation.navigate('HomeScreen', {userID: firebase.auth().currentUser.uid})}>
                            <Icon style={styles.inactiveicon} name="home" />
                        </Button>

                        <Button
                            onPress= {() =>
                                ActionSheet.show(
                                  {
                                    options: BUTTONS,
                                    cancelButtonIndex: CANCEL_INDEX,
                                    title: "How do you want to upload?"
                                  },
                                  buttonIndex => {
                                    this.props.navigation.navigate(LOCATIONS[buttonIndex], {userID: firebase.auth().currentUser.uid});
                                  }
                              )}>
                            <Icon style={styles.inactiveicon} name="add" />
                        </Button>

                        <Button active style={{backgroundColor: 'transparent'}}>
                            <Icon style ={styles.icon} name="search" />
                        </Button>
                        <Button
                            onPress={() => this.props.navigation.navigate('Profile', {userID: firebase.auth().currentUser.uid})}>
                            <Icon style ={styles.inactiveicon} name="person" />
                        </Button>

                    </FooterTab>
                </Footer>

            </Container>
            </Root>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        backgroundColor: COLOR_BACKGRND,
    },
    content: {
        alignItems: 'center',
    },
    footer: {
        backgroundColor: COLOR_DGREY,
        borderTopWidth: 0
    },
    footertab: {
        backgroundColor: COLOR_DGREY,
    },
    welcome: {
        color: COLOR_LGREY,
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        paddingBottom: 20
    },
    icon: {
        color: COLOR_PINK
    },
    inactiveicon: {
        color: COLOR_LGREY
    },
    search: {
        height: 40,
        width: 300,
        color: COLOR_PINK,
        marginTop: 20,
        backgroundColor: COLOR_DGREY,
        paddingLeft: 10,
        borderRadius: 12,
    },
    result: {
        backgroundColor: COLOR_DGREY,
        borderRadius: 12,
        marginTop: 10,
    },
    resultText: {
        color: COLOR_PINK
    }
})
