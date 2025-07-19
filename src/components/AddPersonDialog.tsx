import React, { useState } from "react";
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
import type { NewPerson } from "../types";

interface AddPersonDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (person: NewPerson) => Promise<void>;
}

const initialFormData: NewPerson = {
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
};

export const AddPersonDialog: React.FC<AddPersonDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState<NewPerson>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error("Error adding person:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Contact</DialogTitle>
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
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="company"
                label="Company"
                value={formData.company}
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
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="linkedin"
                label="LinkedIn URL"
                value={formData.linkedin}
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
                value={formData.date_met}
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
                value={formData.location_met}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="tags"
                label="Tags"
                value={formData.tags}
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
                value={formData.notes}
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
          {loading ? "Adding..." : "Add Contact"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
