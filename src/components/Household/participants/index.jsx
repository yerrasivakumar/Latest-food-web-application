import React, { useEffect } from "react";

import {
  Box,
  Button,
  Checkbox,
  Paper,
  Stack,
  TextField,
  Typography,
  outlinedInputClasses,
} from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import homeicon from "../../../../src/assets/homeicon.svg";

import Grid from "@mui/material/Grid";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment/moment";
import { useState } from "react";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function createData(id, name, calories, fat, carbs, protein) {
  return {
    id,
    name,
    calories,
    fat,
    carbs,
    protein,
  };
}




function stableSort(array) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "Participant Id",
    numeric: false,
    disablePadding: true,
  },
  {
    id: "Participant Code",
    numeric: true,
    disablePadding: true,
  },
  {
    id: "First Name",
    numeric: true,
    disablePadding: false,
  },

  {
    id: "Family Name",
    numeric: true,
    disablePadding: false,
  },
  {
    id: "Date Of Birth",
    numeric: true,
    disablePadding: false,
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    numSelected,
    rowCount,
  } = props;
// const dispatch = useDispatch()
//   React.useEffect(()=>{
//     dispatch(removeAllFamilyMembers())
//   },[])

  return (
    <TableHead style={{'height':'45px'}}>
      <TableRow >
        {/* <TableCell
          padding="checkbox"
          style={{ border: "0", backgroundColor: "#EEEEEE" }}
        >
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell> */}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"left"}
            padding={"normal"}
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              border: "0",
              backgroundColor: "#EEEEEE",
            }}
          >
            {headCell.id}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const Index = () => {


  const [data,setData] = useState([])
useEffect(()=>{
  axios.get('/api/participants')
  .then((res)=>{
    setData(res.data)
    console.log('as', res)
  }).catch(err=>{
    console.log("error", err);
  })
},[])
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  // const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);


  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data?.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
const navigate = useNavigate()
  const handleClick = (event, id) => {
    // const selectedIndex = selected.indexOf(id);
    // let newSelected = [];

    // if (selectedIndex === -1) {
    //   newSelected = newSelected.concat(selected, id);
    // } else if (selectedIndex === 0) {
    //   newSelected = newSelected.concat(selected.slice(1));
    // } else if (selectedIndex === selected.length - 1) {
    //   newSelected = newSelected.concat(selected.slice(0, -1));
    // } else if (selectedIndex > 0) {
    //   newSelected = newSelected.concat(
    //     selected.slice(0, selectedIndex),
    //     selected.slice(selectedIndex + 1)
    //   );
    // }
    // setSelected(newSelected);
    navigate(`/household/viewParticipant?id=${id}`)
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.length) : 0;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [age, setAge] = React.useState("");
  const [fromdate, setFromdate] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const [displaytime, setDisplaytime] = useState(null);

  const handleTimeChange = (newTime) => {
    //console.log(newTime["$d"])
    setDisplaytime(moment(newTime["$d"]).format("hh:mm:ss a"));
  };
  return (
    <>
      {/* dialog box */}
      <Box p={3} >
        {/* <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#45AEAE",
              color: "white",
            }}
          >
            {"Schedule Interview"}
          </DialogTitle>
          <Box>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12} lg={4} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="demo-select-small-label">
                      Occupation
                    </InputLabel>
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={age}
                      label="Occupation"
                      onChange={handleChange}
                    >
                      <MenuItem value={"age"}>Age</MenuItem>
                      <MenuItem value={"Education"}>Education</MenuItem>
                      <MenuItem value={"Gender"}>Gender</MenuItem>
                      <MenuItem value={"Region"}>Region</MenuItem>
                      <MenuItem value={"Marital status"}>
                        Marital status
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Box pt={1}>
                    {" "}
                    <Typography
                      pt={1}
                      textAlign={"center"}
                      backgroundColor={"lightgrey"}
                    >
                      {age}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12} lg={4} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      size="small"
                      //value={fromdate}
                      inputFormat="DD/MM/YYYY"
                      onChange={(newValue) => {
                        if (newValue) {
                          setFromdate(
                            moment(newValue["$d"])?.format("YYYY-MM-DD")
                          );
                        } else {
                          setFromdate("");
                        }
                      }}
                      slotProps={{ textField: { size: "small" } }}
                      renderInput={(params) => (
                        <TextField
                          fullWidth
                          sx={{
                            "& .MuiInputBase-input": {
                              height: "10px",
                            },
                          }}
                          {...params}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <Box pt={1}>
                    {" "}
                    <Typography
                      pt={1}
                      textAlign={"center"}
                      backgroundColor={"lightgrey"}
                    >
                      {fromdate}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} lg={4} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      // label="Basic time picker"
                      timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                      slotProps={{
                        textField: {
                          sx: {
                            // borderRadius: 6,
                            // fieldset: { borderRadius: 6 },

                            [`.${outlinedInputClasses.root}`]: {
                              height: 40,
                              width: 150,
                            },

                            "& .MuiInputLabel-root": { lineHeight: 1 },
                          },
                        },
                      }}
                      value={displaytime}
                      onChange={handleTimeChange}
                    />
                  </LocalizationProvider>
                  <Box pt={1}>
                    {" "}
                    <Typography
                      pt={1}
                      textAlign={"center"}
                      backgroundColor={"lightgrey"}
                    >
                      {displaytime}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </Box>

          <Box
            pt={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            pb={1}
          >
            <Button
              variant="contained"
              style={{ color: "white", width: "9rem" }}
            >
              Confirm
            </Button>
          </Box>
        </Dialog> */}
      </Box>

      <Box marginTop={"-3rem"}>
        <Paper
          sx={{ backgroundColor: "white", border: "none", borderRadius: "0%" }}
          elevation={1}
          style={{overflowY:'hidden',marginBottom:'10px'}}
        >
          <Stack
            p={1}
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            alignItems={"center"}
            flexWrap={"wrap"}
          >
            <Box
              display={"flex"}
              pl={2}
              flexDirection={"row"}
              gap={1}
              alignItems={"center"}
              justifyContent={"flex-start"}
            >
              <Box>
                <img src={homeicon} alt="icon" width={"28px"} />
              </Box>
              <Box>
                <Typography
                  style={{
                    color: "#1D2420",
                    fontWeight: "bold",
                    fontSize: "1.3rem",
                  }}
                  pt={0.5}
                >
                  List of all Participants {data?.length}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box
                display={"flex"}
                flexDirection={"row"}
                gap={2}
                alignItems={"center"}
                justifyContent={"flex-start"}
              >
                <Box>
                  <Button
                    variant="text"
                    onClick={()=>{navigate('/household/addParticipant')}}
                    style={{
                      color: "#3487E5",
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "20px",
                    }}
                    pt={0.5}
                  >
                    Add Participant
                  </Button>
                </Box>
                {/* <Box>
                  <FormControl sx={{ m: 0, minWidth: 122 }} size="small">
                    <InputLabel id="demo-select-small-label">
                      Occupation
                    </InputLabel>
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      // value={age}
                      label="Occupation"
                      // onChange={handleChange}
                    >
                      <MenuItem value={"Age"}>Age</MenuItem>
                      <MenuItem value={"Education"}>Education</MenuItem>
                      <MenuItem value={"Gender"}>Gender</MenuItem>
                      <MenuItem value={"Region"}>Region</MenuItem>
                      <MenuItem value={"Marital Status"}>
                        Marital Status
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box> */}
              </Box>
            </Box>
          </Stack>
          <Stack
            flexDirection={{ md: "row", sm: "column" }}
            justifyContent={"space-between"}
            display={"flex"}
            alignItems={"center"}
            // pt={2}
            p={1.5}
          >
            <Box sx={{ width: "100%" }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  // size={dense ? "small" : "medium"}
                  stickyHeader
                  size="small"
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    onSelectAllClick={handleSelectAllClick}
                    rowCount={data.length}
                  />
                  <TableBody >
                  {(rowsPerPage > 0
            ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : data
          ).map((row,index) => (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row.participantId)}
                          role="checkbox"
                        //   aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.participantId}
                          // selected={isItemSelected}
                          sx={{ cursor: "pointer" }}
                          style={
                            index % 2 !== 0 ? { backgroundColor: "#F1F4F4" } : {}
                          }
                        >
                          {/* <TableCell padding="checkbox" style={{ border: "0" }}>
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": labelId,
                              }}
                            />
                          </TableCell> */}
                          <TableCell
                            component="th"
                            // id={labelId}
                            scope="row"
                            // padding={'normal'}
                            style={{ border: "0" }}
                            align="left"
                          >
                            <Typography fontSize={"0.85rem"} color={"#1D2420"}>
                              {row?.participantId}
                            </Typography>
                          </TableCell>
                          <TableCell
                            component="th"
                            // id={labelId}
                            scope="row"
                            // padding={'normal'}
                            style={{ border: "0" }}
                            align="left"
                          >
                            <Typography fontSize={"0.85rem"} color={"#1D2420"}>
                              {row?.participantCode}
                            </Typography>
                          </TableCell>
                          <TableCell align="left" style={{border: "0"}}>
                            {row.firstName}
                          </TableCell>
                          <TableCell align="left" style={{ border: "0" }}>
                            {row.familyName}
                          </TableCell>
                          <TableCell align="left" style={{ border: "0" }}>
                            {moment(row.dob).format('DD-MM-YYYY')}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                    {emptyRows > 0 && (
                      <TableRow
                        // style={{
                        //   height: (dense ? 33 : 53) * emptyRows,
                        // }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                sx={{
                  ".MuiInputBase-root": {
                    marginTop: "-14px",
                    marginRight: "5px",
                  },
                  ".MuiTablePagination-toolbar": {
                    color: "rgb(41, 39, 39)",
                    height: "35px",
                  },
                  ".MuiBox-root": {
                    color: "black",
                    "& .MuiSvgIcon-root": {
                      color: "black",
                    },
                  },
                  ".MuiTablePagination-actions": {
                    marginTop: "-12px",
                    marginLeft: "2px",
                  },
                  marginTop: "10px",
                  marginBottom: "-20px",
                }}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              {/* </Paper> */}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default Index;
