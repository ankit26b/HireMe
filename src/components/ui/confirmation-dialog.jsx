import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "destructive"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationDialog;