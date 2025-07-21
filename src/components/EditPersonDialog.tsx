import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
} from "@mui/material";
import type { Person, NewPerson } from "../types";

interface EditPersonDialogProps {
  open: boolean;
  person: Person | null;
  onClose: () => void;
  onUpdate: (person: NewPerson) => Promise<void>;
}

export const EditPersonDialog: React.FC<EditPersonDialogProps> = ({
  open,
  person,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<NewPerson>({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    tags: "",
    notes: "",
    date_met: "",
    location_met: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(false);

  // Populate form data when person changes
  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || "",
        title: person.title || "",
        company: person.company || "",
        email: person.email || "",
        phone: person.phone || "",
        tags: person.tags || "",
        notes: person.notes || "",
        date_met: person.date_met || "",
        location_met: person.location_met || "",
        linkedin: person.linkedin || "",
      });
    }
  }, [person]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = "${value}"`); // Debug log

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    // Debug: Log the complete form data before sending
    console.log("Edit form data being submitted:", formData);

    setLoading(true);
    try {
      // Create a clean copy of the data, converting empty strings to null for optional fields
      const cleanedData: NewPerson = {
        name: formData.name.trim(),
        title: formData.title?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        tags: formData.tags?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        date_met: formData.date_met?.trim() || undefined,
        location_met: formData.location_met?.trim() || undefined,
        linkedin: formData.linkedin?.trim() || undefined,
      };

      console.log("Cleaned edit data being sent to API:", cleanedData);

      await onUpdate(cleanedData);
      onClose();
    } catch (error) {
      console.error("Error updating person:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Contact</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="title"
                label="Title"
                value={formData.title || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="company"
                label="Company"
                value={formData.company || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="linkedin"
                label="LinkedIn URL"
                value={formData.linkedin || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="https://linkedin.com/in/..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="date_met"
                label="Date Met"
                type="date"
                value={formData.date_met || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="location_met"
                label="Location Met"
                value={formData.location_met || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="tags"
                label="Tags"
                value={formData.tags || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., recruiter, mentor, peer"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Updating..." : "Update Contact"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
