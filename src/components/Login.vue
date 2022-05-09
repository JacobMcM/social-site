<template>
  <div>
    <h4>Login Form</h4>
    <form>
      <div class="mb-3">
        <label for="txtUserName" class="form-label">Username</label>
        <input
          type="text"
          class="form-control"
          id="txtUserName"
          aria-describedby="usernameHelp"
          v-model="username"
        />
      </div>
      <div class="mb-3">
        <label for="txtPassword" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="txtPassword"
          v-model="password"
        />
      </div>
      <button type="button" class="btn btn-primary" @click="login()">
        Submit
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async fetchUsers() {
      const res = await fetch('api/users')
      const data = await res.json()
      return data
    },
    async login() {

      const users = await this.fetchUsers();


      let wrongPassword = false

      users.forEach(user => {
        if (user.userName === this.username && user.password === this.password){
          sessionStorage.setItem("username", this.username);
          this.$router.push('/home');
        }else if(user.userName === this.username && user.password !== this.password){
          confirm('The Password You have entered is incorrect. Please try again')
          wrongPassword = true;
        }
      })

      if (!wrongPassword ){
        if ( !sessionStorage.getItem('username') || sessionStorage.getItem('username') === ""){
          if (confirm('This user does not exist. Would you like to create a new Account?')) {
            const newUser = {
              userName: this.username,
              password: this.password,
              avatar: "",
              followedByAccounts: [],
              followingAccounts: []
            }

            this.addUser(newUser)

            sessionStorage.setItem("username", this.username);

            this.$router.push('/home')           
          }
        }
      }
      this.username = "";
      this.password = "";
    },
      async addUser(user) {
        const res = await fetch('api/users', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(user),
        })
        /*const data = await res.json()
        this.contacts = [...this.contacts, data]*/
      }    
    },
    async created(){
        this.users = await this.fetchUsers()
    }
};
</script>