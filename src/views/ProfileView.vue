<template>
    <v-app max-width="400">
        
        <!--The "ready" variable is used to determine of the current page is finnished loading all data-->
        <div v-if="ready">
            <card
            theme="dark"
            >
                <v-card-title class="bg-orange">
                    <span>{{ this.profileUser.userName }}</span>
                </v-card-title>
            </card>
            <v-tabs
            fixed-tabs
            background-color="orange"
            theme="dark"
            width="400"
            >   
                <!--the currUser can switch between these three tabs-->
                <v-tab @click="isPosts" class="posts">
                    Posts
                </v-tab>
                <v-tab @click="isFollowers" class="followers">
                    Followers
                </v-tab>
                <v-tab @click="isFollowing" class="following">
                    Following
                </v-tab>
            </v-tabs>

            <!--if the current user and the profile user are the same the operator can use this page to make a post-->
            <div v-if="this.currUser.id === this.profileUser.id">
                <v-btn block @click="this.isMakePost = !this.isMakePost">
                Make a Post
                </v-btn>  

                <div v-if="isMakePost">

                           
                    <v-form width="400" >
                        <v-text-field
                            v-model="postTitle"
                            width="400"                          
                            clearable
                            clear-icon="mdi-delete"
                            maxlength="400"
                            label="Post Title"                        
                        ></v-text-field>
                        <v-textarea
                            v-model="postContent"
                            clearable
                            counter
                            clear-icon="mdi-delete"
                            label="Post Content"
                        ></v-textarea>

                        <v-btn @click="makePost">Make Post</v-btn>                            
                    </v-form>
                </div>
            </div>
            

            <div v-if="this.whichTab === 'posts'" >
                <div :key="profileUserPosts.length">
                    <div v-for="post in profileUserPosts" :key="post.id">

                        <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" 
                            @likePost="likePost(post)"
                            :postTitle="post.postTitle" :userName="post.userName" 
                            :postContent="post.postContent" :numLikes="post.numLikes" />

                    </div>
                </div>

                <h1 v-if="profileUserPosts.length === 0">{{ this.profileUser.userName }} Has No Posts</h1>
                
            </div>

            <div v-if="this.whichTab === 'followers'">                
                <div :key="profileUserFollowers">
                    <div v-for="user in profileUserFollowers" :key="user.id">
                        <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user"/>
                    </div>
                </div>

                <h1 v-if="this.profileUserFollowers.length === 0">{{ this.profileUser.userName }} Has No Followers</h1>
                
                
            </div>

            <div v-if="this.whichTab === 'following'">
                <div :key="profileUserFollowing.length">
                    <div v-for="user in profileUserFollowing" :key="user.id">
                        <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user"/>
                    </div>
                </div>

                <h1 v-if="this.profileUserFollowing.length === 0">{{ this.profileUser.userName }} Is Following Nobody</h1>
                
            </div>
        </div>
      
        <div v-else>
            <v-progress-circular
            :size="70"
            :width="7"
            color="orange"
            indeterminate
            ></v-progress-circular>   
        </div>
        

    </v-app>
</template>

<script>
import Posts from '@/components/Posts'
import User from '@/components/Users'

