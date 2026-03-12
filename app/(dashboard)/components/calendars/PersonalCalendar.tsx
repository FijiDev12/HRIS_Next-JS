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
import { useEmployeeStore } from "@/app/store/useEmployee";
import { toast } from "react-toastify";

export default function LeaveCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { leaveRequests, fetchLeaveRequestsByEmployee, fetchLeaveRequests, loading, error } =
    useLeaveRequestStore();
  const { employee } = useEmployeeInfoStore();
  const { getAssignShiftByEmpId, employeeShifts } = useEmployeeStore();

  // -------------------- FETCH SESSION --------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

    const uniqueShifts = Array.from(
    new Map((employeeShifts || []).map((s: any) => [s.workDate, s])).values()
  );

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    if (employee) {
      const fetchData = async () => {
        try {
          if (sessionData.roleId === 1) {
            await fetchLeaveRequests();
          } else {
            await fetchLeaveRequestsByEmployee(employee.id);
            await getAssignShiftByEmpId(employee.id);
          }
        } catch {
          toast.error("Failed to fetch data");
        }
      };
      fetchData();
    }
  }, [employee, sessionData]);

  // -------------------- SET CALENDAR DATE --------------------
  useEffect(() => {
    const calendarApi: CalendarApi | undefined = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date(year, month, 1));
    }
  }, [month, year]);

  // -------------------- MAP EVENTS --------------------
  const calendarEvents = [
    ...leaveRequests.map((leave) => {
      const startDate = new Date(leave.fromDate);
      const endDate = new Date(leave.toDate);
      endDate.setDate(endDate.getDate() + 1);
      return {
        title: `${leave.leaveTypeId} - ${leave.status}`,
        start: startDate,
        end: endDate,
        allDay: true,
        extendedProps: { ...leave, type: "leave" }, // <--- spread first
        backgroundColor:
          leave.status === "APPROVED"
            ? "#2e7d32"
            : leave.status === "PENDING"
            ? "#ed6c02"
            : "#d32f2f",
      };
    }),
...(uniqueShifts).map((shiftEntry: any) => {
  const workDate = new Date(shiftEntry.workDate);
  const shift = shiftEntry.shift;
  return {
    title: shift.shiftName,
    start: workDate,
    end: workDate,
    allDay: true,
    extendedProps: { ...shiftEntry, type: "shift" },
    backgroundColor: "#1976d2",
  };
}),
  ];
  // -------------------- EVENT CLICK --------------------
  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEvent(arg.event.extendedProps);
  };



  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      {loading && <Typography sx={{ textAlign: "center" }}>Loading...</Typography>}
      {error && <Typography sx={{ textAlign: "center", color: "red" }}>{error}</Typography>}

      {/* Calendar */}
      <Box
        sx={{
          ".fc": { color: "#1976d2" },
          ".fc-daygrid-day": { borderColor: "#1976d2" },
          ".fc-daygrid-day-number": { color: "#1976d2" },
          ".fc-col-header-cell-cushion": { color: "#1976d2", fontWeight: "bold" },
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
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
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
              {selectedEvent?.type === "leave" ? "Leave Details" : "Shift Details"}
            </Typography>
            <IconButton size="small" onClick={() => setSelectedEvent(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {selectedEvent && selectedEvent.type === "leave" && (
            <Box sx={{ color: "black" }}>
              <Typography>
                <strong>From:</strong> {format(new Date(selectedEvent.fromDate), "PPP")}
              </Typography>
              <Typography>
                <strong>To:</strong> {format(new Date(selectedEvent.toDate), "PPP")}
              </Typography>
              <Typography>
                <strong>Total Days:</strong> {selectedEvent.totalDays}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Reason:</strong> {selectedEvent.reason}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={selectedEvent.status}
                  color={
                    selectedEvent.status === "APPROVED"
                      ? "success"
                      : selectedEvent.status === "PENDING"
                      ? "warning"
                      : "error"
                  }
                />
              </Box>
            </Box>
          )}

          {selectedEvent && selectedEvent.type === "shift" && (
            <Box sx={{ color: "black" }}>
              <Typography>
                <strong>Shift Name:</strong> {selectedEvent.shift.shiftName}
              </Typography>
              <Typography>
                <strong>Start Time:</strong> {selectedEvent.shift.startTime}
              </Typography>
              <Typography>
                <strong>End Time:</strong> {selectedEvent.shift.endTime}
              </Typography>
              {selectedEvent.shift.flexStart && (
                <Typography>
                  <strong>Flexible Start:</strong> {selectedEvent.shift.flexStart}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}