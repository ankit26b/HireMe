import supabaseClient from "@/utils/supabase";

export async function getJobs(token, {location, company_id, searchQuery, user_id}){
    console.log("getJobs called with:", {token: token ? "Token exists" : "No token", location, company_id, searchQuery, user_id});
    
    const supabase = await supabaseClient(token);

    // First, get all jobs with basic filters
    let query = supabase
        .from("jobs")
        .select(`
            *, 
            company:companies(name,logo_url)
        `);

    if(location){
        query = query.eq("location", location);
    }
    if(company_id){
        query = query.eq("company_id", company_id);
    }
    if(searchQuery){
        query = query.ilike("title", `%${searchQuery}%`);
    }

    console.log("Executing Supabase query...");
    const {data: jobs, error} = await query;

    if(error){
        console.error("Error fetching jobs", error);
        return null;
    }

    // If user_id is provided, get saved jobs for this user
    if(user_id && jobs && jobs.length > 0) {
        const { data: savedJobs, error: savedError } = await supabase
            .from("saved_jobs")
            .select("job_id")
            .eq("user_id", user_id);
        
        if(!savedError && savedJobs) {
            // Use String() to ensure type-safe comparison
            const savedJobIds = new Set(savedJobs.map(saved => String(saved.job_id)));
            
            // Add saved status to each job
            jobs.forEach(job => {
                job.saved = savedJobIds.has(String(job.id)) ? [{id: 'saved'}] : [];
            });
        } else {
            jobs.forEach(job => { job.saved = []; });
        }
    } else if(jobs) {
        // If no user_id, set all jobs as not saved
        jobs.forEach(job => {
            job.saved = [];
        });
    }

    console.log("Query result:", {data: jobs ? `${jobs.length} jobs found` : "No data", error});

    return jobs;
}

// useFetch calls: cb(token, options, ...args)
// So saveJob receives: (token, {}, {alreadySaved, user_id, job_id})
export async function saveJob(token, _, jobData){
    const { alreadySaved, user_id, job_id } = jobData;
    console.log("saveJob API called with:", { alreadySaved, user_id, job_id });
    const supabase = await supabaseClient(token);

    if(alreadySaved){
        console.log("Attempting to unsave job...");
        const {data, error:deleteError} = await supabase
            .from("saved_jobs")
            .delete()
            .eq("job_id", job_id)
            .eq("user_id", user_id);

        if(deleteError){
            console.error("Error removing saved jobs", deleteError);
            throw new Error("Failed to unsave job");
        }
        console.log("Job unsaved successfully:", data);
        return data;
    }else{
        console.log("Attempting to save job...");
        const {data, error: insertError} = await supabase
            .from("saved_jobs")
            .insert([{ user_id, job_id }])
            .select();

        if(insertError){
            console.error("Error inserting save jobs", insertError);
            throw new Error("Failed to save job");
        }
        
        console.log("Job saved successfully:", data);
        return data;
    }
}

export async function getSingleJob(token, {job_id}){
    const supabase = await supabaseClient(token);

    let query = supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

    const { data, error } = await query;

    if(error){
        console.error("Error fetching job:", error);
        return null;
    }

    return data; 
}

export async function updateHiringStatus(token, {job_id}, isOpen){
    const supabase = await supabaseClient(token);

    const{data, error} = await supabase.from("jobs").update({isOpen}).eq("id",job_id).select();

    if(error){
        console.log("Error updating job", error);
        return null;
    }

    return data; 
}

export async function addNewJob(token, _, jobData){
    const supabase = await supabaseClient(token);

    const{data, error} = await supabase.from("jobs").insert([jobData]).select();

    if(error){
        console.log("Error Creating job", error);
        return null;
    }

    return data; 
}

export async function getSavedJobs(token, { user_id }){
    const supabase = await supabaseClient(token);

    const{data, error} = await supabase
        .from("saved_jobs")
        .select("*, job:jobs(*, company:companies(name,logo_url))")
        .eq("user_id", user_id);

    if(error){
        console.error("Error fetching saved job", error);
        throw new Error("Failed to fetch saved jobs");
    }

    return data; 
}

export async function getMyJobs(token, { recruiter_id }){
    const supabase = await supabaseClient(token);

    const{data, error} = await supabase.from("jobs").select("*, company:companies(name,logo_url)").eq("recruiter_id", recruiter_id);

    if(error){
        console.log("Error fetching jobs", error);
        return null;
    }

    return data; 
}

export async function deleteJob(token, {job_id}){
    const supabase = await supabaseClient(token);

    const{data, error: deleteError } = await supabase.from("jobs").delete().eq("id", job_id).select();

    if(deleteError){
        console.log("Error deleting jobs", deleteError);
        return data;
    }

    return data; 
}