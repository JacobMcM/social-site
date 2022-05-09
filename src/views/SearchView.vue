<template>
    <v-app>

        <v-text-field @keyup.enter="updateSearch"
            v-model="searchMessage"
            label="Search"
            width="400"           
         ></v-text-field>
        <div v-if="!ready">
            <v-progress-circular
                :size="70"
                :width="7"
                color="orange"
                indeterminate
            ></v-progress-circular>        
        </div>
        <div v-else>
            
            <div v-for="user in users" :key="user.id">
                <User @toAccount="toAccount(user)" @followAccount="followAccount(user)" :userName="user.userName"/>         
            </div>

            <div v-for="post in posts" :key="post.id">
                <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" 
                    @likePost="likePost(post)" @addComment="addComment(post)"
                    :postTitle="post.postTitle" :userName="post.userName" 
                    :postContent="post.postContent" :numLikes="post.numLikes" 
                    :numComments="post.numComments"/>
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
            users: [],
            posts: [],
            searchMessage:'',
            currUser: [],
            ready: false
        }
    },
    components : {
        Posts,
        User

    },
    methods: {
        async fetchUsers() {
            const res = await fetch('/api/users')
            const data = await res.json()
            return data
        },
        async fetchPosts() {
            const res = await fetch('/api/posts')
            const data = await res.json()
            return data
        },
        async updateSearch() {
            console.log(this.searchMessage)

            this.ready = false
            this.users = await this.fetchUsers()
            this.posts = await this.fetchPosts()

            this.users = this.users.filter(name => {return name.userName.indexOf(this.searchMessage) >= 0})
            this.posts = this.posts.filter(name => {return name.userName.indexOf(this.searchMessage) >= 0 || name.postTitle.indexOf(this.searchMessage) >= 0 || name.postContent.indexOf(this.searchMessage) >= 0 })
            this.ready = true      
        },
        async fetchCurrUser() {
            const data = sessionStorage.getItem('username')            
            return this.pullDataFromSourceProp("users","userName", data)
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
            if (postUserName !== currUser.userName){//you can't follow or unfollow yourself
                
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
            }          
        }
    },
    async created(){
        this.users = await this.fetchUsers()
        this.posts = await this.fetchPosts()
        this.currUser = this.fetchCurrUser()
        this.ready = true
    }
}
</script>