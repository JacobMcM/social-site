<template>
    <v-app>

        <!--will update the search when "enter" is pressed-->
        <v-text-field @keyup.enter="updateSearch"
            v-model="searchMessage"
            label="Search"
            width="400"           
         ></v-text-field>

        <!--The "ready" variable is used to determine of the current page is finnished loading all data-->
        <div v-if="!ready">
            <v-progress-circular
                :size="70"
                :width="7"
                color="orange"
                indeterminate
            ></v-progress-circular>        
        </div>
        <div v-else>
            
            <!--unlike other pages, every User and Post is rendered on the search page-->

            <div v-for="user in users" :key="user.id">
                <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user.userName"/>         
            </div>

            <div v-for="post in posts" :key="post.id">
                <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" 
                    @likePost="likePost(post)"
                    :postTitle="post.postTitle" :userName="post.userName" 
                    :postContent="post.postContent" :numLikes="post.numLikes"/>
            </div>
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

            //the stored variable of the searchbar
            searchMessage:'',

            //a local copy of the current User
            currUser: [],

            //used to determine if the page is done loading or "ready"
            ready: false
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

        //filters the rended posts and users based on the value of the searchbar
        async updateSearch() {
            this.ready = false
            this.users = await this.fetchUsers()
            this.posts = await this.fetchPosts()

            this.users = this.users.filter(name => {return name.userName.indexOf(this.searchMessage) >= 0})
            this.posts = this.posts.filter(name => {return name.userName.indexOf(this.searchMessage) >= 0 || name.postTitle.indexOf(this.searchMessage) >= 0 || name.postContent.indexOf(this.searchMessage) >= 0 })
            this.ready = true      
        },

        //return current User by pulling from the sessionStorage and feeding that data into "this.pullDataFromSourceProp"
        async fetchCurrUser() {
            const data = sessionStorage.getItem('username')            
            return this.pullDataFromSourceProp("users","userName", data)
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

            if (typeof(data.userId) === "undefined"){//aka if its a User
                id = data.id
            }else{//aka if its a post
                id = data.userId
            }
            this.$router.push(`/profile/${id}`)
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
            }          
        }
    },
    async created(){
        this.users = await this.fetchUsers()
        this.posts = await this.fetchPosts()
        this.currUser = this.fetchCurrUser()

        //when everything is done the page becomes "ready"
        this.ready = true
    }
}
</script>