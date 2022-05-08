<template>
    <div :key="this.filteredPosts.length">
        <div v-for="post in this.filteredPosts" :key="post.id">
            <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" @likePost="likePost(post)" @addComment="addComment(post)" :postTitle="post.postTitle" :userName="post.userName" :postContent="post.postContent" :numLikes="post.numLikes" :numComments="post.numComments"/>
        </div>
    </div>
</template>

<script>
import Posts from '@/components/Posts'

export default {
    name: 'Home',
    data() {
        return {
            users: [],
            posts: [],

            filteredPosts: [],
        }
    },
    components: {
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
        async fetchCurrUser() {
            const data = sessionStorage.getItem('username')            
            return this.pullDataFromSourceProp("users","userName", data)
        },
        async filterPosts() {

            let filteredPosts = []
            const currUser = await this.fetchCurrUser()
            console.log(currUser)

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

            console.log("filtereing done")
            console.log(filteredPosts)
            return filteredPosts
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
        async pullDataFromSourceProp(source, prop, searchTerm){
            console.log(source + " and " + prop + " and " + searchTerm)

            let data = await (await fetch(`http://localhost:5000/${source}?${prop}=${searchTerm}`)).json()
            if (source === "users"){
                data = data.at(0)
            }
            return data
        },
        toAccount(post){
            const id = post.userId
            this.$router.push(`/profile/${id}`)
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
            this.filteredPosts = await this.filterPosts()
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
                    
                }


                this.filteredPosts = await this.filterPosts()
            }
        },
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts(),

        this.filteredPosts = await this.filterPosts()
        
        
    }
}
</script>