export default {
    name: 'Profile',
    data() {
        return {
            //a local copy of users from db.json
            users: [],
            //a local copy of posts from db.json
            posts: [],

            //kees track of which tab is currently selected
            whichTab: 'posts',

            //keeps track of whether the user has the makePosts tray open
            isMakePost: false,

            //a local copy of the profileUser's data
            profileUser: [],
            profileUserId: 0,
            profileUserPosts: [],
            profileUserFollowers: [],
            profileUserFollowing: [],
            
            //a local copy of the current User
            currUser: [],

            
            //used to determine if the page is done loading or "ready"
            ready: false,

            //the values which store the values of the in-progress post
            postTitle: "",
            postContent: "",
        }
    },
    components : {
        Posts,
        User

    },
    methods: {
        //return Users from db.json
        async fetchUsers() {
            const res = await fetch('http://localhost:5000/users')
            const data = await res.json()
            return data
        },
        //return Posts from db.json
        async fetchPosts() {
            const res = await fetch('http://localhost:5000/posts')
            const data = await res.json()
            return data
        },

        //takes the data from the makePost form, creates a new post from that data, and sends this new post to addPost
        async makePost(){
            
            const newPost = {
                userName: this.currUser.userName,
                userId: this.currUser.id,
                postTitle: this.postTitle,
                postContent: this.postContent,
                numLikes: 0
            }

            this.addPost(newPost)
            
            const id = this.$route.params.id
            this.profileUserPosts = await this.pullDataFromSourceProp("posts", "userId", id)
            
            this.postTitle = ""
            this.postContent = ""
            this.isMakePost = false
        },

        //adds the post to db.json
        async addPost(post) {
            const res = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(post),
            })
        },

        //return current User by pulling from the sessionStorage and feeding that data into "this.pullDataFromSourceProp"
        async fetchCurrUser() {
            const data = sessionStorage.getItem('username')            
            return this.pullDataFromSourceProp("users","userName", data)
        },

        //finds and assigns all associated data arround this.profileUser 
        async fetchProfileUser(){
            const id = this.$route.params.id
            const profileUser = await this.pullDataFromSourceProp("users","id", id)
            this.profileUserId = id
            this.profileUserPosts = await this.pullDataFromSourceProp("posts","userId", id)
            this.profileUserFollowers = profileUser.followedByAccounts
            this.profileUserFollowing = profileUser.followingAccounts
            return profileUser
        },

        //these three are used to change which tab is being viewed
        isPosts() {
            this.whichTab = 'posts'
        },
        isFollowers(){
            this.whichTab = 'followers'
        },
        isFollowing(){
            this.whichTab = 'following'
        },

        //will return a specific user or post (aka the source), by feeding a property (aka prop) of the source (such as id or userName) and the value (aka searchterm) of said property (such as 4 or "carl")
        async pullDataFromSourceProp(source, prop, searchTerm){

            let data = await (await fetch(`http://localhost:5000/${source}?${prop}=${searchTerm}`)).json()
            if (source === "users"){
                data = data.at(0)
            }
            return data
        },

        //take the current number of likes a post has and add one, then update the post in db.json with this new value
        async likePost(data) {
            const newlikes = data.numLikes++

            
            fetch(`http://localhost:5000/posts/${data.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    numLikes: newlikes,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
            })                        
        },

        //used to send to the account linked with a post or user
        async toAccount(data){

            let id = 0

            if(typeof(data) === "string"){//needed for how users are rended on Profile
                const user = await this.pullDataFromSourceProp("users", "userName", data)
                id = user.id
            }else if (typeof(data.userId) === "undefined"){//aka if its a User
                id = data.id
            }else{//aka if its a post
                id = data.userId
            }

            await this.$router.push(`/profile/${id}`)

            //if a user attempts to go from one profile to annother, the router wont automatically re-render the page, so im forced to refresh
            this.$router.go()
        },

        //used by "this.followAccount" to patch changed data into db.json
        async patchFollowers(user, changedDataSet, changedData){
            if (changedDataSet === "followingAccounts"){
                fetch(`http://localhost:5000/users/${user.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        followingAccounts: changedData,
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })
            }else{
                fetch(`http://localhost:5000/users/${user.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        followedByAccounts: changedData,
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })
            }
        },

        //determines the currUser and postUser and updates their followingAccounts and followedByAccounts respectivly
        async followAccount(post){

            let postUserName = ''

            if (typeof(post) === "string"){
                postUserName = post //format need for the different way users are rendered compared to posts
            }else{
                postUserName = post.userName
            }            

            const postUser = await this.pullDataFromSourceProp("users","userName", postUserName)

            const currUser = await this.pullDataFromSourceProp("users","userName", sessionStorage.getItem('username'))

            let isAlreadyFollowing = false

            //check if currUser is already following postUser, then unfollow user
            if (postUserName !== currUser.userName){//you can't follow or unfollow yourself
                
                
                for(let followerIndex in currUser.followingAccounts){
                    const follower = currUser.followingAccounts.at(followerIndex)

                    if (!isAlreadyFollowing && postUser.userName === follower){

                        
                        isAlreadyFollowing = true
                        
                        currUser.followingAccounts.splice(followerIndex, 1)

                        await this.patchFollowers(currUser, "followingAccounts", currUser.followingAccounts)
                    }
                }

                if (isAlreadyFollowing){
                    for(let followerIndex in postUser.followedByAccounts){
                        const follower = postUser.followedByAccounts.at(followerIndex)

                        if (follower === currUser.userName){
                            postUser.followedByAccounts.splice(followerIndex, 1)

                            await this.patchFollowers(postUser, "followedByAccounts", postUser.followedByAccounts)
                        }
                    }
                }else{

                    currUser.followingAccounts.push(postUserName)

                    //patch the currUser followingAccounts
                    
                    await this.patchFollowers(currUser, "followingAccounts", currUser.followingAccounts)
                    
                    //patch the postUser followedByAccounts

                    postUser.followedByAccounts.push(currUser.userName)

                    await this.patchFollowers(postUser, "followedByAccounts", postUser.followedByAccounts)

                    //update this.profileUserFollowers: [] & this.profileUserFollowing: [],
                }

                this.currUser = await this.fetchCurrUser()

                this.profileUser = await this.fetchProfileUser()
            }                
        }
    },
    async created(){        
        this.users = await this.fetchUsers()
        this.posts = await this.fetchPosts()
        this.currUser = await this.fetchCurrUser()
        this.profileUser = await this.fetchProfileUser()

        //when everything is done the page becomes "ready"
        this.ready = true
    

    }
}
</script>
