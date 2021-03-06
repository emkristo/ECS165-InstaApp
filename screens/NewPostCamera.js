import React from 'react'
import { View, Text, StyleSheet, TouchableHighlight, TextInput, ScrollView, Image, Platform, KeyboardAvoidingView, Dimensions } from 'react-native'
import * as firebase from 'firebase';
import { COLOR_PINK, COLOR_BACKGRND, COLOR_DGREY, COLOR_LGREY , COLOR_PURPLEPINK} from './../components/commonstyle';
import { uploadPhoto } from '../utils/Photos'
import { ImagePicker } from 'expo';
import { Button } from 'native-base';


export default class NewPostCamera extends React.Component {
    // authenticate user
    componentDidMount() {

    }

    state = {
        errorMessage: null,
        finishedEdit: false,
        image: null,
        isImgLoading: true,
        photoID: firebase.auth().currentUser.uid + Date.now(),
        caption: '',
        numComments: 0,
        userID: firebase.auth().currentUser.uid,
    }

    handlePost = () => {
        const { uploadedImageURL, photoID, caption, numComments, userID, tags } = this.state
        firebase.firestore().collection("Posts").doc(photoID).set({
            photoID: photoID,
            postID: photoID,
            caption: caption,
            numComments: numComments,
            userID: userID,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            tags: tags,
        }).then(function() {
            firebase.firestore().collection("Photo").doc(photoID).set({
                photoID: photoID,
                imageUri: uploadedImageURL,
            }).then(function() {
                tagArr = tags.split(" ")
                console.log(tagArr)
                tagArr.forEach(function(tag) {
                    console.log(tag)

                    firebase.firestore().collection("Tags").doc(tag).get().then(function(doc) {
                        postIDList = []
                        if (doc.exists) {
                            postIDList = doc.data().posts;
                            console.log(doc.data())
                        }
                        console.log(postIDList)
                        postIDList.push(photoID)
                        console.log(postIDList)
                        firebase.firestore().collection("Tags").doc(tag).set({
                            posts: postIDList,
                            tag: tag
                        })
                    })

                })
                this.setState({finishedPost: true});
            }.bind(this))
        }.bind(this))

    }

    getCameraAndCameraRollPermissions = async() => {
        console.log("trying to get camera roll permissions")
        const {  Permissions } = Expo;
        // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
        const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
        console.log("status: " + status)
        return status
    };

    // set a profile picture
    takePhoto = async () => {
        var status = await this.getCameraAndCameraRollPermissions();
        if (status === 'granted') {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                base64: true,
                aspect: [1, 1],
            });

            if (!result.cancelled) {
                await this.setState({image: result.uri,});
                const path = "Posts/".concat(this.state.photoID, ".jpg");
                console.log(result.uri);
                console.log(path);
                return uploadPhoto(result.uri, path).then(function() {
                    this.setState({isImgLoading: true})
                    this.getUploadedImage(this.state.photoID).then(function() {
                        this.setState({isImgLoading: false})
                    }.bind(this));
                }.bind(this));
            }
        }
    };

    getUploadedImage = async(photoID) => {
          console.log("in get profile image");
            console.log(photoID)
            const path = "Posts/".concat(photoID, ".jpg");
            console.log(path)
            const image_ref = firebase.storage().ref(path);
            const downloadURL = await image_ref.getDownloadURL()

            if (!downloadURL.cancelled) {
              console.log("testing1")
              console.log(downloadURL)
              this.setState({uploadedImageURL: downloadURL, isImgLoading:false,});
          }
    };

    render() {
        if (this.state.finishedPost) {
            return (this.props.navigation.navigate('HomeScreen', {userID: firebase.auth().currentUser.uid}))
        }
        const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
        return (
            <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                keyboardVerticalOffset = {keyboardVerticalOffset}
                behavior="padding"
                enabled
            >
            <ScrollView showsVerticalScrollIndicator={false} >
                <View style={{flex:1, flexDirection:'column',}} >
                    <View style={{flex:1, paddingTop: 40,}}>
                        <TouchableHighlight style={styles.outerSquare} onPress={this.takePhoto}>
                          <Image
                              style={styles.innerSquare}
                              source = {{uri: this.state.uploadedImageURL}}
                          />
                        </TouchableHighlight>
                    </View>
                    <View style={{flex:3}}>
                        <TextInput
                            placeholderTextColor='#f300a2'
                            placeholder="Caption"
                            style={styles.textInput}
                            onChangeText={caption => this.setState({ caption })}
                            value={this.state.caption}
                        />
                        <TextInput
                            placeholderTextColor='#f300a2'
                            placeholder="Tags (separated by space)"
                            style={styles.textInput}
                            onChangeText={tags => this.setState({ tags })}
                            value={this.state.tags}
                            autoCapitalize="none"
                        />
                        <View style = {styles.doneButton} >
                            <Button style={{backgroundColor: '#f300a2', width: 100, justifyContent: 'center'}} onPress={this.handlePost}>
                                <Text style={{color: 'white'}}>Post</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
            </View>
        )
    }
}

//note: font not working

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //paddingTop: 40,
        flexDirection: 'column',
        fontSize: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR_BACKGRND,
    },
    outerSquare: {
        width:  Dimensions.get('window').width * 0.9,
        height:  Dimensions.get('window').width * 0.9,
        backgroundColor: COLOR_DGREY,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },

    innerSquare: {
        width:  Dimensions.get('window').width * 0.9,
        height:  Dimensions.get('window').width * 0.9,
        backgroundColor: COLOR_DGREY,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textInput: {
        height: 40,
        width: Dimensions.get('window').width * 0.9,
        color: COLOR_PINK,
        marginTop: 20,
        backgroundColor: COLOR_DGREY,
        paddingLeft: 10,
        borderRadius: 12
    },
    doneButton: {
        alignItems: 'stretch',
        justifyContent: 'center',
        // flex: 1,
        flexDirection: 'row',
        marginTop: 30,
    },
})
