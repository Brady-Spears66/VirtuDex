import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Box,
  Link,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import type { Person } from "../types";

interface PeopleTableProps {
  people: Person[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export const PeopleTable: React.FC<PeopleTableProps> = ({
  people,
  onDelete,
  loading = false,
}) => {
  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      onDelete(id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (people.length === 0 && !loading) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No contacts yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first professional contact to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contact</TableCell>
            <TableCell>Company & Title</TableCell>
            <TableCell>Contact Info</TableCell>
            <TableCell>Details</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {getInitials(person.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {person.name}
                    </Typography>
                    {person.tags && (
                      <Chip
                        label={person.tags}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {person.company || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {person.title || "-"}
                </Typography>
              </TableCell>

              <TableCell>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {person.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Link
                        href={`mailto:${person.email}`}
                        variant="caption"
                        underline="hover"
                      >
                        {person.email}
                      </Link>
                    </Box>
                  )}
                  {person.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Link
                        href={`tel:${person.phone}`}
                        variant="caption"
                        underline="hover"
                      >
                        {person.phone}
                      </Link>
                    </Box>
                  )}
                  {person.linkedin && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinkedInIcon fontSize="small" color="action" />
                      <Link
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        underline="hover"
                      >
                        LinkedIn
                      </Link>
                    </Box>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {person.date_met && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        Met: {new Date(person.date_met).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  {person.location_met && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {person.location_met}
                      </Typography>
                    </Box>
                  )}
                  {person.notes && (
                    <Tooltip title={person.notes}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {person.notes}
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Delete contact">
                  <IconButton
                    onClick={() => handleDelete(person.id, person.name)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
