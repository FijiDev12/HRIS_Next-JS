"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Grid,
  Button,
  Modal,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";
import { useTimelogStore, Timelog } from "@/app/store/useTimelogs";
import React from "react";

export default function AttendancePage() {
  const { employee, fetchEmployee, loading: empLoading, error: empError } = useEmployeeInfoStore();
  const { timelogs, postTimelog, getDTR } = useTimelogStore();
  const [todayLog, setTodayLog] = useState<Timelog | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLatLng, setCurrentLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraTrack, setCameraTrack] = useState<MediaStreamTrack | null>(null);
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch employee once
  useEffect(() => {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("accessToken");
    if (id && token) fetchEmployee(parseInt(id), token, () => {});
  }, []);

  // Fetch today's timelog once employee is loaded
  useEffect(() => {
    if (!employee) return;
    const today = new Date().toISOString().split("T")[0];
    getDTR(employee.id, today, today).then((logs: any) => setTodayLog(logs[0] || null));
  }, [employee]);

  // Load session data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

  // Open camera and geolocation
  const openCameraAndPreview = async () => {
    if (!employee) return;

    setLoadingAction(true);

    try {
      // Get camera stream first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      setCameraTrack(track);
      streamRef.current = stream;

      // Get geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setCurrentLatLng({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      // Open modal
      setModalOpen(true);

      // Wait for modal to render video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
          setCameraReady(true);
        }
      }, 100); // small delay ensures video element exists
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Unable to access camera or location.");
      handleCancel();
    } finally {
      setLoadingAction(false);
    }
  };

  // Capture snapshot and send timelog
  const handleSendTimelog = async () => {
    if (!employee || !videoRef.current || !currentLatLng) return;

    setLoadingAction(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      if (!blob) return;

      await postTimelog(
        employee.employeeNo,
        new File([blob], "selfie.jpg", { type: blob.type }),
        currentLatLng.lat,
        currentLatLng.lng
      );

      const today = new Date().toISOString().split("T")[0];
      const logs = await getDTR(employee.id, today, today);
      setTodayLog(logs[0] || null);

      handleCancel();
    } catch (err) {
      console.error("Error sending timelog:", err);
      toast.error("Failed to send timelog");
    } finally {
      setLoadingAction(false);
    }
  };

  // Cancel modal
  const handleCancel = () => {
    setModalOpen(false);
    setCameraReady(false);
    cameraTrack?.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCameraTrack(null);
    setCurrentLatLng(null);
  };

  const handleTimeIn = async () => {
    if (timelogs?.[0]?.timelogs[0]) toast.warning("You have already logged in today");
    else await openCameraAndPreview();
  };

  const handleTimeOut = async () => {
    if (timelogs?.[0]?.timelogs[1]) toast.warning("You have already logged out today");
    else await openCameraAndPreview();
  };

  const formatTime = React.useCallback((dateString?: string) => {
    if (!dateString || dateString === "-") return "-";
    return new Date(dateString).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  }, []);

  useEffect(()=>{
    if(timelogs){
      console.log(timelogs)
    }
  },[timelogs])

  if (empLoading) return <Typography>Loading employee data…</Typography>;
  if (empError) return <Typography color="error">{empError}</Typography>;

  return (
    <Box sx={{ p: 2, }}>
      <ToastContainer />
      <Backdrop open={loadingAction} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h4" fontWeight="bold" mb={1}>Attendance Dashboard</Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[12, 4, 4]}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Employee No</Typography>
              <Typography variant="h5" fontWeight="bold">{employee?.employeeNo ?? "-"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[12, 4, 4]}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Department ID</Typography>
              <Typography variant="h5" fontWeight="bold">{employee?.departmentId ?? "-"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[12, 4, 4]}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="h5" fontWeight="bold">{employee?.isActive ? "Active" : "Inactive"}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time In / Time Out */}
      <Grid container spacing={2} sx={{ mb: 4, display: sessionData?.roleId !== 1 ? "block" : "none" }}>
        <Grid size={[12, 12, 12]}>
          <Button variant="contained" color="primary" onClick={handleTimeIn} sx={{ mr: 2 }}>Time In</Button>
          <Button variant="contained" color="secondary" onClick={handleTimeOut}>Time Out</Button>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Timelogs Table */}
      <Grid container spacing={2} sx={{ mb: 4, display: sessionData?.roleId !== 1 ? "block" : "none" }}>
        <Grid size={[12, 12, 12]}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Timelogs</Typography>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Breaks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timelogs.length > 0 ? (
                  timelogs.map((log: any, index: number) => (
                    <TableRow key={log.id ?? `${log.employeeId}-${log.workDate}-${index}`}>
                      <TableCell>{new Date(log?.workDate || '-').toLocaleDateString()}</TableCell>
                      <TableCell>{formatTime(log?.timelogs?.[0]?.loggedAt || '-')}</TableCell>
                      <TableCell>{formatTime(log?.timelogs?.[1]?.loggedAt || '-')}</TableCell>
                      <TableCell>{log?.shift?.shiftName || "-"}</TableCell>
                      <TableCell>{log.shift?.breakMinutes || "-"} {log.shift?.breakMinutes ? "Minutes" : ""}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No timelogs available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>

      {/* Modal for live camera */}
      <Modal open={modalOpen} onClose={handleCancel}>
        <Box sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          textAlign: 'center',
        }}>
          <Typography variant="h6" mb={2}>Live Camera Preview</Typography>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
          />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSendTimelog} 
              disabled={!cameraReady}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}