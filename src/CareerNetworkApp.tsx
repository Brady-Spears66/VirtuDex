import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Fab,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import type { Person, NewPerson } from "./types";
import { apiService } from "./api/api";
import { PeopleTable } from "./components/PeopleTable";
import { AddPersonDialog } from "./components/AddPersonDialog";

export const CareerNetworkApp: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch people from API
  const fetchPeople = async () => {
    try {
      setError(null);
      const data = await apiService.getPeople();
      setPeople(data);
    } catch (error) {
      console.error("Error fetching people:", error);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new person
  const handleAddPerson = async (personData: NewPerson) => {
    try {
      await apiService.createPerson(personData);
      await fetchPeople(); // Refresh the list
      setError(null);
    } catch (error) {
      console.error("Error adding person:", error);
      setError("Failed to add contact. Please try again.");
      throw error; // Re-throw to let the dialog handle it
    }
  };

  // Delete person
  const handleDeletePerson = async (id: number) => {
    try {
      await apiService.deletePerson(id);
      setPeople(people.filter((person) => person.id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting person:", error);
      setError("Failed to delete contact. Please try again.");
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your contacts...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ width: "100%", height: "100%", py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }} alignItems={"center"} textAlign="center">
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Brady Spears Career Network
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your professional connections
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Add Button */}
      <Box sx={{ mb: 3 }} alignContent={"center"} textAlign="center">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          size="large"
        >
          Add New Contact
        </Button>
      </Box>

      {/* People Table */}
      <PeopleTable
        people={people}
        onDelete={handleDeletePerson}
        loading={loading}
      />

      {/* Footer Stats */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {people.length} {people.length === 1 ? "contact" : "contacts"} in your
          network
        </Typography>
      </Box>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add contact"
        onClick={() => setShowAddDialog(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: { xs: "flex", sm: "none" }, // Only show on mobile
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Person Dialog */}
      <AddPersonDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddPerson}
      />
    </Container>
  );
};
