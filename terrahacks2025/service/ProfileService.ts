import { supabase } from "@/supabase/client"

export type UserProfile = {
  email: string;
  name: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  bio_setup: boolean;
};

export const ProfileService = {
    async getProfileByEmail(email: string): Promise<UserProfile | null>{

        const {data, error} = await supabase
            .from<UserProfile>('user_profiles')
            .select('email, name, height_cm, weight_kg, age, bio_setup')    //DO NOT TAKE id for safetyish
            .eq('email', email)
            .maybeSingle();
        if (error){
            throw error;
        }
        
        return data;
    },

    async setupProfile(email: string, name: string, height_mm: number, weight_grams: number, age: number, gender: string, fitness_level: string ) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    name: name,
                    height_mm: height_mm,
                    weight_grams: weight_grams,
                    age: age,
                    gender: gender,
                    fitness_level: fitness_level,
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

    },

    async addMedicalCondition(email: string, is_physical: boolean,if_physical_where: string,description: string, pain_level: number){
        try {
            const { data, error } = await supabase
                .from('medical_conditions')
                .insert([
                    {
                        email: email,
                        is_physical: is_physical,
                        if_physical_where: if_physical_where,
                        description:description,
                        pain_level: pain_level
                    }
                ])
                .select();
                if (error) {
                    console.error("Error adding Condition:", error);
                    throw error;
                }
                //else show added customer in console
                console.log("Condition added successfully:", data);
                //return data; //return customer data for use
        } catch (error) {
            console.error("An error occurred while adding a Condition:", error);
            throw error;
        }
    }
};
