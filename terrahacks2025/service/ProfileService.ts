import { supabase } from "@/supabase/client"

export type UserProfile = {
  email: string;
  name: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  fitness_level: string;
  bio_setup: boolean;
  level: number;
  experience_points: number;
};

export type MedicalCondition = {
  id: number;
  email: string;
  is_physio: boolean;
  location_on_body: string;
  description: string;
  pain_level: number; // 1-10
  created_at?: string | null;
};

export const ProfileService = {
    async getProfileByEmail(email: string): Promise<UserProfile | null>{

        const {data, error} = await supabase
            .from('user_profiles')
            .select('email, name, height_cm, weight_kg, age, gender, fitness_level, bio_setup, level, experience_points')    //DO NOT TAKE id for safetyish
            .eq('email', email)
            .maybeSingle();
        if (error){
            throw error;
        }
        
        return data;
    },

    async setupProfile(email: string, name: string, height_cm: number, weight_kg: number, age: number, gender: string, fitness_level: string ) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    name: name,
                    height_cm: height_cm,
                    weight_kg: weight_kg,
                    age: age,
                    gender: gender,
                    fitness_level: fitness_level,
                    bio_setup: true,
                    level: 1,
                    experience_points: 0
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

    async updateProfileFields(email: string, height_cm: number, weight_kg: number, age: number) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    height_cm: height_cm, // Convert meters to cm for database
                    weight_kg: weight_kg,
                    age: age
                })
                .eq('email', email)
                .select()

            if (error) {
                console.error("Error updating Profile fields:", error);
                throw error;
            }

            console.log("Profile fields updated successfully:", data);
            return data;
        }
        catch (error) {
            console.error("An error occurred while updating Profile fields:", error);
            throw error;
        }
    },

    async addMedicalCondition(email: string, is_physio: boolean,location_on_body: string,description: string, pain_level: number){
        try {
            const { data, error } = await supabase
                .from('medical_conditions')
                .insert([
                    {
                        email: email,
                        is_physio: is_physio,
                        location_on_body: location_on_body,
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
    },

    async getMedicalConditionsByEmail(email: string) {
    const { data, error } = await supabase
        .from('medical_conditions')
        .select('id, email, is_physio, location_on_body, description, pain_level')
        .eq('email', email)
        .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
    },

    async updateMedicalCondition(
    id: number,
    email: string,
    fields: Partial<Pick<MedicalCondition, 'is_physio' | 'location_on_body' | 'description' | 'pain_level'>>
    ) {
    const { data, error } = await supabase
        .from('medical_conditions')
        .update(fields)
        .eq('id', id)
        .eq('email', email)
        .select('id, email, is_physio, location_on_body, description, pain_level')
        .single();

    if (error) throw error;
    return data!;
    },

    async deleteMedicalCondition(id: number, email: string) {
    const { error } = await supabase
        .from('medical_conditions')
        .delete()
        .eq('id', id)
        .eq('email', email);

    if (error) throw error;
    },

    // Level System Functions
    calculateLevelFromXP(xp: number): number {
        // Level formula: each level requires more XP
        // Level 1: 0-100 XP, Level 2: 101-250 XP, Level 3: 251-450 XP, etc.
        // Formula: XP needed for level n = 100 * n * (n + 1) / 2
        let level = 1;
        let xpNeeded = 0;
        
        while (xp >= xpNeeded) {
            level++;
            xpNeeded = 100 * level * (level + 1) / 2;
        }
        
        return Math.max(1, level - 1);
    },

    calculateXPForNextLevel(currentLevel: number): number {
        // XP needed to reach the next level
        const nextLevel = currentLevel + 1;
        return 100 * nextLevel * (nextLevel + 1) / 2;
    },

    calculateXPForCurrentLevel(currentLevel: number): number {
        // XP needed to reach current level
        if (currentLevel <= 1) return 0;
        return 100 * currentLevel * (currentLevel + 1) / 2;
    },

    async awardExperiencePoints(email: string, xpToAdd: number): Promise<{ newLevel: number; newXP: number; leveledUp: boolean }> {
        try {
            // Get current profile
            const profile = await this.getProfileByEmail(email);
            if (!profile) throw new Error('Profile not found');

            const currentXP = profile.experience_points || 0;
            const currentLevel = profile.level || 1;
            const newXP = currentXP + xpToAdd;
            const newLevel = this.calculateLevelFromXP(newXP);
            const leveledUp = newLevel > currentLevel;

            // Update the profile with new XP and level
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    experience_points: newXP,
                    level: newLevel
                })
                .eq('email', email)
                .select()
                .single();

            if (error) throw error;

            return {
                newLevel,
                newXP,
                leveledUp
            };
        } catch (error) {
            console.error('Error awarding XP:', error);
            throw error;
        }
    }

};
