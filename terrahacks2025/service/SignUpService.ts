import { supabase } from "@/supabase/client"

export const SignUpService = {
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
