"use client";

import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { CalendarApi, EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Box, Typography, Modal, IconButton, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { useLeaveRequestStore } from "@/app/store/useLeaveRequest";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";
import { toast } from "react-toastify";

export default function LeaveCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});

  const { leaveRequests, fetchLeaveRequestsByEmployee,fetchLeaveRequests, loading, error } =
    useLeaveRequestStore();
  const { employee } = useEmployeeInfoStore();
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

//   useEffect(() => {
//     fetchLeaveRequestsByEmployee(); // fetch all
//   }, []);
  // -------------------- FETCH SESSION --------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);
  
    // -------------------- FETCH DATA --------------------
    useEffect(() => {
      if (employee) {
          const fetchData = async () => {
              try {
              if (sessionData.roleId === 1) {
                  await fetchLeaveRequests();
              } else {
                  await fetchLeaveRequestsByEmployee(employee.id);
              }
              } catch {
              toast.error("Failed to fetch leave requests");
              }
          };
          fetchData();

      }
    }, [employee, sessionData]);

  useEffect(() => {
    const calendarApi: CalendarApi | undefined =
      calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date(year, month, 1));
    }
  }, [month, year]);

  /* =========================
     Map Leave Requests to Calendar Events
  ========================= */

const calendarEvents = leaveRequests.map((leave) => {
  const startDate = new Date(leave.fromDate);
  const endDate = new Date(leave.toDate);

  // Add 1 calendar day safely (exclusive end)
  endDate.setDate(endDate.getDate() + 1);

  return {
    title: `${leave.leaveTypeId} - ${leave.status}`,
    start: startDate,
    end: endDate,
    allDay: true,
    extendedProps: leave,
    backgroundColor:
      leave.status === "APPROVED"
        ? "#2e7d32"
        : leave.status === "PENDING"
        ? "#ed6c02"
        : "#d32f2f",
  };
});

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedLeave(arg.event.extendedProps);
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      {loading && (
        <Typography sx={{ textAlign: "center" }}>
          Loading leave requests...
        </Typography>
      )}
      {error && (
        <Typography sx={{ textAlign: "center", color: "red" }}>
          {error}
        </Typography>
      )}

      {/* Calendar */}
      <Box
        sx={{
          ".fc": { color: "#1976d2" },
          ".fc-daygrid-day": { borderColor: "#1976d2" },
          ".fc-daygrid-day-number": { color: "#1976d2" },
          ".fc-col-header-cell-cushion": {
            color: "#1976d2",
            fontWeight: "bold",
          },
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate={new Date(year, month, 1)}
          events={calendarEvents}
          contentHeight="auto"
          dayMaxEvents
          eventContent={(arg: EventContentArg) => (
            <Box
              sx={{
                fontSize: "0.7rem",
                color: "white",
                borderRadius: 1,
                px: 0.5,
                textAlign: "center",
                whiteSpace: "normal",
              }}
            >
              {arg.event.title}
            </Box>
          )}
          eventClick={handleEventClick}
        />
      </Box>

      {/* Modal */}
      <Modal open={!!selectedLeave} onClose={() => setSelectedLeave(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            minWidth: { xs: "85%", sm: 350 },
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ color: "black" }}>
              Leave Details
            </Typography>
            <IconButton size="small" onClick={() => setSelectedLeave(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {selectedLeave && (
            <Box sx={{ color: "black" }}>
              <Typography>
                <strong>From:</strong>{" "}
                {format(new Date(selectedLeave.fromDate), "PPP")}
              </Typography>

              <Typography>
                <strong>To:</strong>{" "}
                {format(new Date(selectedLeave.toDate), "PPP")}
              </Typography>

              <Typography>
                <strong>Total Days:</strong> {selectedLeave.totalDays}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Reason:</strong> {selectedLeave.reason}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={selectedLeave.status}
                  color={
                    selectedLeave.status === "APPROVED"
                      ? "success"
                      : selectedLeave.status === "PENDING"
                      ? "warning"
                      : "error"
                  }
                />
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}