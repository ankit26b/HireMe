import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Boxes, BriefcaseBusiness, Download, School, Trash2, Pen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { updateApplicationStatus, deleteApplication, updateApplication } from "@/api/apiApplications";
import { BarLoader } from "react-spinners";
import ConfirmationDialog from "./ui/confirmation-dialog";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const editSchema = z.object({
  experience: z
    .number()
    .min(0, { message: "Experience must be at least 0" })
    .int(),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    message: "Education is Required",
  }),
  resume: z
    .any()
    .optional()
    .refine(
      (file) =>
        !file ||
        file.length === 0 ||
        file[0].type === "application/pdf" ||
        file[0].type === "application/msword",
      { message: "Only PDF or Word documents are allowed" }
    ),
});

const ApplicationCard = ({ application, iscandidate = false, onStatusUpdate }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      experience: application?.experience ?? 0,
      skills: application?.skills ?? "",
      education: application?.education ?? undefined,
    },
  });

  const handleDownload = () => {
    if (application?.resume) {
      const link = document.createElement("a");
      link.href = application.resume;
      link.target = "_blank";
      link.click();
    }
  };

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateApplicationStatus,
    { application_id: application.id }
  );

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteApplication, {
    application_id: application.id,
  });

  const { loading: loadingUpdate, fn: fnUpdate } = useFetch(updateApplication, {
    application_id: application.id,
  });

  const handleStatusChange = async (status) => {
    try {
      await fnHiringStatus(status);
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await fnDelete();
      setIsDeleted(true);
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await fnUpdate({
        experience: data.experience,
        skills: data.skills,
        education: data.education,
        resume: data.resume && data.resume.length > 0 ? data.resume[0] : null,
      });
      setShowEditDrawer(false);
      reset();
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  if (isDeleted) return null;

  return (
    <>
      <Card>
        {(loadingHiringStatus || loadingDelete || loadingUpdate) && (
          <BarLoader width={"100%"} color="#36d7b7" />
        )}
        <CardHeader>
          <CardTitle className="flex justify-between font-bold items-center">
            <span>
              {iscandidate
                ? `${application?.job?.title} at ${application?.job?.company?.name}`
                : application?.name}
            </span>
            <div className="flex gap-2">
              {application?.resume && (
                <Download
                  size={14}
                  className="bg-white text-black rounded-xl h-8 w-8 p-1.5 cursor-pointer hover:bg-gray-100"
                  onClick={handleDownload}
                  title="Download Resume"
                />
              )}
              <Trash2
                size={14}
                className="bg-red-500 text-white rounded-xl h-8 w-8 p-1.5 cursor-pointer hover:bg-red-600"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Application"
              />
              {iscandidate && (
                <Pen
                  size={14}
                  className="bg-blue-500 text-white rounded-xl h-8 w-8 p-1.5 cursor-pointer hover:bg-blue-600"
                  onClick={() => setShowEditDrawer(true)}
                  title="Edit Application"
                />
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-2 items-center">
              <BriefcaseBusiness size={15} />
              <span>{application?.experience || 0} years of experience</span>
            </div>
            <div className="flex gap-2 items-center">
              <School size={15} />
              <span>{application?.education || "Not specified"}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Boxes size={15} />
              <span>Skills: {application?.skills || "Not specified"}</span>
            </div>
          </div>
          <hr />
        </CardContent>

        <CardFooter className="flex justify-between">
          <span>{new Date(application?.created_at).toLocaleString()}</span>
          {iscandidate ? (
            <span className="capitalize font-bold">
              Status: {application.status}
            </span>
          ) : (
            <Select
              onValueChange={handleStatusChange}
              defaultValue={application.status}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Application Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardFooter>

        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Application"
          message="Are you sure you want to delete this application? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="destructive"
        />
      </Card>

      {/* Edit Application Drawer */}
      <Drawer open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Application</DrawerTitle>
            <DrawerDescription>
              Update your application details below
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="flex flex-col gap-4 p-4 pb-0"
          >
            <Input
              type="number"
              placeholder="Years of Experience"
              className="flex-1"
              {...register("experience", { valueAsNumber: true })}
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
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Intermediate" id="edit-intermediate" />
                    <Label htmlFor="edit-intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Graduate" id="edit-graduate" />
                    <Label htmlFor="edit-graduate">Graduate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Post Graduate" id="edit-post-graduate" />
                    <Label htmlFor="edit-post-graduate">Post Graduate</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.education && (
              <p className="text-red-500">{errors.education.message}</p>
            )}

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-500">
                Replace Resume (optional — leave empty to keep current)
              </Label>
              <Input
                type="file"
                accept=".pdf, .doc, .docx"
                className="flex-1 file:text-gray-500"
                {...register("resume")}
              />
            </div>
            {errors.resume && (
              <p className="text-red-500">{errors.resume.message}</p>
            )}

            {loadingUpdate && <BarLoader width={"100%"} color="#36d7b7" />}

            <Button type="submit" variant="blue" size="lg">
              Save Changes
            </Button>
          </form>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDrawer(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ApplicationCard;
