import { supabase } from "@/supabase/client"

export const SignInService = {
    async userSignIn(email_entered: string, password_entered: string){
        try{
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email_entered,
                password: password_entered
            })

            if (error){
                console.error("Error logging in")
                throw error;
            }
            console.log("Logged in: ", data)
        } catch(error) {
            console.error("Error occured signing in")
            throw error;
        }
    },
    async signInWithGoogle(){
        try{
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })

            if (error){
                console.error("Error signing in with Google")
                throw error;
            }
            console.log("Google sign in initiated: ", data)
        } catch(error) {
            console.error("Error occured signing in with Google")
            throw error;
        }
    },
    async userSignUp(email_entered: string, password_entered:string){

        try{
            const { data, error } = await supabase.auth.signUp({
                email: email_entered,
                password: password_entered
            })

            if (error){
                console.error("Error signing up")
                throw error;
            }
            console.log("User created!: ", data)
        } catch(error){
            console.error("Error occured creating an auth user")
            throw error;
        }
    }
}