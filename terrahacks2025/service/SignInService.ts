import { supabase } from "@/supabase/client"

export const SignInService = {
    async userSignUp( email_entered: string, password_entered: string){
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
        } catch(error){
            console.error("Error occured signing in")
            throw error;
        }
    }
}
