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

            <div v-if="this.currUser.id === this.profileUser.id">
                <v-btn block @click="this.isMakePost = !this.isMakePost">
                Make a Post
                </v-btn>  

                <div v-if="isMakePost">

                           
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
            </div>
            

            <div v-if="this.whichTab === 'posts'">
                <div :key="profileUserPosts.length">
                    <div v-for="post in profileUserPosts" :key="post.id">

                        <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" 
                            @likePost="likePost(post)" @addComment="addComment(post)"
                            :postTitle="post.postTitle" :userName="post.userName" 
                            :postContent="post.postContent" :numLikes="post.numLikes" 
                            :numComments="post.numComments"/>

                    </div>
                </div>
                
            </div>

            <div v-if="this.whichTab === 'followers'">
                <!-- UNFINNISHED
                <div :key="profileUserFollowers.length">
                    <div v-for="user in profileUserFollowers" :key="profileUserFollowers">
                        <User @toAccount="toAccount(user)" @followAccount="followAccount(post)" 
                            :postTitle="post.postTitle" :userName="post.userName" 
                            :postContent="post.postContent" :numLikes="post.numLikes" 
                            :numComments="post.numComments"/>
                    </div>
                </div>
                -->

                <h1>Followers is Unfinshed</h1>
            </div>

            <div v-if="this.whichTab === 'following'">
                <h1>Followers is Unfinshed</h1>
            </div>
        </div>
      
        <div v-else>
            <v-progress-linear
                indeterminate
                color="yellow darken-2"
            ></v-progress-linear>
            <br>
            <v-progress-linear
                indeterminate
                color="green"
            ></v-progress-linear>
            <br>
            <v-progress-linear
                indeterminate
                color="teal"
            ></v-progress-linear>
            <br>
            <v-progress-linear
                indeterminate
                color="cyan"
            ></v-progress-linear>
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

            profileUser: [],
            profileUserId: 0,
            profileUserPosts: [],
            profileUserFollowers: [],
            profileUserFollowing: [],
            
            currUser: [],

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
            const res = await fetch('http://localhost:5000/users')
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

            console.log(this.profileUserPosts.length)

            console.log(this.profileUserPosts)
            
            const id = this.$route.params.id
            this.profileUserPosts = await this.pullPostsFromProp("userId", id)
            
            console.log(this.profileUserPosts)

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
        },
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
        toAccount(post){
            const id = post.userId
            this.$router.push(`/profile/${id}`)
        },
        async followAccount(post){
            const postUserName = post.userName

            const postUser = await this.pullUserFromProp("userName", postUserName)

            const currUser = await this.pullUserFromProp("userName", sessionStorage.getItem('username'))

            const isAlreadyFollowing = false

            console.log("username is: " + postUser.userName)
            //check if currUser is already following postUser
            for(followingUserName in currUser.followingAccounts){
                console.log(followingUserName)
                if (!isAlreadyFollowing && postUser.userName === followingUserName){
                    console.log('we have a match: ' + postUser.userName + " and " + followingUserName)
                    isAlreadyFollowing = true
                }
            }

            if (!isAlreadyFollowing){

                console.log(currUser.followingAccounts)

                await currUser.followingAccounts.push(postUserName)

                console.log(currUser.followingAccounts)

                //patch the currUser followingAccounts                
                fetch(`http://localhost:5000/users/${currUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    followingAccounts: currUser.followingAccounts,
                }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })
                console.log("patching complete")
                
                //patch the postUser followedByAccounts

                await postUser.followedByAccounts.push(currUser.userName)

                fetch(`http://localhost:5000/users/${postUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    followedByAccounts: postUser.followedByAccounts,
                }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })

                console.log("patching complete")

                //update this.profileUserFollowers: [] & this.profileUserFollowing: [],

                this.currUser = await this.fetchCurrUser()

                //remove for non-profile pages !!!
                this.profileUser = await this.fetchProfileUser()


            }else{
                console.log("you are already following them")
            }
            
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
