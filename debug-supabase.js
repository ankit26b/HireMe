// Test file to debug Supabase connectivity and permissions
// You can run this in the browser console to test

import supabaseClient from "@/utils/supabase";

export async function testSupabaseConnection() {
    try {
        console.log("Testing Supabase connection...");
        
        // Get token from Clerk
        const token = await window.Clerk?.session?.getToken({ template: "supabase" });
        console.log("Token obtained:", token ? "Token exists" : "No token");
        
        const supabase = await supabaseClient(token);
        
        // Test 1: Check if we can connect to Supabase
        console.log("Testing basic connection...");
        const { data: connectionTest, error: connectionError } = await supabase
            .from('jobs')
            .select('id')
            .limit(1);
        
        if (connectionError) {
            console.error("Connection test failed:", connectionError);
        } else {
            console.log("✓ Connection successful");
        }
        
        // Test 2: Check if applications table exists
        console.log("Testing applications table...");
        const { data: appsTest, error: appsError } = await supabase
            .from('applications')
            .select('id')
            .limit(1);
            
        if (appsError) {
            console.error("Applications table error:", appsError);
            console.log("❌ Applications table might not exist or have permission issues");
        } else {
            console.log("✓ Applications table accessible");
        }
        
        // Test 3: Check storage bucket
        console.log("Testing storage bucket...");
        const { data: buckets, error: bucketError } = await supabase
            .storage
            .listBuckets();
            
        if (bucketError) {
            console.error("Storage bucket error:", bucketError);
        } else {
            console.log("✓ Storage accessible, buckets:", buckets.map(b => b.name));
        }
        
        return {
            connection: !connectionError,
            applications: !appsError,
            storage: !bucketError
        };
        
    } catch (error) {
        console.error("Test failed:", error);
        return false;
    }
}

// Call this function in the browser console:
// import { testSupabaseConnection } from './debug-supabase.js'; testSupabaseConnection();