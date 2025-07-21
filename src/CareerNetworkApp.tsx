import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Fab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Upload as UploadIcon,
  FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import type { Person, NewPerson } from "./types";
import { jsonExample } from "./types";
import { apiService } from "./api/api";
import { PeopleTable } from "./components/PeopleTable";
import { AddPersonDialog } from "./components/AddPersonDialog";

interface BulkImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

export const CareerNetworkApp: React.FC = () => {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk import state
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] =
    useState<BulkImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  // Available search fields
  const searchFields = useMemo(
    () => [
      { value: "all", label: "All Fields" },
      { value: "name", label: "Name" },
      { value: "email", label: "Email" },
      { value: "company", label: "Company" },
      { value: "title", label: "Title" },
      { value: "location_met", label: "Location Met" },
      { value: "notes", label: "Notes" },
    ],
    []
  );

  // Frontend filtering function
  const filterPeople = useCallback(
    (people: Person[], query: string, field: string): Person[] => {
      if (!query.trim()) return people;

      const searchTerm = query.toLowerCase().trim();

      return people.filter((person) => {
        if (field === "all") {
          // Search across all fields
          return (
            person.name?.toLowerCase().includes(searchTerm) ||
            person.email?.toLowerCase().includes(searchTerm) ||
            person.company?.toLowerCase().includes(searchTerm) ||
            person.title?.toLowerCase().includes(searchTerm) ||
            person.location_met?.toLowerCase().includes(searchTerm) ||
            person.notes?.toLowerCase().includes(searchTerm)
          );
        } else {
          // Search in specific field
          const fieldValue = person[field as keyof Person];
          return (
            fieldValue?.toString().toLowerCase().includes(searchTerm) || false
          );
        }
      });
    },
    []
  );

  // Memoized filtered people - this is the key optimization
  const filteredPeople = useMemo(() => {
    const filtered = filterPeople(allPeople, searchQuery, searchField);
    // Sort ascending by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [allPeople, searchQuery, searchField, filterPeople]);

  // Fetch all people from API (only called once on mount and after CRUD operations)
  const fetchAllPeople = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiService.getPeople(); // Fetch all people without search params
      setAllPeople(data);
    } catch (error) {
      console.error("Error fetching people:", error);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search query change - no API calls, just state updates
  const handleSearchQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
    },
    []
  );

  // Handle search field change
  const handleSearchFieldChange = useCallback((event: any) => {
    const field = event.target.value;
    setSearchField(field);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchField("all");
  }, []);

  // Add new person
  const handleAddPerson = useCallback(
    async (personData: NewPerson) => {
      try {
        await apiService.createPerson(personData);
        // Refetch all data to ensure consistency
        await fetchAllPeople();
        setError(null);
      } catch (error) {
        console.error("Error adding person:", error);
        setError("Failed to add contact. Please try again.");
        throw error;
      }
    },
    [fetchAllPeople]
  );

  // Update person
  const handleUpdatePerson = useCallback(
    async (id: number, personData: NewPerson) => {
      try {
        await apiService.updatePerson(id, personData);
        // Refetch all data to ensure consistency
        await fetchAllPeople();
        setError(null);
      } catch (error) {
        console.error("Error updating person:", error);
        setError("Failed to update contact. Please try again.");
        throw error;
      }
    },
    [fetchAllPeople]
  );

  // Delete person
  const handleDeletePerson = useCallback(async (id: number) => {
    try {
      await apiService.deletePerson(id);
      // Remove from local state
      setAllPeople((prevPeople) =>
        prevPeople.filter((person) => person.id !== id)
      );
      setError(null);
    } catch (error) {
      console.error("Error deleting person:", error);
      setError("Failed to delete contact. Please try again.");
    }
  }, []);

  // Handle file selection for bulk import
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "application/json") {
        setSelectedFile(file);
        setBulkImportResult(null);
      } else {
        setError("Please select a valid JSON file.");
        setSelectedFile(null);
      }
    },
    []
  );

  // Validate person data structure
  const validatePersonData = useCallback((person: any): person is NewPerson => {
    return (
      typeof person === "object" &&
      person !== null &&
      typeof person.name === "string" &&
      person.name.trim().length > 0 &&
      (person.email === undefined ||
        person.email === null ||
        typeof person.email === "string") &&
      (person.company === undefined ||
        person.company === null ||
        typeof person.company === "string") &&
      (person.title === undefined ||
        person.title === null ||
        typeof person.title === "string") &&
      (person.location_met === undefined ||
        person.location_met === null ||
        typeof person.location_met === "string") &&
      (person.notes === undefined ||
        person.notes === null ||
        typeof person.notes === "string")
    );
  }, []);

  // Handle bulk import
  const handleBulkImport = useCallback(async () => {
    if (!selectedFile) return;

    setBulkImporting(true);
    setBulkImportResult(null);

    try {
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      // Ensure it's an array
      const peopleArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      const result: BulkImportResult = {
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Process each person
      for (let i = 0; i < peopleArray.length; i++) {
        try {
          const personData = peopleArray[i];

          if (!validatePersonData(personData)) {
            result.failed++;
            result.errors.push(
              `Record ${
                i + 1
              }: Invalid data structure. Required field 'name' missing or invalid.`
            );
            continue;
          }

          // Clean up the data
          const cleanPersonData: NewPerson = {
            name: personData.name.trim(),
            email: personData.email?.trim() || undefined,
            company: personData.company?.trim() || undefined,
            title: personData.title?.trim() || undefined,
            location_met: personData.location_met?.trim() || undefined,
            notes: personData.notes?.trim() || undefined,
          };

          await apiService.createPerson(cleanPersonData);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Record ${i + 1}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      setBulkImportResult(result);

      // Refresh the people list if any were successful
      if (result.successful > 0) {
        await fetchAllPeople();
      }
    } catch (error) {
      console.error("Error during bulk import:", error);
      setError("Failed to process JSON file. Please check the file format.");
    } finally {
      setBulkImporting(false);
    }
  }, [selectedFile, validatePersonData, fetchAllPeople]);

  // Close bulk import dialog
  const closeBulkImportDialog = useCallback(() => {
    setShowBulkImportDialog(false);
    setSelectedFile(null);
    setBulkImportResult(null);
  }, []);

  // Memoized search results info
  const searchResultsInfo = useMemo(() => {
    if (!searchQuery) return null;

    const fieldLabel = searchFields.find((f) => f.value === searchField)?.label;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Found {filteredPeople.length} result
          {filteredPeople.length !== 1 ? "s" : ""} for "{searchQuery}" in{" "}
          {fieldLabel}
        </Typography>
      </Box>
    );
  }, [searchQuery, filteredPeople.length, searchField, searchFields]);

  // Memoized footer stats
  const footerStats = useMemo(
    () => (
      <Typography variant="body2" color="text.secondary">
        {searchQuery
          ? `Showing ${filteredPeople.length} of ${allPeople.length} contacts`
          : `${allPeople.length} ${
              allPeople.length === 1 ? "contact" : "contacts"
            } in your network`}
      </Typography>
    ),
    [searchQuery, filteredPeople.length, allPeople.length]
  );

  useEffect(() => {
    fetchAllPeople();
  }, [fetchAllPeople]);

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
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            py: 2,
            borderRadius: 0,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/database.png"
              alt="VirtuDex Logo"
              style={{ width: 40, height: 40, marginRight: 12 }}
            />
            <Box>
              <Typography
                variant="h6"
                component="h1"
                sx={{ fontWeight: "bold", color: "inherit" }}
              >
                VirtuDex
              </Typography>
              <Typography variant="caption" sx={{ color: "inherit" }}>
                Manage your professional connections
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setShowBulkImportDialog(true)}
            sx={{
              color: "black",
              backgroundColor: "white",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            Bulk Import JSON
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Box sx={{ px: 4 }}>
          {/* Search Bar */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom>
              Search & Filter Contacts
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={handleClearSearch}
                          startIcon={<ClearIcon />}
                        >
                          Clear
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Search Field</InputLabel>
                  <Select
                    value={searchField}
                    label="Search Field"
                    onChange={handleSearchFieldChange}
                  >
                    {searchFields.map((field) => (
                      <MenuItem key={field.value} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                {/* No loading spinner needed for instant frontend search */}
              </Grid>
            </Grid>

            {/* Search Results Info */}
            {searchResultsInfo}
          </Paper>

          {/* Add Button */}
          <Box
            sx={{ mb: 2, flexShrink: 0 }}
            alignContent={"center"}
            textAlign="center"
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
              size="large"
            >
              Add New Contact
            </Button>
          </Box>

          {/* Scrollable Table Container */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              elevation={1}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  "& .MuiTableContainer-root": {
                    maxHeight: "50vh",
                    height: "50vh",
                  },
                }}
              >
                <PeopleTable
                  people={filteredPeople}
                  onDelete={handleDeletePerson}
                  onUpdate={handleUpdatePerson}
                  loading={false}
                />
              </Box>
            </Paper>
          </Box>

          {/* Footer Stats */}
          <Box sx={{ mt: 2, textAlign: "center", flexShrink: 0 }}>
            {footerStats}
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

          {/* Bulk Import Dialog */}
          <Dialog
            open={showBulkImportDialog}
            onClose={closeBulkImportDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <FileUploadIcon sx={{ mr: 1 }} />
                Bulk Import Contacts from JSON
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Upload a JSON file containing an array of contact objects.
                  Each contact should have at minimum a "name" field.
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Expected JSON format:</strong>
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: "grey.100",
                    p: 2,
                    borderRadius: 1,
                    fontSize: "0.8rem",
                    overflow: "auto",
                  }}
                >
                  {jsonExample}
                </Box>

                <Box sx={{ mt: 3 }}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    id="bulk-import-file"
                  />
                  <label htmlFor="bulk-import-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<FileUploadIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Choose JSON File
                    </Button>
                  </label>

                  {selectedFile && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>

                {bulkImporting && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Importing contacts...
                    </Typography>
                  </Box>
                )}

                {bulkImportResult && (
                  <Box sx={{ mt: 2 }}>
                    <Alert
                      severity={
                        bulkImportResult.failed === 0 ? "success" : "warning"
                      }
                      sx={{ mb: 2 }}
                    >
                      Import completed: {bulkImportResult.successful}{" "}
                      successful, {bulkImportResult.failed} failed
                    </Alert>

                    {bulkImportResult.errors.length > 0 && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Errors:</strong>
                        </Typography>
                        <Box
                          sx={{
                            maxHeight: 150,
                            overflow: "auto",
                            backgroundColor: "grey.50",
                            p: 1,
                            borderRadius: 1,
                            fontSize: "0.8rem",
                          }}
                        >
                          {bulkImportResult.errors.map((error, index) => (
                            <Typography
                              key={index}
                              variant="caption"
                              display="block"
                            >
                              {error}
                            </Typography>
                          ))}
                        </Box>
                        )
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeBulkImportDialog}>Close</Button>
              <Button
                onClick={handleBulkImport}
                variant="contained"
                disabled={!selectedFile || bulkImporting}
                startIcon={<UploadIcon />}
              >
                {bulkImporting ? "Importing..." : "Import"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};
