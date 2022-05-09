<template>

    <!--The "ready" variable is used to determine of the current page is finnished loading all data-->
    <div v-if="!ready">
        <v-progress-circular
            :size="70"
            :width="7"
            color="orange"
            indeterminate
        ></v-progress-circular>        
    </div>
    <div v-else :key="this.filteredPosts.length">

        <!--if a new user doesnt follow anybody, their homepage would be blank, if so this is redered to remind the new user to check the search page-->
        <div v-if="isFirstTimeUser">
            <v-card
                class="mx-auto"
                max-width="400"
            >            
                <v-img
                class="align-end text-orange"
                height="200"
                src="https://media.istockphoto.com/photos/robin-picture-id473189866?k=20&m=473189866&s=612x612&w=0&h=SkfLTryaUVhnWAE0f2ZgjmtPSNGjT_9m1AwvPUZcBP4="
                cover
                >
                
                </v-img>

                <v-card-title class="text-orange">Welcome to Robin&trade;</v-card-title>

                <v-card-subtitle class="pt-4">
                We're so glad you're here!
                </v-card-subtitle>

                <v-card-text>
                    To start enjoying our site try finding some interesting Users in our search page
                </v-card-text>

                <v-card-actions>
                <v-btn color="orange" @click="toSearch">
                    Have Fun!
                </v-btn>
                </v-card-actions>
            </v-card>
        </div>

        <!--renders all posts within the filtered list of posts from users the currUser follows-->
        <div v-for="post in this.filteredPosts" :key="post.id">
            <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" @likePost="likePost(post)" :postTitle="post.postTitle" :userName="post.userName" :postContent="post.postContent" :numLikes="post.numLikes" />
        </div>
    </div>
</template>

<script>
import Posts from '@/components/Posts'

export default {
    name: 'Home',
    data() {
        return {

            //a local copy of users from db.json
            users: [],
            //a local copy of posts from db.json
            posts: [],

            //a filterd list of posts from users that the currUser Follows
            filteredPosts: [],

            //a variable for if the current user is not following anyone, as if they were a first time user
            isFirstTimeUser: false,

            //used to determine if the page is done loading or "ready"
            ready: false

        }
    },
    components: {
        Posts
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

        //return current User by pulling from the sessionStorage and feeding that data into "this.pullDataFromSourceProp"
        async fetchCurrUser() {
            const data = sessionStorage.getItem('username')         
            return this.pullDataFromSourceProp("users","userName", data)
        },

        //check every post, if the post has the same author as someone the currUser follows then the post gets added to the filterd list.
        async filterPosts() {

            let filteredPosts = []
            const currUser = await this.fetchCurrUser()

            for (let postIndex in this.posts){
                const post = this.posts.at(postIndex)
                const postUserName = post.userName
                for (let followingIndex in currUser.followingAccounts){
                    const following = currUser.followingAccounts.at(followingIndex)
                    if (following === postUserName){
                        filteredPosts.push(post)
                    }
                }
            }
            
            //if filteredList returns empty, the user will be a firstTimeUser
            if (filteredPosts.length === 0){
                this.isFirstTimeUser = true
            }
            return filteredPosts
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

        //will return a specific user or post (aka the source), by feeding a property (aka prop) of the source (such as id or userName) and the value (aka searchterm) of said property (such as 4 or "carl")
        async pullDataFromSourceProp(source, prop, searchTerm){

            let data = await (await fetch(`http://localhost:5000/${source}?${prop}=${searchTerm}`)).json()
            if (source === "users"){
                data = data.at(0)
            }
            return data
        },

        //used to send to the account linked with a post or user
        async toAccount(data){
            let id = 0

            if (typeof(data.userId) === "undefined"){//aka if its a User
                id = data.id
            }else{//aka if its a post
                id = data.userId
            }

            this.$router.push(`/profile/${id}`)
        },
        //send to search page
        toSearch(){
          this.$router.push('/search');
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
            this.filteredPosts = await this.filterPosts()
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

                            this.patchFollowers(postUser, "followedByAccounts", postUser.followedByAccounts)
                        }
                    }
                }else{

                    currUser.followingAccounts.push(postUserName)

                    //patch the currUser followingAccounts
                    
                    await this.patchFollowers(currUser, "followingAccounts", currUser.followingAccounts)
                    
                    //patch the postUser followedByAccounts

                    postUser.followedByAccounts.push(currUser.userName)

                    await this.patchFollowers(postUser, "followedByAccounts", postUser.followedByAccounts)                    
                }

                this.ready = false
                this.filteredPosts = await this.filterPosts()
                this.ready = true
            }
        },
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts(),

        this.filteredPosts = await this.filterPosts(),

        //when everything is done the page becomes "ready"
        this.ready = true 
        
    }
}
</script>
