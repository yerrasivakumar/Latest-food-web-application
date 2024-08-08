import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem as MuiMenuItem,
  Select,
  TextField
} from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addQuestion,
  removeSection,
  setAdultStatus,
  setGenderStatus,
  setLabelNum,
  setOptionNum,
  setSectionAndQuestionNum,
  setSectionNumber,
  setSectionTitle
} from "../../../../store/slices/app.tsx";
import Question from "../createSection/Question.jsx";
import { useTranslation } from "react-i18next";
import DoneIcon from '@mui/icons-material/Done';
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import Modall from "../../../Modal/index.jsx";

const useStyles = makeStyles(() => ({
  input: {
    border: "1px solid #C1C1C1",
    borderRadius: "5px",
    outline: "none",
  },
  focused: {
    // background: "red"
    border: "none",
  },
}));

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1.5px solid #45AEAE`,
  "&:not(:last-child)": {
    // borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  marginBottom:'6px',
    '&.Mui-expanded':{
      '&.MuiAccordion-root':{marginBottom:'6px'}
    }
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon style={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "#45AEAE",
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    color: "#45AEAE",
  },
  "& .MuiAccordionSummary-content": {},
  '&:focus-within':{
    backgroundColor: "transparent"
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  // padding: theme.spacing(2,6,3,5),
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
}));


const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
const cacheLtr = createCache({
  key: 'mui-ltr',
  stylisPlugins: [prefixer],
});


const CommonAccordion = ({ memberIndex,errorIndex,...props }) => {
  const dispatch = useDispatch();
  const location = useLocation()

  const appState = useSelector((state) => state?.app);

  const handleRemove = (ind) => {
    dispatch(setSectionNumber(appState?.sectionNum-1))
    dispatch(removeSection(ind));
    toast(t('Section Removed Successfully'), {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      type:'success'
      });
  };
  const [questionType, setQuestionType] = useState('');
   const handleChange =(e) =>{
    // setQuestionType(e.target.value);
    if(e.target.value === 'dropDownMenu' || e.target.value === 'checkBoxGroup' || e.target.value === 'radiogroup'){
      dispatch(addQuestion({
        index:memberIndex,
        quest:{
            "id": "",
            "required": true,
            "inputType": e.target.value,
            "caption": "",
            "values": [{
              option:'',
              label:'',
              next:''
            }]
        }
    }))
    return;
    }
    
    dispatch(addQuestion({
        index:memberIndex,
        quest:{
            "id": "",
            "required": true,
            "inputType": e.target.value,
            "caption": "",
            "values": [{
              next:''
            }]
        }
    }))
   }
   const[edit,SetEdit] = useState(false)
   const handleSave = () =>{
    let showToast = true;
    let optionToast = true;
    let addToast = true
    appState?.survey?.survey?.sections[memberIndex]?.questions?.map((quest,index)=>{
      if(!appState?.survey?.survey?.sections[memberIndex]?.title && showToast){
        toast(`Please Enter section name`, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          pauseOnHover: true,
          draggable: true,
          type:'error'
        })
        showToast=false;
        return;
      }
      if(!quest?.caption?.length && showToast){
        toast(`Please Enter Question Number ${index+1}`, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          pauseOnHover: true,
          draggable: true,
          type:'error'
          });
        showToast = false;
        dispatch(setSectionAndQuestionNum({
          secNum:memberIndex,
          quesNum:index
        }))
        return;
      }
     else if(showToast && quest.inputType==='dropDownMenu' || quest.inputType==='radiogroup' || quest.inputType==='checkBoxGroup'){
          if(!quest?.values.length && addToast){
            toast(`Please Add Atleast One Option and Label for Question Number ${index+1}`, {
              position: "top-center",
              autoClose: 4000,
              hideProgressBar: false,
              pauseOnHover: true,
              draggable: true,
              type:'error'
              });
              addToast = false
              return;
          }
          quest.values?.map((vals,valIndex)=>{
            if(!vals?.label?.length && !vals?.option?.length && showToast){
              toast(`Please Enter Values for Option and Label for Question Number ${index+1}`, {
                position: "top-center",
                autoClose: 4000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
                type:'error'
                });
                dispatch(setOptionNum({
                  secNum:memberIndex,
                  quesNum:index,
                  OptNum:valIndex
                }))
                dispatch(setLabelNum({
                  secNum:memberIndex,
                  quesNum:index,
                  LabNum:valIndex
                }))
                showToast = false;
                return;
              }
              else if (!vals?.label?.length && vals?.option?.length && showToast){
                dispatch(setLabelNum({
                  secNum:memberIndex,
                  quesNum:index,
                  LabNum:valIndex
                }))
                showToast = false;
                return
              }
              else if (!vals?.option?.length && vals?.label?.length && showToast){
                dispatch(setOptionNum({
                  secNum:memberIndex,
                  quesNum:index,
                  OptNum:valIndex
                }))
                showToast = false;
                return
              }
          })
          return;
      }
      else{
        return
      }
      
    })
    if(showToast && optionToast && addToast){
      toast(`Section ${appState?.survey?.survey?.sections[memberIndex]?.title} Saved Successfully`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        type:'success'
        });
    }
    
   }
   const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      SetEdit(false)
    }
  };
  const handleChange1 = (e)=>{
    dispatch(setAdultStatus({
      secIndex:memberIndex,
      message:e.target.value
    }))
 }
 const handleChange2 = (e)=>{
  dispatch(setGenderStatus({
    secIndex:memberIndex,
    message:e.target.value
  }))
 }
  // useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  const lang = sessionStorage.getItem('lang')
  const { t } = useTranslation();
  const MenuItem = styled((props) => (
    <div dir={lang==='ar' ? "rtl":''}><MuiMenuItem {...props}/></div>
  ))(({ theme }) => ({}));



  const [open, setOpen] = React.useState(false);
  const [types, setType] = React.useState('');
  const [ind, setIndex] = React.useState('');
  const handleClose = () => setOpen(false);


  return (
    <div>
      <Modall open={open} type={types} ind={ind} handleClose={()=>{handleClose()}}/>
      <Accordion  {...props}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
          sx={{ marginTop: "-10px", marginBottom: "-10px" }}
        >
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"100%"}
            alignItems={"center"}
          >{edit ? <Box>
            <TextField size="small" value={appState?.survey?.survey?.sections[memberIndex]?.title} 
            // onKeyDown={handleKeyDown} 
            onChange={(e)=>{
            dispatch(setSectionTitle({
                index:memberIndex,
                message:e?.target?.value
            }));
            e.stopPropagation();
        }}
        onClick={(e)=>{ e.stopPropagation();}} 
        />
        <IconButton disabled={appState?.defaultSections?.includes(appState?.survey?.survey?.sections[memberIndex]?.title)} size="small" onClick={(e)=>{
            e.stopPropagation();
            SetEdit(!edit);
        }}>{!edit ? <EditIcon />:<DoneIcon/>}</IconButton>
        </Box> : <Typography fontWeight={"bold"}>
              {appState?.survey?.survey?.sections[memberIndex]?.title
                ? appState?.survey?.survey?.sections[memberIndex]?.title
                : `${t('Section')}`}
                <IconButton  onClick={(e)=>{
            e.stopPropagation();
            SetEdit(!edit);
        }}>{!edit ? <EditIcon />:<DoneIcon/>}</IconButton>
            </Typography>}
          </Box>
          <IconButton
            onClick={(e) => {
              setOpen(true)
              setType('Section')
              setIndex([memberIndex])
              // handleRemove(memberIndex);
              e.stopPropagation();
            }}
            size="small"
          >
            <DeleteIcon color="danger" />
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
        <CacheProvider value={lang==='ar'?cacheRtl:cacheLtr}>
         <Box style={{display:'flex',justifyContent:'flex-end',gap:'10px',flexWrap:'wrap'}}>
         <div dir={lang==='ar'?"rtl":''}>
         <FormControl size="small" >
  <InputLabel id="demo-simple-select-label">{t('Add Question Type')}</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    size="small"
    value={questionType}
    label={t('Add Question Type')}
    sx={{
        width:'14rem'
    }}
    onChange={handleChange}
  >
    <MenuItem value={'editText'}>{t('Edit Text')}</MenuItem>
    <MenuItem value={'dropDownMenu'}>{t('Drop Down Menu')}</MenuItem>
    <MenuItem value={'radiogroup'}>{t('Radio Group')}</MenuItem>
    <MenuItem value={'checkBoxGroup'}>{t('Check Box Group')}</MenuItem>
    <MenuItem value={'date'}>{t('Date Picker')}</MenuItem>
    <MenuItem value={'timePicker'}>{t('Time Picker')}</MenuItem>
  </Select>
