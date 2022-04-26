<template lang="pug">
    .login
        .login-content
            .header
                span Super KPI Login
            .content
                input(v-model='username' type='text' placeholder='Username')
                input(v-modal='password' type='password' placeholder='Password')
            .footer
                button(v-on:click='login()') Login
</template>

<script>
export default {
    data(){
        return {
            username: null,
            password: null,
        }
    },
    methods: {
        login(){
            // alert("anjay");
        }
    },
}
</script>

<style lang="scss" scoped>
    @import "./../assets/styles/global";
    .login{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: url("./../assets/pattern.png");
            .login-content{
                background: #fff;
                padding: 20px;
                // width: 40vw;
                height: 300px;
                box-shadow: 0px 0px 10px 2px #dadade;
                border: 2px solid $secondary;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                .header{
                    border-bottom: 2px solid $secondary;
                    height: 50px;
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    span{
                        font-size: 18px;
                        font-weight: bold;
                        color: $primary;
                    }
                }
                .content{
                    margin-top: 10px;
                    display: flex;
                    flex-direction: column;
                    input{
                        height: 40px;
                        margin: 10px auto;
                        width: 90%;
                        border-radius: 6px;
                        border: 1px solid $primary;
                        padding: 10px;
                        color: $secondary;
                        &::placeholder{
                            color: $secondary;
                            opacity: 0.5;
                        }
                    }
                }
                .footer{
                    width: 90%;
                    display: flex;
                    align-items: center;
                    margin: 0 auto;
                    button{
                        border: 1px solid $secondary;
                        height: 40px;
                        // border: 2px solid #dadade;
                        width: 150px;
                        background: #fff;
                        color: $primary;
                        font-weight: bold;
                        font-size: 14px;
                        box-shadow: 0px 0px 3px 2px #dadade;
                    }
                }
            }
        }
    @media only screen and (min-device-width: 780px) {
        .login-content{
            width: 40vw !important;
        }
    }
    @media (max-width: 767.98px) {
        .login-content{
            width: 80vw !important;
        }
        button{
            margin-top: 20px;
            width: 100% !important;
        }
    }
</style>