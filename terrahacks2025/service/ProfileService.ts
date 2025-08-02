import { supabase } from "@/supabase/client"

export type UserProfile = {
  email: string;
  name: string;
  height_mm: number;
  weight_grams: number;
  age: number;
  bio_setup: boolean;
};

export const ProfileService = {
    async getProfileByEmail(email: string): Promise<UserProfile | null>{

        const {data, error} = await supabase
            .from<UserProfile>('user_profiles')
            .select('email, name, height_mm, weight_grams, age, bio_setup')    //DO NOT TAKE id for safetyish
            .eq('email', email)
            .maybeSingle();
        if (error){
            throw error;
        }
        
        return data;
    },

    async setupProfile(email: string, name: string, height_mm: number, weight_grams: number, age: number) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    name: name,
                    height_mm: height_mm,
                    weight_grams: weight_grams,
                    age: age,
                    bio_setup: true
                })
                .eq('email', email)
                .select()

            if (error) {
                console.error("Error updating Profile:", error);
                throw error;
            }

            //success message
            console.log("Profile updated successfully:", data);
        }
        catch (error) {
            console.error("An error occurred while updating a Profile:", error);
            throw error;
        }

    }
};