</FormControl>
</div>
<div dir={lang==='ar'?"rtl":''}>
         <FormControl size="small" disabled={appState?.defaultSections?.includes(appState?.survey?.survey?.sections[memberIndex]?.title)} >
  <InputLabel id="demo-simple-select-label">{t('Select Age Status')}</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    size="small"
    value={appState.survey.survey.sections[memberIndex]?.conditions[0]?.adult_status}
    label={t('Select Age Status')}
    sx={{
        width:'14rem'
    }}
    onChange={handleChange1}
  >
    <MenuItem value={"1"}>{t('Adult')}</MenuItem>
    <MenuItem value={"2"}>{t('Child')}</MenuItem>
    <MenuItem value={"0"}>{t('All')}</MenuItem>
  </Select>
</FormControl>
</div>
         <div dir={lang==='ar'?"rtl":''}>
         <FormControl size="small" disabled={appState?.defaultSections?.includes(appState?.survey?.survey?.sections[memberIndex]?.title)} >
  <InputLabel id="demo-simple-select-label">{t('Select Gender Status')}</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    size="small"
    value={appState.survey.survey.sections[memberIndex]?.conditions[0]?.gender_status}
    label={t('Select Gender Status')}
    sx={{
        width:'14rem'
    }}
    onChange={handleChange2}
  >
    <MenuItem value={"1"}>{t('Male')}</MenuItem>
    <MenuItem value={"2"}>{t('Female')}</MenuItem>
    <MenuItem value={"0"}>{t('All')}</MenuItem>
  </Select>
</FormControl>
</div>
         </Box>
{appState?.survey?.survey?.sections?.[memberIndex]?.questions?.map((val,index)=>(
    <Question key={index} type={questionType} sectionIndex={memberIndex} questionIndex={index} error={true}/>
))}  
{appState?.survey?.survey?.sections?.[memberIndex]?.questions?.length ? <Box
              display={"flex"}
              justifyContent={{ md: "flex-end", xs: "center" }}
            >
            </Box>:""}
            </CacheProvider>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CommonAccordion;
