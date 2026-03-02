"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { CalendarApi, EventContentArg, EventClickArg } from "@fullcalendar/core"; 
import dayGridPlugin from "@fullcalendar/daygrid";
import { Box, Typography, Modal, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { format } from "date-fns";
import { useHolidayStore } from "@/app/store/useHoliday";

export default function HolidayCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const calendarRef = useRef<FullCalendar>(null);

  const { holidays, fetchHolidays, loading, error } = useHolidayStore();
  const [selectedHoliday, setSelectedHoliday] = useState<any>(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    const calendarApi: CalendarApi | undefined = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date(year, month, 1));
    }
  }, [month, year]);

  const calendarEvents = holidays.map((h) => ({
    title: h.holidayName,
    date: h.holidayDate,
    extendedProps: h,
  }));

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedHoliday(arg.event.extendedProps);
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      {loading && <Typography sx={{ textAlign: "center" }}>Loading holidays...</Typography>}
      {error && <Typography sx={{ textAlign: "center", color: "red" }}>{error}</Typography>}

      {/* FullCalendar */}
      <Box
        sx={{
          ".fc": { color: "#1976d2" },
          ".fc-col-header-cell-cushion": { color: "#1976d2", fontWeight: "bold" },
          ".fc-daygrid-day-number": { color: "#1976d2" },
          ".fc-daygrid-event": { 
            backgroundColor: "#1976d2", 
            color: "white", 
            cursor: "pointer", 
            whiteSpace: "normal", // allow wrapping
            fontSize: "0.8rem",
            px: 0.5,
          },
          ".fc-daygrid-day": { borderColor: "#1976d2" },
          ".fc-toolbar-chunk": {
            display: "flex",
            flexWrap: "wrap", // wrap buttons on small screens
            justifyContent: "center",
            gap: 1,
          },
          ".fc-header-toolbar": {
            flexDirection: { xs: "column", sm: "row" } as any, // stack toolbar on mobile
            alignItems: "center",
          },
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate={new Date(year, month, 1)}
          events={calendarEvents}
          dayMaxEventRows={3}
          contentHeight="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          eventContent={(arg: EventContentArg) => (
            <Box
              sx={{
                fontSize: "0.75rem",
                backgroundColor: "#1976d2",
                color: "white",
                borderRadius: 1,
                px: 0.5,
                textAlign: "center",
                overflow: "hidden",
                whiteSpace: "normal", // wrap for mobile
                textOverflow: "ellipsis",
              }}
              title={arg.event.title}
            >
              {arg.event.title}
            </Box>
          )}
          eventClick={handleEventClick}
          dayMaxEvents={true} // "+x more"
        />
      </Box>

      {/* Modal */}
      <Modal open={!!selectedHoliday} onClose={() => setSelectedHoliday(null)}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            minWidth: { xs: "80%", sm: 300 },
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'black' }}>Holiday Details</Typography>
            <IconButton size="small" onClick={() => setSelectedHoliday(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {selectedHoliday && (
            <Box>
              <Typography sx={{ color: 'black' }}><strong>Name:</strong> {selectedHoliday.holidayName}</Typography>
              <Typography sx={{ color: 'black' }}><strong>Date:</strong> {format(new Date(selectedHoliday.holidayDate), "PPP")}</Typography>
              {selectedHoliday.description && <Typography><strong>Description:</strong> {selectedHoliday.description}</Typography>}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}