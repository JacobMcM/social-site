<template>
    <v-app max-width="400">
    
        <v-tabs
        fixed-tabs
        background-color="indigo-darken-2"
        theme="dark"
        width="400"
        >
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
        
        <div v-if="ready">

            <v-btn block @click="this.isMakePost = !this.isMakePost">
                Make a Post
            </v-btn>
            
            <div v-if="this.currUser.id === this.profileUser.id && isMakePost">
                <h1>this is your profile</h1>                
                <v-form width="400" >
                    <v-text-field
                        v-model="postTitle"
                        width="400"
                        :rules="rules"                            
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
            

            <div v-if="this.whichTab === 'posts'">
                <h1> your looking at posts </h1>
                <div v-for="post in profileUserPosts" :key="post.id">

                    <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" 
                           @likePost="likePost(post)" @addComment="addComment(post)"
                           :postTitle="post.postTitle" :userName="post.userName" 
                           :postContent="post.postContent" :numLikes="post.numLikes" 
                           :numComments="post.numComments"/>

                </div>
            </div>

            <div v-if="this.whichTab === 'followers'">
                <h1>Followers is Unfinshed</h1>
            </div>

            <div v-if="this.whichTab === 'following'">
                <h1>Followers is Unfinshed</h1>
            </div>
        </div>

    </v-app>
</template>

<script>
import Posts from '@/components/Posts'

export default {
    name: 'Profile',
    data() {
        return {
            users: [],
            posts: [],

            whichTab: 'posts',
            isMakePost: false,

            profileUser: [{"id": "placeHolder2",}],
            profileUserId: 0,
            profileUserPosts: [],
            profileUserFollowers: [],
            profileUserFollowing: [],
            
            currUser: [{"id": "placeHolder1",}],

            ready: false,

            postTitle: "",
            postContent: "",

            rules: [v => v !== "" && v.length <= 25 || 'Max 25 characters'],
        }
    },
    components : {
        Posts

    },
    methods: {
        async fetchUsers() {
            console.log(1);
            const res = await fetch('http://localhost:5000/users')
            console.log(2);
            const data = await res.json()
            return data
        },
        async fetchPosts() {
            const res = await fetch('http://localhost:5000/posts')
            const data = await res.json()
            return data
        },
        async updateSearch() {
            console.log(this.message1)
            this.users = await this.fetchUsers()
            this.posts = await this.fetchPosts()

            this.users = this.users.filter(name => {return name['userName'].indexOf(this.message1) >= 0 || 
            name['accountId'].indexOf(this.message1) >= 0})
            this.posts = this.posts.filter(name => {return name['userName'].indexOf(this.message1) >= 0 || 
            name['postTitle'].indexOf(this.message1) >= 0 || name['postContent'].indexOf(this.message1) >= 0 })           
        },
        async makePost(){
            console.log(this.postTitle)
            console.log(this.postContent)
            
            const newPost = {
                userName: this.currUser.userName,
                userId: this.currUser.id,
                postTitle: this.postTitle,
                postContent: this.postContent,
                numLikes: 0,
                numComments: 0,
                comments: []
            }

            this.addPost(newPost)
            
            const id = this.$route.params.id
            this.profileUserPosts = await this.pullPostsFromProp("userId", id)

            console.log("adding the new")

            this.postTitle = ""
            this.postContent = ""
            this.isMakePost = false
        },
        async addPost(post) {
            const res = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(post),
            })
        },
        fetchCurrUser() {
            const data = sessionStorage.getItem('username')            
            return this.pullUserFromProp("userName", data)
        },
        async fetchProfileUser(){
            const id = this.$route.params.id
            const profileUser = await this.pullUserFromProp("id", id)
            this.profileUserId = id
            this.profileUserPosts = await this.pullPostsFromProp("userId", id)
            this.profileUserFollowers = profileUser.followedByAccounts
            this.profileUserFollowing = profileUser.followingAccounts
            return profileUser
        },
        isPosts() {
            this.whichTab = 'posts'
        },
        isFollowers(){
            this.whichTab = 'followers'
        },
        isFollowing(){
            this.whichTab = 'following'
        },
        async pullUserFromProp(prop, searchTerm){
            const userArr = await (await fetch(`http://localhost:5000/users?${prop}=${searchTerm}`)).json()
            const user = userArr.at(0)
            return user
        },
        async pullPostsFromProp(prop, searchTerm){
            console.log(prop + " and " + searchTerm)
            const postArr = await (await fetch(`http://localhost:5000/posts?${prop}=${searchTerm}`)).json()
            return postArr
        }   
    },
    async created(){        
        this.users = await this.fetchUsers()
        this.posts = await this.fetchPosts()
        this.currUser = await this.fetchCurrUser()
        this.profileUser = await this.fetchProfileUser()

        this.ready = true
    

    }
}
</script>
