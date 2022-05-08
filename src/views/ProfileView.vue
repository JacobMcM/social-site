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
            

            <div v-if="this.whichTab === 'posts'" >
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
                
                <div :key="profileUserFollowers.length">
                    <div v-for="user in profileUserFollowers" :key="user.id">
                        <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user"/>
                    </div>
                </div>
                
            </div>

            <div v-if="this.whichTab === 'following'">
                <div :key="profileUserFollowing.length">
                    <div v-for="user in profileUserFollowing" :key="user.id">
                        <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user"/>
                    </div>
                </div>
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
import User from '@/components/Users'

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
        Posts,
        User

    },
    methods: {
        test(data){
            console.log(data)
        },
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
            this.profileUserPosts = await this.pullDataFromSourceProp("posts", "userId", id)
            
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
            return this.pullDataFromSourceProp("users","userName", data)
        },
        async fetchProfileUser(){
            const id = this.$route.params.id
            const profileUser = await this.pullDataFromSourceProp("users","id", id)
            this.profileUserId = id
            this.profileUserPosts = await this.pullDataFromSourceProp("posts","userId", id)
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
        async pullDataFromSourceProp(source, prop, searchTerm){
            console.log(source + " and " + prop + " and " + searchTerm)

            let data = await (await fetch(`http://localhost:5000/${source}?${prop}=${searchTerm}`)).json()
            if (source === "users"){
                data = data.at(0)
            }
            return data
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
        async toAccount(data){
            if (typeof(data) === "string"){
                const user = this.pullDataFromSourceProp("users",userName, data)
                const id = user.id //format need for the different way users are rendered compared to posts
            }else{
                const id = data.userId
            }

            console.log(id)
            this.$router.push(`/profile/${id}`)
            this.$router.go()
        },
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

            console.log(currUser.followingAccounts)

            //check if currUser is already following postUser, then unfollow user
            for(let followerIndex in currUser.followingAccounts){
                console.log(currUser.followingAccounts.at(followerIndex))
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

                console.log(currUser.followingAccounts)

                currUser.followingAccounts.push(postUserName)

                console.log(currUser.followingAccounts)

                //patch the currUser followingAccounts
                
                await this.patchFollowers(currUser, "followingAccounts", currUser.followingAccounts)
                
                console.log("patching complete")
                
                //patch the postUser followedByAccounts

                postUser.followedByAccounts.push(currUser.userName)

                await this.patchFollowers(postUser, "followedByAccounts", postUser.followedByAccounts)
                
                console.log("patching complete")

                //update this.profileUserFollowers: [] & this.profileUserFollowing: [],
            }

            this.currUser = await this.fetchCurrUser()

            this.profileUser = await this.fetchProfileUser()
            
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
