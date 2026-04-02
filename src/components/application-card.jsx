import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Boxes, BriefcaseBusiness, Download, School, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { updateApplicationStatus, deleteApplication } from "@/api/apiApplications";
import { BarLoader } from "react-spinners";
import ConfirmationDialog from "./ui/confirmation-dialog";

const ApplicationCard = ({ application, iscandidate = false, onStatusUpdate }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = () => {
    if (application?.resume) {
      const link = document.createElement("a");
      link.href = application.resume;
      link.target = "_blank";
      link.click();
    } else {
      alert("No resume available for this application");
    }
  };

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateApplicationStatus,
    {
      application_id: application.id,
    }
  );

  const { loading: loadingDelete, fn: fnDelete } = useFetch(
    deleteApplication,
    {
      application_id: application.id,
    }
  );

  const handleStatusChange = async (status) => {
    try {
      await fnHiringStatus(status);
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await fnDelete();
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      setShowDeleteConfirm(false);
      alert("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    }
  };

  return (
    <Card>
      {(loadingHiringStatus || loadingDelete) && <BarLoader width={"100%"} color="#36d7b7" />}
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
                size={18}
                className="bg-white text-black rounded-full h-8 w-8 p-1.5 cursor-pointer hover:bg-gray-100"
                onClick={handleDownload}
                title="Download Resume"
              />
            )}
            {!iscandidate && (
              <Trash2
                size={18}
                className="bg-red-500 text-white rounded-full h-8 w-8 p-1.5 cursor-pointer hover:bg-red-600"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Application"
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
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </Card>
  );
};

export default ApplicationCard;
