import supabaseClient, { supabaseUrl } from "@/utils/supabase";

export async function applyToJob(token, _, jobData) {
    const supabase = await supabaseClient(token);

    try {
        const random = Math.floor(Math.random() * 90000);
        const fileName = `resume-${random}-${jobData.candidate_id}`;

        // Upload resume to storage
        const { error: storageError } = await supabase.storage
            .from('resumes')
            .upload(fileName, jobData.resume);

        if (storageError) {
            console.error("Error Uploading Resume", storageError);
            // If storage fails, continue without resume for now
            console.warn("Proceeding without resume upload due to storage error");
        }

        // Create resume URL (only if upload was successful)
        const resume = storageError ? null : `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

        // Insert application
        const { data, error } = await supabase
            .from("applications")
            .insert([{
                job_id: jobData.job_id,
                candidate_id: jobData.candidate_id,
                name: jobData.name,
                status: jobData.status || "applied",
                resume: resume,
            }])
            .select();

        if (error) {
            console.error("Error submitting application: ", error);
            throw new Error("Failed to submit application");
        }

        return data;
    } catch (error) {
        console.error("Error in applyToJob: ", error);
        throw error;
    }
}

export async function updateApplicationStatus(token, { application_id }, status) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", application_id)
    .select();

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error("Failed to update application status");
  }

  if (data.length === 0) {
    throw new Error("No application found to update");
  }

  return data;
}

export async function getApplications(token, { user_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(title, company:companies(name))")
    .eq("candidate_id", user_id);

  if (error) {
    console.error("Error fetching applications", error);
    throw new Error("Failed to fetch applications");
  }

  return data;
}

export async function getApplicationsForJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", job_id);

  if (error) {
    console.error("Error fetching applications for job", error);
    throw new Error("Failed to fetch job applications");
  }

  return data;
}
