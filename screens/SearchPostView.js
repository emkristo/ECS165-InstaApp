import React from 'react'
// import { StyleSheet, Platform, Image, Text, View, Button, ScrollView, RefreshControl, } from 'react-native'
import { StyleSheet, ScrollView, RefreshControl, View, Platform , StatusBar, FlatList} from 'react-native'
import * as firebase from 'firebase';
import { ImagePicker } from 'expo';
import { COLOR_PINK, COLOR_BACKGRND, COLOR_DGREY, COLOR_LGREY, COLOR_PURPLEPINK } from './../components/commonstyle';
import PostView from '../utils/Post'
import { Container, Header, Title, Content, Footer, FooterTab, Left, Right, Body, Icon, Text, ActionSheet, Root } from 'native-base';
import { getTheme } from '../native-base-theme/components';
import { custom } from '../native-base-theme/variables/custom';
import { withNavigation } from 'react-navigation';
import { ListItem, Button }  from 'react-native-elements'

var BUTTONS = ["Take a Photo", "Upload a Photo", "Cancel"];
var LOCATIONS = ["NewPostCamera", "NewPostUpload", "HomeScreen"]
var CANCEL_INDEX = 2;

const list = []

export default class SearchPostView extends React.Component {
    // initialize state
    constructor(props) {
        super(props);
        this.state = {postList: [], isLoading: true}
        console.log("inside constructor")
        this.getPosts = this.getPosts.bind(this)
        this.getPosts()

    }

    // authenticate user
    componentDidMount() {
        console.log("inside component did mount")
        this.getPosts()
    }

    componentWillReceiveProps(newprops) {
        this.getPosts()
        console.log("inside of componenet will receive props")
    }

    getPosts() {
        var postarray = this.props.navigation.getParam('postarray', [])
        var postList = []
        postarray.forEach(function(thisPostID) {
            postList.push({key: thisPostID})
        })
        this.setState({postList: postList})
    }

    renderItem = ({item, index}) => (
        <PostView postID={item.key}/>
    );

    render() {
        return (
            <Root>
            <Container style={styles.container}>
                <Header style={styles.header}>
                    <Left>
                        <Button
                            onPress={() => this.props.navigation.goBack()}
                            title="Back"
                            type="clear"
                            titleStyle={{color: 'white'}}
                        />
                    </Left>
                    <Body>
                        <Title style={{color: 'white'}}>{"#" + this.props.navigation.getParam('tag', '')}</Title>
                    </Body>
                    <Right />
                </Header>

                <Content contentContainerStylestyle={styles.content}>
                    <View style={{flex:1, marginTop: 50, justifyContent: 'center'}}>
                    <View>
                    <FlatList contentContainerStyle={styles.list} data={this.state.postList} renderItem={this.renderItem} initialNumToRender={3}/>
                    </View>
                    </View>
                </Content>

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
    header: {
        backgroundColor: COLOR_DGREY,
        borderBottomWidth: 0,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight: 20,
        height: Platform.OS === "android" ? 80: undefined
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
    }
})
