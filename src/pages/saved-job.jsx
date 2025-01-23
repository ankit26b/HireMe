import { getSavedJobs } from "@/api/apiJobs";
import JobCard from "@/components/job-card";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

const SavedJobs = () => {
  const { isLoaded } = useUser();

  const {
    loading: loadingSavedJobs,
    data: savedJobs,error,
    fn: fnSavedJobs,
  } = useFetch(getSavedJobs);

  useEffect(() => {
    if (isLoaded && !savedJobs) {
      fnSavedJobs();
    }
  }, [isLoaded, savedJobs]);

  const deduplicatedJobs = savedJobs
    ? savedJobs.filter(
        (job, index, self) =>
          index === self.findIndex((t) => t.job.id === job.job.id)
      )
    : [];

  if (!isLoaded || loadingSavedJobs) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }
  if (error) {
    return <div>Error loading saved jobs. Please try again later.</div>;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
        Saved Jobs
      </h1>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deduplicatedJobs.length ? (
          deduplicatedJobs.map((saved) => (
            <JobCard
              key={saved.id}
              job={saved?.job}
              onJobAction={fnSavedJobs}
              savedInit={true}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 italic">No Saved Jobs 👀</div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;