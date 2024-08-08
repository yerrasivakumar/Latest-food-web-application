  import React, { useCallback, useEffect } from "react";

  import {
    Box,
    Button,
    Checkbox,
    IconButton,
    Paper,
    Stack,
    TextField,
    ThemeProvider,
    Tooltip,
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
  import homeicon from "../../../src/assets/homeicon.svg";
  import NoteAltIcon from '@mui/icons-material/NoteAlt';
  import Grid from "@mui/material/Grid";
  import { TimePicker } from "@mui/x-date-pickers";
  import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  import { DatePicker } from "@mui/x-date-pickers/DatePicker";
  import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
  import moment from "moment/moment";
  import { useState } from "react";
  import axios from "../../api/axios";
  import { useNavigate } from "react-router-dom";
  import Edit from "@mui/icons-material/Edit";
  import { useDispatch, useSelector } from "react-redux";
  import { resetHouseHolds, setApiErrorStatusCode, setComplete, setCompleteClear, setLoading } from "../../store/slices/app.tsx";
  import { Visibility } from "@mui/icons-material";
  import { useTranslation } from "react-i18next";
  import rtlPlugin from "stylis-plugin-rtl";
  import { prefixer } from "stylis";
  import { CacheProvider } from "@emotion/react";
  import createCache from "@emotion/cache";
  import {createTheme} from '@mui/material'
  import { toast } from "react-toastify";
  import * as XLSX from "xlsx";
  import * as XlsxPopulate from "xlsx-populate/browser/xlsx-populate";
  const themeRtl = createTheme({
    direction: "rtl" // Both here and <body dir="rtl">
  });
  const themeLtr = createTheme({
    direction: "ltr" // Both here and <body dir="ltr">
  });
  // Create rtl cache
  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin]
  });


  function stableSort(array) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    return stabilizedThis.map((el) => el[0]);
  }





  function EnhancedTableHead(props) {
    const lang = sessionStorage.getItem('lang')
    const {t} = useTranslation()
    const appState = useSelector(state=>state.app)

// console.log("familyCode",appState?.houseHold)
    const headCells = [
    
      {
        id: `${t('Name of head of the family')}`,
        numeric: false,
        disablePadding: true,
      },
      // {
      //   id: `${t('Family members')}`,
      //   numeric: true,
      //   disablePadding: true,
      // },
      {
        id: `${t('Family code')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('HouseHold ID')}`,
        numeric: true,
        disablePadding: false,
      },
    
      {
        id: `${t('Phone number')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('Created at')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('Survey Status')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('Participants')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('View')}`,
        numeric: true,
        disablePadding: false,
      },
      {
        id: `${t('Edit')}`,
        numeric: true,
        disablePadding: false,
        display:appState?.loginInfo?.role === 'Administrator' ? 'none':'flex'
      },
      {
        id: `${t('Assign')}`,
        numeric: true,
        disablePadding: false,
        display:appState?.loginInfo?.role === 'Administrator' ? 'none':'flex'
      },
    ];
    const {
      onSelectAllClick,
      numSelected,
      rowCount,
    } = props;


    return (
      <TableHead style={{'height':'45px'}}>
        <TableRow >
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={lang==='ar'?"right":"left"}
              padding={"normal"}
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                border: "0",
                backgroundColor: "#EEEEEE",
                whiteSpace:'nowrap',
                position:'sticky',
                left:0,
                zIndex:headCell?.id ===`${t('Name of head of the family')}` ? 2:1
              }}
              sx={!appState?.roleinfo?.role?.includes('Recruiter') && (headCell.id === t('Edit') || headCell.id === t('Assign')) ? { display:'none'}:{}}
            >
              {headCell.id}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  const Index = () => {

    const lang = sessionStorage.getItem('lang')


  const appState = useSelector((state)=>state?.app)
  const dispatch = useDispatch()
  const [page, setPage] = React.useState(0);
  // const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [searchValue,setSearchValue] = useState('')
  const [data,setData] = useState([])
  const [response,setResponse] = useState({})


  useEffect(()=>{
    if(searchValue===""){
      dispatch(setLoading(true))
    }
    const debounce = setTimeout(()=>{
        axios.get('/api/household/getAllHouseholdWithparticipants',{
        headers: {authorization : `Bearer ${appState?.accessToken}`},
        params:{
          ...(searchValue && {search:searchValue}),
          pageSize:rowsPerPage,
          pageNumber:page+1
        }
      })
      .then((res)=>{
        dispatch(setLoading(false))
        setData(res?.data?.data?.items)
        setResponse(res?.data?.data)
      }).catch(err=>{
          dispatch(setLoading(false))
          dispatch(setApiErrorStatusCode(err?.response?.status))
          toast.error(err?.response?.data?.Errors[0])
      })
    },searchValue===""?10:500)

    return()=>{
      clearTimeout(debounce)
    }
  },[searchValue,rowsPerPage,page])


    const [selected, setSelected] = React.useState([]);



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
      
      
      navigate(`/household/viewHouseHold?id=${id}&page=edit`)
    };
    const handleViewClick = (event, id) => {
      navigate(`/household/viewHouseHold?id=${id}&page=view`)
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      // setOpen(true);
      navigate('/household/addHousehold')
      dispatch(resetHouseHolds())
      dispatch(setCompleteClear([]))
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
    const {t} = useTranslation()

  //   let flattedArray = []
  //   const addStyles = (workbookBlob, dataInfo) => {
  //     return XlsxPopulate.fromDataAsync(workbookBlob).then(workbook => {
  //       workbook.sheets().forEach(sheet => {
  //         sheet.column("A").width(10);
  //         sheet.column("B").width(15);
  //         sheet.column("C").width(15);
  //         sheet.column("D").width(15);
  //         sheet.column("E").width(15);
  //         sheet.column("F").width(15);
  //         sheet.column("G").width(15);
  //         sheet.column("H").width(15);
  //         sheet.column("I").width(15);
  //         sheet.column("J").width(15);

  //         // sheet.cell(dataInfo.titleCell).style({
  //         //   bold: true,
  //         // })
  //         // sheet.range(dataInfo.visitNum).style({
  //         //   horizontalAlignment:'center'
  //         // })
  //         // sheet.range(dataInfo.serialNum).style({
  //         //   horizontalAlignment:'center'
  //         // })
  //         // sheet.cell(dataInfo.timeStamp).style({
  //         //   bold: true,
  //         // })
  //         // sheet.range(dataInfo.tableHeader).style({
  //         //   bold: true,
  //         // });
  //         function getColumnLetter(index) {
  //           let columnName = '';
  //           while (index > 0) {
  //               const remainder = (index - 1) % 26;
  //               columnName = String.fromCharCode(65 + remainder) + columnName;
  //               index = Math.floor((index - 1) / 26);
  //           }
  //           return columnName;
  //       }
  //       flattedArray.map((row,index)=>{
  //         const sort = row?.foodIntakeResponse
  //         ?.filter((vis) => vis.visitNumber === 1)
  //         ?.slice()
  //         .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);
  //       const sort2 = row?.foodIntakeResponse
  //         ?.filter((vis) => vis.visitNumber === 2)
  //         ?.slice()
  //         .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);
    
  //       let sortedData = 
  //         Object.values(
  //           sort.reduce((groups, food) => {
  //             if (!groups[food.foodIntakeTypeId]) {
  //               groups[food.foodIntakeTypeId] = [];
  //             }
  //             groups[food.foodIntakeTypeId].push(food);
  //             return groups;
  //           }, {})
  //         )
    
  //         let sortedData2 = 
  //         Object.values(
  //           sort2.reduce((groups, food) => {
  //             if (!groups[food.foodIntakeTypeId]) {
  //               groups[food.foodIntakeTypeId] = [];
  //             }
  //             groups[food.foodIntakeTypeId].push(food);
  //             return groups;
  //           }, {})
  //         )

  //       let col = 82+32
  //       let col2 = 82+32
  //       //food intake records
  //       sheet.cell(`${getColumnLetter(82+32)}${4}`).value('Meal Type')
  //       sheet.cell(`${getColumnLetter(82+33)}${4}`).value('Food Name')
  //       sheet.cell(`${getColumnLetter(82+34)}${4}`).value('Quantity')
  //       sheet.cell(`${getColumnLetter(82+35)}${4}`).value('Measurement')
  //       sheet.cell(`${getColumnLetter(82+36)}${4}`).value('Location')
  //       sheet.cell(`${getColumnLetter(82+37)}${4}`).value('Activities')
  //       sheet.cell(`${getColumnLetter(82+38)}${4}`).value('Consumption Time')
  //       sheet.range('A4:ZZ4').style({
  //         bold:true
  //       })
  //       sortedData?.flat()?.map((food,ind)=>{
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.foodIntakeType)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.foodName)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.quantity)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.measurement)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.location)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.activities)
  //           col++
  //           sheet.cell(`${getColumnLetter(col+ind)}${index+5}`).value(food?.consumptionTime)
  //           col++
  //       })
  //       sortedData2?.flat()?.map((food,ind)=>{
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.foodIntakeType)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.foodName)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.quantity)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.measurement)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.location)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.activities)
  //           col2++
  //           sheet.cell(`${getColumnLetter(col2+ind)}${index+5}`).value(food?.consumptionTime)
  //           col2++
  //       })
  //       //nutrients
  //       let cell = 4+index+1
  //       row.nutrientValueResponse?.filter((fil)=>fil.visitNumber===1)?.map((nutr,i)=>{
  //         sheet.cell(`${getColumnLetter(82+i)}${4}`).value(nutr.nutrientName)
  //       })
  //       row.nutrientValueResponse?.filter((fil,a)=>fil.visitNumber===1)?.map((nutr,i)=>{
  //         sheet.cell(`${getColumnLetter(82+i)}${cell}`).value(nutr.nutrientValue)
  //       })
  //       row.nutrientValueResponse?.filter((fil,a)=>fil.visitNumber===2)?.map((nutr,i)=>{
  //         sheet.cell(`${getColumnLetter(82+i)}${cell}`).value(nutr.nutrientValue)
  //       })
        
  //         sheet.cell(`${getColumnLetter(82+30)}${4}`).value('BMI Value')
  //         sheet.cell(`${getColumnLetter(82+31)}${4}`).value('EER Value')
  //         row.nutrientIndexResponse?.map((nutr,i)=>{
  //           sheet.cell(`${getColumnLetter(82+30)}${index+5}`).value(nutr.bmiValue)
  //           sheet.cell(`${getColumnLetter(82+31)}${index+5}`).value(nutr.eerValue)
  //         })
  //         // row.nutrientIndexResponse?.filter((fil,a)=>fil.visitNumber===2)?.map((nutr,i)=>{
  //         //   sheet.cell(`${getColumnLetter(81+30)}${index+5}`).value(nutr.bmiValue)
  //         // })
  //         // sheet.cell(`DG${index+5}`).value(row.nutrientIndexResponse[0]?.bmiValue)
  //         // sheet.cell(`DH${index+5}`).value(row.nutrientIndexResponse[0]?.eerValue)
  //         // sheet.cell(`DG${index+6}`).value(row.nutrientIndexResponse[1]?.bmiValue)
  //         // sheet.cell(`DH${index+6}`).value(row.nutrientIndexResponse[1]?.eerValue)
  //       })

  //       // sheet.cell(`CC5`).value('food.foodName')
  //       });
  //       return workbook
  //         .outputAsync()
  //         .then(workbookBlob => URL.createObjectURL(workbookBlob));
  //     });
  //   };

  //   // #2
  //   const s2ab = useCallback(s => {
  //     const buf = new ArrayBuffer(s.length);
  //     const view = new Uint8Array(buf);
  //     for (let i = 0; i !== s.length; ++i) {
  //       view[i] = s.charCodeAt(i);
  //     }

  //     return buf;
  //   }, []);
  //   const workbook2blob = useCallback(
  //     workbook => {
  //       const wopts = {
  //         bookType: "xlsx",
  //         type: "binary",
  //       };
  //       const wbout = XLSX.write(workbook, wopts);

  //       const blob = new Blob([s2ab(wbout)], {
  //         type: "application/octet-stream",
  //       });
  //       return blob;
  //     },
  //     [s2ab],
  //   );


  
    

  //   const handleExport = async() => {
      
  //     let result;
  //     dispatch(setLoading(true))
  //     await axios
  //     .get("/api/household/getAllHouseholdsDemograhics", {
  //       headers: { authorization: `Bearer ${appState?.accessToken}` },
  // }).then(async(response)=>{
  //   result = await response?.data?.data?.items
  //   console.log("sivaaa",result)
  // }).catch((err)=>{

  // })
      
  //     const TimeStampp = [
  //       {A:'',B:'',C:'',D:'',E: "",F:'',G: "",H:'',I:'', J: ` Timestamp : ${moment(new Date()).format("hh:mm:ss A")}` },
  //     ];


  //     const newArr = result?.map(arr=>(arr?.participants?.map(arr2=>({...arr2,familyCode:arr?.familyCode,cityName:arr?.cityName}))))

    
      
  //     let HorizontalTable = [
  //       {
  //         A:'Participant Code',
  //         B:'Family Code',
  //         C:'First Name',
  //         D:'Family Name',
  //         E:'Survey Time',
  //         F:'CityName'   
  //       },
  //     ]

  //     flattedArray = newArr?.flat()

  //     flattedArray.forEach((row,index) => {

  //       HorizontalTable.push({
  //           A:row?.participantCode || 'NA',
  //           B:row?.participantCode?.slice(0, 10) || 'NA',
  //           C:row?.firstName || 'NA',
  //           D:row?.familyName || 'NA',
  //           E:row?.createdDate || 'NA',
  //           F:row ?.cityName || 'NA'
              
        
  //     })
  //   })
      
  //     const finalData = [
  //        {A:'',B:'',C:'',D:'',E:'',F: "ADAFSA REPORTS SUMMARY"},
  //       ...TimeStampp,
  //       {},
  //       // ...table1,
  //       ...HorizontalTable
  //     ];
  //     // Create a workbook
  //     const wb = XLSX.utils.book_new();
  //     // Create a worksheet
  //     const sheet = XLSX.utils.json_to_sheet(finalData, {
  //       skipHeader: true,
  //     });

  //     const dataInfo = {
  //       titleCell: "F1",
  //       titleRange: "A1:I2",
  //       timeStamp: "J2",
  //       tableHeader:"A4:N4",
  //       tbodyRange: `A5:N${finalData.length}`,
  //       serialNum : `A5:A${finalData.length}`,
  //       visitNum:`I5:I${finalData.length}`
  //     };

  //     XLSX.utils.book_append_sheet(wb, sheet, "ADAFSA");

  //     const workbookBlob = workbook2blob(wb);

  //     const headerIndexes = [];
  //     finalData.forEach((data, index) =>
  //       data["A"] === "Serial No" ? headerIndexes.push(index) : null,
  //     );

  //     return addStyles(workbookBlob, dataInfo);
  //   };


  //   const createDownloadData = useCallback( () => {
  //     // if(totalSize===0)return
    
  //     handleExport().then(url => {
  //       const downloadAnchorNode = document.createElement("a");
  //       downloadAnchorNode.setAttribute("href", url);
  //       downloadAnchorNode.setAttribute("download", "ADAFSA");
  //       downloadAnchorNode.click();
  //       downloadAnchorNode.remove();
  //     });
  //   }, [handleExport]);

    


    return (
      <>
        {/* dialog box */}
        <Box p={3} >
          <Dialog
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
                      height={'33px'}
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        backgroundColor={"lightgrey"}
                      >
                        {age}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={12} lg={4} md={4}>
                    <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        size="small"
                        //value={fromdate}
                        format="DD/MM/YYYY"
                        fullWidth
                        style={{width:'100%'}}

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
                            style={{width:'100%'}}
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
                    </FormControl>
                    <Box pt={1}>
                      {" "}
                      <Typography
                        // pt={1}
                        height={'33px'}
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        backgroundColor={"lightgrey"}
                      >
                        {moment(fromdate).format('DD-MM-YYYY')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={4} md={4}>
                  <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        // label="Basic time picker"
                        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                        fullWidth
                        style={{width:'100%'}}
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
                        renderInput={(params) => (
                          <TextField
                            fullWidth
                            style={{width:'100%'}}
                            sx={{
                              "& .MuiInputBase-input": {
                                height: "10px",
                              },
                            }}
                            {...params}
                          />
                        )}
                        value={displaytime}
                        onChange={handleTimeChange}
                      />
                    </LocalizationProvider>
                    </FormControl>
                    <Box pt={1}>
                      {" "}
                      <Typography
                      height={'33px'}
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
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
          </Dialog>
        </Box>

        <Box marginTop={"-3rem"}>
          <Paper
            sx={{ backgroundColor: "white", border: "none", borderRadius: "0%" }}
            elevation={1}
            style={{overflowY:'hidden',marginBottom:'10px'}}
          >
            <div dir={lang==='ar'?"rtl":''}>
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
                    {t('List of all households')} {response?.totalCount || 10}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box
                  flexDirection={"row"}
                  gap={2}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                {/* <Button variant="contained" onClick={()=>{createDownloadData()}}>csv</Button> */}
                  <Box display={"flex"}
                  alignItems={"center"}>
                  <TextField 
                  size="small" 
                  placeholder={t('Search...')}
                  value={searchValue}
                  onChange={(e)=>{setSearchValue(e?.target?.value)}}
                  />
                    <Button
                      variant="text"
                      onClick={handleClickOpen}
                      style={{
                        color: "#3487E5",
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: "20px",
                      }}
                      pt={0.5}
                      sx={!appState?.roleinfo?.role?.includes('Recruiter')  ?{ display:'none'}:{display:'block'}}
                    >
                    {t('Add HouseHold')}
                    </Button>
                    
                  </Box>
                
                </Box>
              </Box>
            </Stack>
            </div>

            <Stack
              flexDirection={{ md: "row", sm: "column" }}
              justifyContent={"space-between"}
              display={"flex"}
              alignItems={"center"}
              // pt={2}
              p={1.5}
            >
              <Box sx={{ width: "100%" }}>
                <div dir={lang==='ar'?"rtl":''}>
                <TableContainer style={{maxHeight:'calc(100vh - 200px)'}}>
                  <Table
                    sx={{ minWidth: 750, }}
                    aria-labelledby="tableTitle"
                    // size={dense ? "small" : "medium"}
                    stickyHeader
                    size="small"
                    
                  >
                    <EnhancedTableHead
                      // numSelected={selected.length}
                      // onSelectAllClick={handleSelectAllClick}
                      // rowCount={data.length}
                    />
                    <TableBody>
                    {(data).map((row,index) => (
                          <TableRow
                            hover
                            // onClick={(event) => handleClick(event, row.householdId)}
                            role="checkbox"
                            // aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.householdId}
                            // selected={isItemSelected}
                            sx={{ cursor: "pointer",'&:hover':{'background':'red'}}}
                            style={
                              index % 2 !== 0 ? { backgroundColor: "#F1F4F4" } : {}
                            }
                          > 
                            
                            <TableCell
                              component="th"
                              // id={labelId}
                              scope="row"
                              // padding={'normal'}
                              style={{ border: "0",position: "sticky",
                              left: 0,
                              backgroundColor: index % 2 === 0 ? "white" : "#F1F4F4",
                            }}
                              align={lang==='ar'?"right":"left"}

                            >
                              <span
                              style={{fontSize:'0.9rem',fontWeight:'bold',color:'#5A6670'}}
                              >
                                {row.participants[0]?.firstName} &nbsp;
                              </span>
                              <span style={{fontSize:'0.9rem',fontWeight:'bold',color:'#5A6670'}}>{row.participants[0]?.familyName}</span>
                              <Typography fontSize={"0.85rem"} color={"#1D2420"}>
                                {row?.buildingName +", "+ row?.streetName + ", "+ row?.houseNumber + ", "+ row?.cityName}
                              </Typography>
                            </TableCell>
                            {/* <TableCell align={'center'} style={{border: "0"}}>
                              {row.participants[0]===null ? 0 : row.participants?.length}
                            </TableCell> */}
                            <TableCell align={'center'} style={{ border: "0" }}>
                              {row.familyCode}
                            </TableCell>
                            <TableCell align={'center'} style={{ border: "0" }}>
                              {row.householdId}
                            </TableCell>
                            <TableCell align={lang==='ar'?"right":"left"} style={{ border: "0" }}>
                              {row.phoneNumber}
                            </TableCell>
                            <TableCell align={lang==='ar'?"right":"left"} style={{ border: "0" ,whiteSpace:'nowrap'}} >
                              {moment(row.createdDate).format('DD-MM-YYYY')}
                            </TableCell>
                            <TableCell align={'center'} style={{ border: "0" }}>
                              {row?.status}
                            </TableCell>
                            <TableCell align={'center'} style={{ border: "0"}} >
                              {row?.participants.length}
                            </TableCell>
                            <TableCell align="left" style={{ border: "0" }}>
                              <IconButton onClick={(event) => handleViewClick(event, row.householdId)}>
                              <Tooltip title={t('View')}>
                                <Visibility color="primary"/>
                              </Tooltip>
                              </IconButton>
                            </TableCell>
                            <TableCell align="left" style={{ border: "0" }} sx={!appState?.roleinfo?.role?.includes('Recruiter') ||!appState?.roleinfo?.role?.includes('Recruiter') ?{ display:'none'}:{}}>
                              <IconButton onClick={(event) => handleClick(event, row.householdId)} disabled={row.householdSurveyAssignment?.length && row.householdId!==170883}>
                              {/* && row.householdId!==120338 && row.householdId!==130496 */}
                                <Tooltip title={t('Edit')}>
                                <Edit color={row.householdSurveyAssignment?.length ? "lightgrey":"secondary"} />
                                </Tooltip>
                              </IconButton>
                            </TableCell>
                            <TableCell align="left" style={{ border: "0" }} sx={!appState?.roleinfo?.role?.includes('Recruiter') ||!appState?.roleinfo?.role?.includes('Recruiter') ?{ display:'none'}:{}} >
                              <IconButton 
                              onClick={(event) => navigate(`/household/assignSurvey?id=${row.householdId}`)}
                              disabled={row.householdSurveyAssignment?.length === 3}
                              >
                                <Tooltip title={t('Assign')}>
                                <NoteAltIcon />
                                </Tooltip>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                      {!data?.length && (
                        <TableRow
                        >
                          <TableCell colSpan={10} align={'center'} style={{padding:'20px',fontWeight:'bold',fontSize:'1.1rem'}}>{t('No data found')}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                </div>
                <CacheProvider value={cacheRtl}>
                <ThemeProvider theme={lang === "ar" ? themeRtl : themeLtr}>
                  <div dir={lang==='ar'?"rtl":''}>
                <TablePagination
                  rowsPerPageOptions={[10,25,100]}
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
                  count={response?.totalCount || 10}
                  rowsPerPage={rowsPerPage}
                  labelRowsPerPage={t("Rows Per Page")}
                  labelDisplayedRows={({ from, to, count }) => (lang === "ar" ?`${to}-${from} من ${count}`:`${from}-${to} of ${count}`)}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </div>
                </ThemeProvider>
                </CacheProvider>
                {/* </Paper> */}
              </Box>
            </Stack>
          </Paper>
        </Box>
      </>
    );
  };

  export default Index;
