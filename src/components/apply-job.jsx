import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyToJob, deleteApplication } from "@/api/apiApplications";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import ConfirmationDialog from "./ui/confirmation-dialog";

const schema = z.object({
  experience: z
    .number()
    .min(0, { message: "Experience must me atleast 0" })
    .int(),

  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    message: "Education is Required",
  }),
  resume: z
    .any()
    .refine(
      (file) =>
        file[0] &&
        (file[0].type === "application/pdf" ||
          file[0].type === "application/msword"),
      { message: "Only PDF or Word documents are allowed" }
    ),
});

export function ApplyJobDrawer  ({ user, job, applied = false, fetchJob }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    fn: fnApply,
    error: errorApply,
    loading: loadingApply,
  } = useFetch(applyToJob);

  const { loading: loadingCancel, fn: fnCancel } = useFetch(deleteApplication, {
    application_id: applied?.id,
  });

  const onSubmit = async (data) => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      console.log("Applying to job with data:", {
        job_id: job.id,
        candidate_id: user.id,
        name: user.fullName,
        status: "applied",
        resume: data.resume[0] ? "File selected" : "No file"
      });

      await fnApply({
        job_id: job.id,
        candidate_id: user.id,
        name: user.fullName,
        status: "applied",
        resume: data.resume[0] || null,
        experience: data.experience,
        skills: data.skills,
        education: data.education,
      });
      
      console.log("Application submitted successfully");
      
      // Refresh the job data to show updated application status
      if (fetchJob) {
        await fetchJob();
      }
      
      reset();
      setIsOpen(false);
      setTimeout(() => setShowSuccessMessage(true), 300);
    } catch (error) {
      console.error("Error applying to job:", error);
    }
  };

  const handleCancelApplication = async () => {
    try {
      await fnCancel();
      setShowCancelConfirm(false);
      if (fetchJob) await fetchJob();
    } catch (error) {
      console.error("Error cancelling application:", error);
      setShowCancelConfirm(false);
    }
  };

  return (
    <>
    {loadingCancel && <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />}
    <Drawer open={isOpen && !applied} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className="flex gap-3 items-center">
          <Button
            size="lg"
            className="flex-1"
            variant={job?.isOpen && !applied ? "blue" : "destructive"}
            disabled={!job?.isOpen || applied}
            onClick={() => !applied && setIsOpen(true)}
          >
            {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
          </Button>
          {applied && job?.isOpen && (
            <Button
              size="lg"
              className="flex-1"
              variant="outline"
              onClick={(e) => { e.preventDefault(); setShowCancelConfirm(true); }}
            >
              Cancel Application
            </Button>
          )}
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Apply for {job?.title} at {job?.company?.name}
          </DrawerTitle>
          <DrawerDescription>Please fill the form below</DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-4 pb-0"
        >
          <Input
            type="number"
            placeholder="Years of Experience"
            className="flex-1"
            {...register("experience", {
              valueAsNumber: true,
            })}
          />

          {errors.experience && (
            <p className="text-red-500">{errors.experience.message}</p>
          )}

          <Input
            type="text"
            placeholder="Skills (Comma Separated)"
            className="flex-1"
            {...register("skills")}
          />

          {errors.skills && (
            <p className="text-red-500">{errors.skills.message}</p>
          )}

          <Controller
            name="education"
            control={control}
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} {...field}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Graduate" id="graduate" />
                  <Label htmlFor="graduate">Graduate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Post Graduate" id="post-graduate" />
                  <Label htmlFor="post-graduate">Post Graduate</Label>
                </div>
              </RadioGroup>
            )}
          />

          {errors.education && (
            <p className="text-red-500">{errors.education.message}</p>
          )}

          <Input
            type="file"
            accept=".pdf, .doc, .docx"
            className="flex-1 file:text-gray-500"
            {...register("resume")}
          />
          {errors.resume && (
            <p className="text-red-500">{errors.resume.message}</p>
          )}
          {errorApply?.message && (
            <p className="text-red-500">{errorApply?.message}</p>
          )}
          {loadingApply && <BarLoader width={"100%"} color="#36d7b7" />}

          <Button type="submit" variant="blue" size="lg">
            Apply
          </Button>
        </form>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <ConfirmationDialog
      isOpen={showSuccessMessage}
      onClose={() => setShowSuccessMessage(false)}
      onConfirm={() => setShowSuccessMessage(false)}
      title="Application Submitted"
      message="Your application has been submitted successfully."
      confirmText="OK"
    />

    <ConfirmationDialog
      isOpen={showCancelConfirm}
      onClose={() => setShowCancelConfirm(false)}
      onConfirm={handleCancelApplication}
      title="Cancel Application"
      message="Are you sure you want to withdraw your application? This action cannot be undone."
      confirmText="Yes, Withdraw"
      cancelText="Keep Application"
      confirmVariant="destructive"
    />
    </>
  );
};

