import {
  Box,
  Grid,
  Paper,
  Tab as MuiTab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete,
  InputLabel,
  DialogActions,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setApiErrorStatusCode, setLoading } from "../../store/slices/app.tsx";
import { styled, useTheme } from "@mui/styles";
import moment from "moment";
import { useTranslation } from "react-i18next";
import "jspdf-autotable";
import jsPDF from "jspdf";
import logo from "../../assets/atlas.png";
import foodlogo from "../../assets/abudhabi_food_logo.png";
import universitylogo from "../../assets/univercity_logo.png";
import * as XLSX from "xlsx";
import * as XlsxPopulate from "xlsx-populate/browser/xlsx-populate";
import { useFormik } from "formik";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box padding={{ xs: "0.8rem", lg: "1.5rem 1.2rem 1.2rem 1.2rem" }}>
          <Typography component={"div"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const Tab = styled(MuiTab)({
  fontWeight: "600",
});
const ReportView = () => {
  // document.title = 'Hii'
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const id = queryParams?.get("id");

  const appState = useSelector((state) => state.app);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data1, setData1] = useState([]);
  const [xlData, setXldata] = useState([]);
  const [response, setResponse] = useState({});
  const dispatch = useDispatch();
  const [sortedData, setSortedData] = useState([]);
  const [sortedData2, setSortedData2] = useState([]);
  const [demo, setDemo] = useState([]);
  const [edit, setEdit] = useState([]);
  const [quesssionnaire, setQuesssionnaire] = useState();
  const [gender, setGender] = useState();
  
  useEffect(() => {
    dispatch(setLoading(true));
    axios
      .get(
        `/api/household/getParticipantCompleteInformation/participant/${id}`,
        {
          headers: { authorization: `Bearer ${appState?.accessToken}` },
        }
      )
      .then((res) => {
        // console.log("sdfsdf",res?.data?.data)
        setGender(res?.data?.data?.genderId)
        setData1(res?.data?.data)
        //  console.log("sdfsdf",data1)
        dispatch(setLoading(false));
        setData(res?.data)
        setData2({
          ...res?.data?.data,
          questionnaireResponse: res?.data?.data?.questionnaireResponse?.map(
            (ques) => ({
              ...ques,
              response:ques?.response === null?null : Object.entries(JSON.parse(ques?.response)).map(
                ([question, answer]) => ({
                  question,
                  answer,
                })
              ),
              responseArabic: ques?.responseArabic === null?null :Object.entries(JSON.parse(ques?.responseArabic)).map(
                ([question, answer]) => ({
                  question,
                  answer,
                })
              ),
            })
          ),
        });
        setQuesssionnaire(res?.data?.data?.questionnaireResponse);

        setResponse(res?.data?.data);
        // console.log(res?.data?.data?.demographicResponse?.height?.toString());
        setDemo([
          {
            "First Name": res?.data?.data?.firstName,
            "Family Name": res?.data?.data?.familyName,
            "Participant Code": res?.data?.data?.participantCode,
            DOB: moment(res?.data?.data?.dob).format("DD-MM-YYYY"),
            Age: res?.data?.data?.demographicResponse?.age?.toString(),
            Gender: appState?.types?.genderTypes?.find(
              (gender) =>
                gender?.genderId ===
                res?.data?.data?.demographicResponse?.genderId
            )?.genderName,
            Height: res?.data?.data?.demographicResponse?.height?.toString(),
            Weight: res?.data?.data?.demographicResponse?.weight?.toString(),
            "Estimated Height": res?.data?.data?.demographicResponse?.estimatedHeight?.toString(),
            "UAE Citizen" : res?.data?.data?.demographicResponse?.isUAECitizen ? 'Yes' : 'No'
          },
          {
            Nationality: res?.data?.data?.demographicResponse?.nationality || res?.data?.data?.demographicResponse?.nationalityArabic,
            "Marital Status": appState?.types?.maritalStatusTypes?.find(
              (mart) =>
                mart?.maritalId ===
                res?.data?.data?.demographicResponse?.maritalStatusId
            )?.maritalName,
            Pregnant: res?.data?.data?.demographicResponse?.genderId === 1
                ? "NA"
                : res?.data?.data?.demographicResponse?.isPregnant
                ? "Yes"
                : "No",
              "Breast Feeding": res?.data?.data?.demographicResponse?.genderId === 1
                ? "NA"
                : res?.data?.data?.demographicResponse?.isLactating
                ? "Yes"
                : "No",
            "Academic Level": appState?.types?.academicLevelTypes?.find(
              (aca) =>
                aca?.academicLevelId ===
                res?.data?.data?.demographicResponse?.academicLevelId
            )?.academicLevelName,
            Occupation: appState?.types?.occupationTypes?.find(
              (occ) => occ?.occupationCode == res?.data?.data?.occupationId
            )?.occupationName,
            "Location": res?.data?.data?.demographicResponse?.location||res?.data?.data?.demographicResponse?.locationArabic,
            "Body Fat":res?.data?.data?.demographicResponse?.bodyFat?.toString(),
            "Estimated Weight": res?.data?.data?.demographicResponse?.estimatedWeight?.toString(),
          },
        ]);
      })
      .catch((err) => {
        dispatch(setLoading(false));
        dispatch(setApiErrorStatusCode(err?.response?.status));
      });
  }, []);


  // console.log(gender)

//   useEffect(() => {
//     if (data1?.questionnaireResponse?.length) {

//  const sort1 = data1?.foodIntakeResponse?.filter((vis) => vis.visitNumber === 1)
//         ?.slice()
//         .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);
     
//       const sort2 = data1?.foodIntakeResponse
//         ?.filter((vis) => vis.visitNumber === 2)
//         ?.slice()
//         .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);

//       setSortedData(
//         Object.values(
//           sort1.reduce((groups, food) => {
//             if (!groups[food.foodIntakeTypeId]) {
//               groups[food.foodIntakeTypeId] = [];
//             } 
//             groups[food.foodIntakeTypeId].push(food);
//             return groups;
//           }, {})
//         )
//       );
      
//       // const arr = {1:[{},{}],2:[{},]}

//       setSortedData2(
//         Object.values(
//           sort2.reduce((groups, food) => {
//             if (!groups[food.foodIntakeTypeId]) {
//               groups[food.foodIntakeTypeId] = [];
//             }
//             groups[food.foodIntakeTypeId].push(food);
//             return groups;
//           }, {})
//         )
//       );

//       const sortt = sort1.reduce((groups, food) => {
//         if (!groups[food.foodIntakeTypeId]) {
//           groups[food.foodIntakeTypeId] = [];
//         }
//         groups[food.foodIntakeTypeId].push(food);
//         return groups;
//       }, {});
//       setXLArray(
//         data1?.questionnaireResponse?.length > 1
//           ? [
//               ...data?.questionnaireResponse?.[0]?.response,
//               ...data?.questionnaireResponse?.[1]?.response,
//             ]
//           : [...data?.questionnaireResponse?.[0]?.response]
//       );
//     }
//   }, [data?.questionnaireResponse]);

useEffect(() => {
  if (data1?.questionnaireResponse?.length) {
  //  console.log('sssssss',data1?.foodIntakeResponse)
const sort = data1?.foodIntakeResponse?.filter((vis) => vis.visitNumber === 1)
      ?.slice()
      .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);
      // console.log('ssorrr',sort)
    const sort2 = data1?.foodIntakeResponse
      ?.filter((vis) => vis.visitNumber === 2)
      ?.slice()
      .sort((a, b) => a.foodIntakeTypeId - b.foodIntakeTypeId);



    setSortedData(
      Object.values(sort.reduce((groups, food) => {
      if (!groups[food.foodIntakeTypeId]) {
        groups[food.foodIntakeTypeId] = [];
      } 
      groups[food.foodIntakeTypeId].push(food);
      return groups;
    }, {})));
    

    
    // console.log('sortedData',sortedData)
    
    
    // const arr = {1:[{},{}],2:[{},]}

    setSortedData2(
      Object.values(
        sort2.reduce((groups, food) => {
          if (!groups[food.foodIntakeTypeId]) {
            groups[food.foodIntakeTypeId] = [];
          }
          groups[food.foodIntakeTypeId].push(food);
          return groups;
        }, {})
      )
    );

    const sortt = sort.reduce((groups, food) => {
      if (!groups[food.foodIntakeTypeId]) {
        groups[food.foodIntakeTypeId] = [];
      }
      groups[food.foodIntakeTypeId].push(food);
      return groups;
    }, {});
 console.log( "asdf", [
  ...(data2?.questionnaireResponse?.[0]?.response === null?data2?.questionnaireResponse?.[0]?.responseArabic:data2?.questionnaireResponse?.[0]?.response||[]),
  ...(data2?.questionnaireResponse?.[1]?.response=== null?data2?.questionnaireResponse?.[1]?.responseArabic:data2?.questionnaireResponse?.[1]?.response||[]),
 
 

 
])
    setXldata(
      data2?.questionnaireResponse?.length > 1
        ? [
            ...(data2?.questionnaireResponse?.[0]?.response === null?data2?.questionnaireResponse?.[0]?.responseArabic:data2?.questionnaireResponse?.[0]?.response||[]),
            ...(data2?.questionnaireResponse?.[1]?.response=== null?data2?.questionnaireResponse?.[1]?.responseArabic:data2?.questionnaireResponse?.[1]?.response||[]),
           
           
         

           
          ]
        : [  ...(data2?.questionnaireResponse?.[0]?.response=== null?data2?.questionnaireResponse?.[0]?.responseArabic:data2?.questionnaireResponse?.[0]?.response||[]),
      ]
      
    );
   
    
  }
}, [data2?.questionnaireResponse, data1?.foodIntakeResponse]);
  
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const theme = useTheme();

  const downLg = useMediaQuery(theme.breakpoints.down("md"));

  const { t } = useTranslation();

  const lang = sessionStorage.getItem("lang");
  const calculateAverage = (nutrientId) => {
    const visit1Value =
    data1?.nutrientValueResponse?.find(
        (nutr) =>  nutr.visitNumber === 1 &&
        (nutr.nutrientId === nutrientId)
      )?.nutrientValue ||0;
      // console.log("v1",visit1Value)
    // const visit2Value =
    //   data1?.nutrientValueResponse?.find(
    //     (nutr) =>   nutr.visitNumber === 2 &&
    //     (nutr.nutrientName === nutrientName || nutr.nutrientNameArabic === nutrientName)
    //   )?.nutrientValue || 0;

    const visit2Value =
    data1?.nutrientValueResponse?.find(
        (nutr) =>  nutr?.visitNumber === 2 &&
        (nutr?.nutrientId === nutrientId )
      )?.nutrientValue ||0;

// console.log('visite2',visit2Value);
      //console.log('average',visit1Value,visit2Value);
    const average =
      (visit1Value + visit2Value) /
      (data1?.nutrientValueResponse?.filter((n) => n.visitNumber === 2)?.length
        ? 2
        : 1);
    return average.toFixed(2);
  };

  const a = data1?.nutrientIndexResponse?.[0]?.bmiValue;
  const b = data1?.nutrientIndexResponse?.[1]?.bmiValue;
  const Bmiaverage = ((a + b) / 2).toFixed(2);

  const c = data1?.nutrientIndexResponse?.[0]?.eerValue;
  const d = data1?.nutrientIndexResponse?.[1]?.eerValue;

  const EEraverage = ((c + d) / 2).toFixed(2);
  let totalPages = null;

  const handleClick = () => {
    const pdf = new jsPDF("landscape");
    
    pdf.autoTable({
      startY: 85,
      margin: {
        right: 2,
        top: 85,
        left: 8.5,
      },
      didDrawPage: function (datas) {
        

        pdf.setFontSize(15);
        pdf.text(`Participant Report`, 150, 20, null, null, "center");
        pdf.setLineWidth(0.3);
        pdf.line(125, 23, 175, 23);
        
        pdf.setLineWidth(0.3);
        pdf.rect(10, 38, 278, 130);
        pdf.setFontSize(14);
        pdf.text(`Demographics`, 150, 45, null, null, "center");

        Object.keys(demo[0])?.map((dem, index) => {
          pdf.setFontSize(12);
          pdf.text(`${dem} :`, 40, 65 + index * 10);
        });
        Object.keys(demo[1])?.map((dem, index) => {
          pdf.setFontSize(12);
          pdf.text(`${dem} :`, 160, 65 + index * 10);
        });
        Object.values(demo[0])?.map((dem, index) => {
          pdf.setFontSize(12);
          pdf.text(dem ? dem : "", 90, 65 + index * 10);
        });
        Object.values(demo[1])?.map((dem, index) => {
          pdf.setFontSize(12);
          pdf.text(dem ? dem : "", 220, 65 + index * 10);
        });
        pdf.addPage();
        pdf.setFontSize(14);

        //survey response
        pdf.text(`Survey Response`, 150, 20, null, null, "center");
        pdf.setLineWidth(0.3);
        pdf.line(130, 23, 170, 23);
        const pageWidth = 297; // Assuming page width is 297mm (A4 size landscape)
        const pageHeight = 210; // Assuming page height is 210mm (A4 size landscape)
        let y = 25; // Initial y position
        if (data1 && data1.questionnaireResponse) {
          data1.questionnaireResponse.forEach((ress, i) => {
              if (i >= 1) {
                  pdf.addPage();
              }
       
          pdf.setFontSize(13);
          pdf.text(`Visit Number ${i + 1}`, 150, 30, null, null, "center");
 const qdata1response = ress?.response ? JSON.parse(ress.response) : {};
          const qdata2response = ress?.responseArabic ? JSON.parse(ress.responseArabic) : {};
          const lang = ress?.language || 'en';
          const response = lang === 'en' ? qdata1response : qdata2response;
          const PDFDate = [
            { label: "S.No", key: "3" },
            { label: "Question", key: "1" },
            { label: "Answer", key: "2" },
          ];
         

          const columns = PDFDate.map((fields) => fields.label);
          const rows = Object.entries(response).map(
            ([question, answer], index) => [index + 1, question, answer]
        );
          pdf.autoTable(columns, rows, {
            // startY: 85,
            margin: {
              right: 10,
              top: 35,
              left: 10,
            },
            columnStyles: {
              0: { cellWidth: 20, halign: "center" },
              1: { cellWidth: 128.5 },
              2: { cellWidth: 128.5 },
              
            },
            theme: "grid",
            styles: {
              font: "times",
              overflow: "linebreak",
              align: "left",
              cellPadding: 2,
              lineWidth: 0.2,
              fontSize: 12,
              lineColor: [0, 0, 0],
              textColor: [0, 0, 0],
            },
            headStyles: {
              textColor: [0, 0, 0],
              fontStyle: "bold",
              halign: "center",
              lineWidth: 0.2,
              fontSize: 14,
              lineColor: [0, 0, 0],
              fillColor: [222, 222, 222],
            },
            alternateRowStyles: {
              fillColor: [232, 232, 232],
              textColor: [0, 0, 0],
              lineWidth: 0.2,
              fontSize: 12,
              lineColor: [0, 0, 0],
            },

            tableLineColor: [0, 0, 0],
          });
        });
      }
       
        //food intake response
        pdf.addPage();
        let currentPage = 1;
        let yy = 40; // Initial y position
        const bottomMargin = 20; // Margin at the bottom of the page
        const lineHeight = 30;
        pdf.setFontSize(14);
        pdf.setLineWidth(0.3);
        // pdf.line(125, 23, 175, 23); // Height of each line of text
        pdf.text(`Food Intake Response`, 150, 20, null, null, "center");
        pdf.text(`Visit Number 1`, 150, 30, null, null, "center");
      
        Object.values(sortedData).forEach((group, index) => {
          if (yy >= 170) {
            pdf.addPage();
            yy = 30;
          }
          pdf.setFontSize(14);
          pdf.text(
            `${group[0]?.foodIntakeType}`,
            150,
            yy,
            null,
            null,
            "center"
          );
          // console.log(group)
          const PDFDate = [
            { label: "S.No", key: "00" },
            { label: "Food Name", key: "0" },
            { label: "Food Id", key: "1" },
            { label: "Quantity", key: "2" },
            { label: "Location", key: "3" },
            { label: "Activities", key: "4" },
            { label: "Consumption Time", key: "5" },
          ];

          const columns = PDFDate.map((fields) => fields.label);
          const preferredLanguage = group?.language;
          //console.log('test',group[0]?.language)
          const rows = group?.map(
            (
              
              {
                foodName, foodNameArabic,
                foodId,
                quantity,
                measurement, measurementArabic,
      location, locationArabic,
      activities, activitiesArabic,
                consumptionTime,
              },
              index
            ) => [
              index + 1,
              preferredLanguage === 'en' ? foodName : foodNameArabic,
              foodId,
              quantity + (preferredLanguage === 'en' ? measurement : measurementArabic),
    preferredLanguage === 'en' ? location : locationArabic,
    preferredLanguage === 'en' ? activities : activitiesArabic,
              foodName === "Water"
                ? "All Day"
                : moment(consumptionTime).format("DD-MM-YYYY hh:mm A"),
            ]
          );
          pdf.autoTable(columns, rows, {
            startY: yy + 5,
            startX: 10,
            margin: {
              right: 10,
              left: 10,
            },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 52.8 },
              2: { cellWidth: 32.8 },
              3: { cellWidth: 32.8 },
              4: { cellWidth: 42.8 },
              5: { cellWidth: 42.8 },
              6: { cellWidth: 52.8 },
            },
            theme: "grid",
            styles: {
              font: "times",
              overflow: "linebreak",
              align: "left",
              cellPadding: 2,
              lineWidth: 0.2,
              fontSize: 12,
              lineColor: [0, 0, 0],
              textColor: [0, 0, 0],
            },
            headStyles: {
              textColor: [0, 0, 0],
              fontStyle: "bold",
              halign: "center",
              lineWidth: 0.2,
              fontSize: 14,
              lineColor: [0, 0, 0],
              fillColor: [222, 222, 222],
            },
            alternateRowStyles: {
              fillColor: [232, 232, 232],
              textColor: [0, 0, 0],
              lineWidth: 0.2,
              fontSize: 12,
              lineColor: [0, 0, 0],
            },
            didDrawPage: (d) => (yy = d.cursor.y + 7),

            tableLineColor: [0, 0, 0],
          });

         
          console.log(yy);
        });

        if (Object.values(sortedData2)?.length) {
          pdf.addPage();

          let yy = 40; // Initial y position

          pdf.setFontSize(14); // Height of each line of text
          pdf.text(`Food Intake Response`, 150, 20, null, null, "center");
          pdf.text(`Visit Number 2`, 150, 30, null, null, "center");
          Object.values(sortedData2).forEach((group, index) => {
            if (yy >= 170) {
              pdf.addPage();
              yy = 30;
            }
            pdf.setFontSize(14);
            pdf.text(
              `${group[0]?.foodIntakeType}`,
              150,
              yy,
              null,
              null,
              "center"
            );
            // console.log(group)
            const PDFDate = [
              { label: "S.No", key: "00" },
              { label: "Food Name", key: "0" },
              { label: "Food Id", key: "1" },
              { label: "Quantity", key: "2" },
              { label: "Location", key: "3" },
              { label: "Activities", key: "4" },
              { label: "Consumption Time", key: "5" },
            ];

            const columns = PDFDate.map((fields) => fields.label);
            const preferredLanguage = group?.language;
            const rows = group?.map(
              (
                {
                  foodName, foodNameArabic,
                  foodId,
                  quantity,
                  measurement, measurementArabic,
      location, locationArabic,
      activities, activitiesArabic,
                  consumptionTime,
                },
                index
              ) => [
                index + 1,
                preferredLanguage === 'en' ? foodName : foodNameArabic,
                foodId,
                quantity + (preferredLanguage === 'en' ? measurement : measurementArabic),
    preferredLanguage === 'en' ? location : locationArabic,
    preferredLanguage === 'en' ? activities : activitiesArabic,
                foodName === "Water"
                  ? "All Day"
                  : moment(consumptionTime).format("DD-MM-YYYY hh:mm A"),
              ]
            );
            pdf.autoTable(columns, rows, {
              startY: yy + 5,
              startX: 10,
              margin: {
                right: 10,
                left: 10,
              },
              columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 52.8 },
                2: { cellWidth: 32.8 },
                3: { cellWidth: 32.8 },
                4: { cellWidth: 42.8 },
                5: { cellWidth: 42.8 },
                6: { cellWidth: 52.8 },
               
              },
              theme: "grid",
              styles: {
                font: "times",
                overflow: "linebreak",
                align: "left",
                cellPadding: 2,
                lineWidth: 0.2,
                fontSize: 12,
                lineColor: [0, 0, 0],
                textColor: [0, 0, 0],
              },
              headStyles: {
                textColor: [0, 0, 0],
                fontStyle: "bold",
                halign: "center",
                lineWidth: 0.2,
                fontSize: 14,
                lineColor: [0, 0, 0],
                fillColor: [222, 222, 222],
              },
              alternateRowStyles: {
                fillColor: [232, 232, 232],
                textColor: [0, 0, 0],
                lineWidth: 0.2,
                fontSize: 12,
                lineColor: [0, 0, 0],
              },
              didDrawPage: (d) => (yy = d.cursor.y + 7),

              tableLineColor: [0, 0, 0],
            });

            
            // yy=yy+group?.length*15
            console.log(yy);
          });
          
        }

        //nutrient response
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setLineWidth(0.3);
        pdf.line(128, 23, 172, 23);
        pdf.text(`Nutrient Response`, 150, 20, null, null, "center");

        pdf.setFontSize(14);
        pdf.text("Visit Number 1", 40, 30);
        pdf.setFontSize(12);
        pdf.text(
          `BMI Value : ${data1?.nutrientIndexResponse?.[0]?.bmiValue}`,
          40,
          40
        );
        pdf.setFontSize(12);
        pdf.text(
          `EER Value : ${data1?.nutrientIndexResponse?.[0]?.eerValue}`,
          40,
          50
        );

        if (
          data1?.nutrientValueResponse?.filter((nutr) => nutr.visitNumber == 2)
            ?.length
        ) {
          pdf.setFontSize(14);
          pdf.text("Visit Number 2", 120, 30);
          pdf.setFontSize(12);
          pdf.text(
            `BMI Value : ${data1?.nutrientIndexResponse?.[1]?.bmiValue}`,
            120,
            40
          );
          pdf.setFontSize(12);
          pdf.text(
            `EER Value : ${data1?.nutrientIndexResponse?.[1]?.eerValue}`,
            120,
            50
          );

          pdf.setFontSize(14);
          pdf.text("Average", 200, 30);
          pdf.setFontSize(12);
          pdf.text(`BMI Value : ${Bmiaverage}`, 200, 40);
          pdf.setFontSize(12);
          pdf.text(`EER Value : ${EEraverage}`, 200, 50);
        }
        const PDFDate = [
          { label: "S.No", key: "3" },
          { label: "Nutrient Name", key: "3" },
          { label: "Visit 1", key: "1" },
          { label: "Visit 2", key: "2" },
          { label: "Average", key: "2" },
        ];

        const columns = PDFDate.map((fields) => fields.label);
        const rows = data1?.nutrientValueResponse
          ?.map(({ visitNumber, nutrientName,nutrientNameArabic, nutrientValue }, index) => [
            index + 1,
            visitNumber === 1 ? nutrientName||nutrientNameArabic: null,
            data1?.nutrientValueResponse?.filter((nn) => nn.visitNumber === 1)[
              index
            ]?.nutrientValue,
            data1?.nutrientValueResponse?.filter((nn) => nn.visitNumber === 2)[
              index
            ]?.nutrientValue,
            visitNumber === 1 ? calculateAverage(nutrientName) : null,
          ])
          .slice(
            0,
            data1?.nutrientValueResponse?.filter((nn) => nn.visitNumber === 1)
              ?.length
          );

        pdf.autoTable(columns, rows, {
          startY: 55,
          margin: {
            right: 10,
            top: 30,
            left: 10,
          },
          columnStyles: {
            0: { cellWidth: 20, halign: "center" },
            1: { cellWidth: 64.25 },
            2: { cellWidth: 64.25, halign: "center" },
            3: { cellWidth: 64.25, halign: "center" },
            4: { cellWidth: 64.25, halign: "center" },
           
          },
          theme: "grid",
          styles: {
            font: "times",
            overflow: "linebreak",
            align: "left",
            cellPadding: 2,
            lineWidth: 0.2,
            fontSize: 12,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
          },
          headStyles: {
            textColor: [0, 0, 0],
            fontStyle: "bold",
            lineWidth: 0.2,
            fontSize: 14,
            halign: "center",
            lineColor: [0, 0, 0],
            fillColor: [222, 222, 222],
          },
          alternateRowStyles: {
            fillColor: [232, 232, 232],
            textColor: [0, 0, 0],
            lineWidth: 0.2,
            fontSize: 12,
            lineColor: [0, 0, 0],
          },

          tableLineColor: [0, 0, 0],
        });

     


        const totalPages = pdf.internal.getNumberOfPages(); // Get total number of pages

        // Add page number to every page
        for (var i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.addImage(foodlogo, "PNG", 10, 3, 85, 15);
          pdf.setLineWidth(0.3);
          pdf.line(10, 210 - 10, 297 - 10, 210 - 10);
          pdf.addImage(universitylogo, "PNG", 203, 3, 85, 15);
          pdf.setFontSize(10);
          pdf.text(
            "Page " + i + " of " + totalPages,
            150,
            210 - 5,
            null,
            null,
            "center"
          );
          pdf.text(moment()?.format("DD-MM-YYYY hh:mm:ss A"), 250, 210 - 5);
          pdf.saveGraphicsState();
          pdf.setGState(new pdf.GState({ opacity: 0.25 }));
          pdf.addImage(logo, "PNG", 123, 80, 47, 45, null, null, "center");
          pdf.restoreGraphicsState();
        }

      },

      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 30 },
        8: { cellWidth: 30 },
      },
      theme: "grid",
      styles: {
        font: "times",
        overflow: "linebreak",
        align: "left",
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        textColor: [0, 0, 0],
        fontStyle: "normal",
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        fillColor: [244, 182, 47],
      },
      alternateRowStyles: {
        fillColor: [222, 222, 222],
        textColor: [0, 0, 0],
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },

      tableLineColor: [0, 0, 0],
    });
    pdf.save(data1?.participantCode || "Participant");
  };

  ///Excel Report creation code
  function getColumnLetter(index) {
    let columnName = '';
    while (index > 0) {
        const remainder = (index - 1) % 26;
        columnName = String.fromCharCode(65 + remainder) + columnName;
        index = Math.floor((index - 1) / 26);
    }
    return columnName;
}
  const addStyles = (workbookBlob, dataInfo) => {
    return XlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
        workbook.sheets().forEach((sheet) => {
            sheet.range(`A1:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+2+29)}10`).style({
                // shrinkToFit: true,
                // wrapText: true,
                fontFamily: 'Aptos Narrow',
                horizontalAlignment: 'center',
                border:true
            });

            sheet.range(`A2:A4`).merged(true);
            sheet.range(`B2:B4`).merged(true);
            sheet.range(`C2:C4`).merged(true);
            sheet.range(`A2:EZ4`).style({
                bold: true
            });

            // Dynamically generate column names (A, B, C, etc.)
            new Array(81).fill(1).map((_, i) => {
              const cell = getColumnLetter(i + 1)
              // console.log(cell)
              sheet.range(`${cell}5:${cell}10`).merged(true)
            });
            
              sheet.range(`V2:BH2`).merged(true)
              sheet.range(`V3:AC3`).merged(true)
              sheet.range(`AD3:AE3`).merged(true)
              sheet.range(`AG3:AL3`).merged(true)
              sheet.range(`AM3:AO3`).merged(true)
              sheet.range(`AQ3:AS3`).merged(true)
              sheet.range(`AT3:BH3`).merged(true)

              sheet.range('BI2:CB2').merged(true)
              sheet.range('BI3:BV3').merged(true)
              sheet.range('BW3:BY3').merged(true)
              sheet.range('BZ3:CB3').merged(true)

            sheet.row(4).height(50);
            sheet.range('D2:U3').merged(true)
            sheet.cell('V2').value('Survey Questionnaire (Visit 1)')
            sheet.cell('V3').value('General')
            sheet.cell('AD3').value('Supplements')
            sheet.cell('AF3').value('Self perceived health')
            sheet.cell('AG3').value('Physical activity - adult')
            sheet.cell('AM3').value('Physical activity - child')
            sheet.cell('AP3').value('Smoking status')
            sheet.cell('AQ3').value('Drinking water')
            sheet.cell('AT3').value('Food Safety')


            sheet.cell('BI2').value('Consumer behavior Questionnaire (Visit 2)')
            sheet.cell('BI3').value('Food shopping/purchasing, attitude, and behaviour')
            sheet.cell('BW3').value('Smartphone usage time and purpose')
            sheet.cell('BZ3').value('Social media usage time and purpose')



            sheet.cell('CD5').value('Name')
            sheet.cell('CD6').value('Quantity')
            sheet.cell('CD7').value('Measurment')
            sheet.cell('CD8').value('Location')
            sheet.cell('CD9').value('Activity')
            sheet.cell('CD10').value('Consumption Time')
            sheet.range('CD5:CD10').style({
              bold:true
            })

            sheet.range('A5:CC5').style({
              verticalAlignment:'center',
              wrapText:true,
              shrinkToFit:true
            })
            sheet.cell('CC5').style({
              bold:true
            })
            sheet.cell('CC2').value('Food Intake (Visit 1)')
            sheet.range(`CC2:${getColumnLetter(82+sortedData?.flat().length)}2`).merged(true)
            // console.log(getColumnLetter(82+sortedData?.flat().length+1))
            sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+1)}2`).value('Food Intake (Visit 2)')
            sheet.range(`${getColumnLetter(82+sortedData?.flat().length+1)}2:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length)}2`).merged(true)
            let col = 83
            let ind = 83
            sortedData?.map((gr,index)=>{
              sheet.range(`${getColumnLetter(col)}3:${getColumnLetter(col + gr.length-1)}3`).merged(true)
              sheet.cell(`${getColumnLetter(col)}3`).value(gr[0]?.foodIntakeType)

              gr.map((row,i)=>{
                sheet.cell(`${getColumnLetter(ind)}4`).value(i+1)
                sheet.cell(`${getColumnLetter(ind)}5`).value(row?.foodName ||row?.foodNameArabic)
                sheet.cell(`${getColumnLetter(ind)}6`).value(row?.quantity)
                sheet.cell(`${getColumnLetter(ind)}7`).value(row?.measurement ||row?.measurementArabic)
                sheet.cell(`${getColumnLetter(ind)}8`).value(row?.location||row?.locationArabic)
                sheet.cell(`${getColumnLetter(ind)}9`).value(row?.activities ||row?.activitiesArabic)
                sheet.cell(`${getColumnLetter(ind)}10`).value(row?.consumptionTime)
                ind++
              })

              col +=gr.length
          })
          let col2 = 82+sortedData?.flat().length+1
          let ind2 = 82+sortedData?.flat().length+1
            sortedData2?.map((gr,index)=>{
              sheet.range(`${getColumnLetter(col2)}3:${getColumnLetter(col2 + gr.length-1)}3`).merged(true)
              sheet.cell(`${getColumnLetter(col2)}3`).value(gr[0]?.foodIntakeType)
              gr.map((row,i)=>{
                sheet.cell(`${getColumnLetter(ind2)}4`).value(i+1)
                sheet.cell(`${getColumnLetter(ind2)}5`).value(row?.foodName ||row?.foodNameArabic)
                sheet.cell(`${getColumnLetter(ind2)}6`).value(row?.quantity)
                sheet.cell(`${getColumnLetter(ind2)}7`).value(row?.measurement ||row?.measurementArabic)
                sheet.cell(`${getColumnLetter(ind2)}8`).value(row?.location ||row?.locationArabic)
                sheet.cell(`${getColumnLetter(ind2)}9`).value(row?.activities ||row?.activitiesArabic)
                sheet.cell(`${getColumnLetter(ind2)}10`).value(row?.consumptionTime)
                ind2++
              })
              col2 +=gr.length
          })

          sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}4`).value('Nutrients')
          sheet.range(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}5:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}10`).style({
            bold:true
          })
          new Array(31).fill(1).map((_,i)=>{
            sheet.range(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}5:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}6`).merged(true)
            sheet.range(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}7:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}8`).merged(true)
            sheet.range(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}9:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1+i)}10`).merged(true)
          })
          
          sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}5`).value('Visit 1')
          
          sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}7`).value('Visit 2')
          
          sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+1)}9`).value('Average')



          sheet.range(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+2)}2:${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+2+29)}3`).merged(true)



          sheet.cell(`${getColumnLetter(82+sortedData?.flat().length+sortedData2?.flat().length+2)}2`).value('Nutrients')

          let nutrIndex = 82+sortedData?.flat().length+sortedData2?.flat().length+2
          let AvgIndex = 82+sortedData?.flat().length+sortedData2?.flat().length+2
          data1?.nutrientValueResponse?.filter((nutr)=>nutr.visitNumber===1)?.map((nutrr)=>{
            sheet.cell(`${getColumnLetter(nutrIndex)}4`).value(nutrr.nutrientName)
            sheet.cell(`${getColumnLetter(nutrIndex)}5`).value(nutrr.nutrientValue)
            nutrIndex++
          })
          data1?.nutrientValueResponse?.filter((nutr)=>nutr.visitNumber===2)?.map((nutrr)=>{
            sheet.cell(`${getColumnLetter(AvgIndex)}7`).value(nutrr.nutrientValue)
            sheet.cell(`${getColumnLetter(AvgIndex)}9`).value(calculateAverage(nutrr.nutrientId))
            AvgIndex++
          })
        });
        return workbook.outputAsync().then((workbookBlob) => URL.createObjectURL(workbookBlob));
    });
};


  //backup for  exporting to excel in the future if needed
  // const addStyles = (workbookBlob, dataInfo) => {
  //   return XlsxPopulate.fromDataAsync(workbookBlob).then((workbook) => {
  //     workbook.sheets().forEach((sheet) => {
  //       sheet.column("A").width(10);
  //       sheet.column("B").width(15);
  //       sheet.column("C").width(15);
  //       sheet.column("D").width(15);
  //       sheet.column("E").width(15);
  //       sheet.column("F").width(15);
  //       sheet.column("G").width(15);
  //       sheet.column("H").width(15);
  //       sheet.column("I").width(15);
  //       sheet.column("J").width(15);

  //       sheet.cell(dataInfo.titleCell).style({
  //         bold: true,
  //       });
  //       sheet.range(dataInfo.visitNum).style({
  //         horizontalAlignment: "center",
  //       });
  //       // sheet.range(dataInfo.serialNum).style({
  //       //   horizontalAlignment:'center'
  //       // })
  //       sheet.cell(dataInfo.timeStamp).style({
  //         bold: true,
  //       });
  //       sheet.column("A").width(60).hidden(false);
  //       sheet.cell(dataInfo.demographicsTitle).style({
  //         bold: true,
  //       });
  //       // sheet.range(dataInfo.tableHeader).style({
  //       //   bold: true,
  //       // });
  //       new Array(98).fill(0)?.forEach((a, index) => {
  //         sheet
  //           .range(`B${index + 4}:G${index + 4}`)
  //           .merged(true)
  //           .style({
  //             horizontalAlignment: "center",
  //             wrapText: true,
  //             shrinkToFit: true,
  //             verticalAlignment: "center",
  //           });
  //       });

  //       sheet.range(`A4:A100`).style({
  //         wrapText: true,
  //         shrinkToFit: true,
  //         verticalAlignment: "center",
  //       });

  //       const visit2Box =
  //         Object.values(sortedData)
  //           .map((groups, index) =>
  //             groups.map((group) => ({
  //               A: groups[0].foodIntakeType,
  //               B: group.foodName,
  //               C: group.quantity,
  //               D: group.measurement,
  //               E: group.location,
  //               F: group.activities,
  //               G: group.consumptionTime,
  //             }))
  //           )
  //           .flat()?.length + 104;

  //       const visit2End =
  //         visit2Box +
  //         Object.values(sortedData2)
  //           .map((groups, index) =>
  //             groups.map((group) => ({
  //               A: groups[0].foodIntakeType,
  //               B: group.foodName,
  //               C: group.quantity,
  //               D: group.measurement,
  //               E: group.location,
  //               F: group.activities,
  //               G: group.consumptionTime,
  //             }))
  //           )
  //           .flat()?.length +
  //         3;

  //       sheet.range(`A4:G${visit2End + 29}`).style({
  //         border: true,
  //       });

  //       sheet.range("A28:A29").style({
  //         bold: true,
  //       });
  //       sheet.cell("A38").style({
  //         bold: true,
  //       });
  //       sheet.cell("A41").style({
  //         bold: true,
  //       });
  //       sheet.cell("A43").style({
  //         bold: true,
  //       });
  //       sheet.cell("A50").style({
  //         bold: true,
  //       });
  //       sheet.cell("A54").style({
  //         bold: true,
  //       });
  //       sheet.cell("A56").style({
  //         bold: true,
  //       });
  //       sheet.cell("A60").style({
  //         bold: true,
  //       });
  //       sheet.cell("A77").style({
  //         bold: true,
  //       });
  //       sheet.cell("A93").style({
  //         bold: true,
  //       });
  //       sheet.cell("A97").style({
  //         bold: true,
  //       });
  //       sheet.cell("B1").style({
  //         bold: true,
  //       });
  //       sheet.cell("C2").style({
  //         bold: true,
  //       });
  //       sheet.range(`B${visit2Box}:G${visit2Box}`).merged(true).style({
  //         horizontalAlignment: "center",
  //         wrapText: true,
  //         shrinkToFit: true,
  //         bold: true,
  //       });
  //       sheet.range(`A${visit2Box + 1}:G${visit2Box + 1}`).style({
  //         bold: true,
  //       });

  //       sheet.range(`A101:B101`).style({
  //         bold: true,
  //       });
  //       sheet.range(`B102:G102`).style({
  //         bold: true,
  //       });
  //       sheet.range(`A${visit2End}:F${visit2End}`).style({
  //         bold: true,
  //       });

  //       new Array(30)?.fill(1)?.forEach(
  //         (i, index) => (
  //           sheet
  //             .range(`B${visit2End + index}:C${visit2End + index}`)
  //             .merged(true)
  //             .style({
  //               horizontalAlignment: "center",
  //             }),
  //           sheet
  //             .range(`D${visit2End + index}:E${visit2End + index}`)
  //             .merged(true)
  //             .style({
  //               horizontalAlignment: "center",
  //             }),
  //           sheet
  //             .range(`F${visit2End + index}:G${visit2End + index}`)
  //             .merged(true)
  //             .style({
  //               horizontalAlignment: "center",
  //             })
  //         )
  //       );

        
  //     });
  //     return workbook
  //       .outputAsync()
  //       .then((workbookBlob) => URL.createObjectURL(workbookBlob));
  //   });
  // };

  // #2
  const s2ab = useCallback((s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i);
    }

    return buf;
  }, []);
  const workbook2blob = useCallback(
    (workbook) => {
      const wopts = {
        bookType: "xlsx",
        type: "binary",
      };
      const wbout = XLSX.write(workbook, wopts);

      const blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream",
      });
      return blob;
    },
    [s2ab]
  );

  const findAnswer = (question) => {
    return xlData.find((item) => item?.question === question)?.answer || 'NA';
  };

 console.log(data2?.questionnaireResponse?.[0]?.language)


  const handleExport = async () => {
    const TimeStampp = [
      {
        A: "",
        B: "",
        C: "",
        D: "",
        E: "",
        F: ` Timestamp : ${moment(new Date()).format("hh:mm:ss A")}`,
      },
    ];

    let HorizontalTable = [
      {
        A:'Participant Code',
        B:'Family Code',
        C:'Survey  Date and Time',
        D:'Demographics'
      },
      {
        A:'',
        B:'',
        C:'',
        D:'',
      },
      {
        A:'',
        B:'',
        C:'',
        D:'First Name',
        E:'Family Name',
        F:'Emirate',
        G:'City / Area',
        H:'Household Income per Month',
        I:'Date of Birth',
        J:'Age',
        K:'Gender',
        L:'Pregnant?',
        M:'BreastFeeding?',
        N:'Weight (Kgs) - Estimated',
        O:'Height (Cm)-Estimated',
        P:'Weight (Kgs) - Measured',
        Q:'Height (Cm)-Measured',
        R:'Body Fat (%)',
        S:'Marital Status',
        T:'Current Situation',
        U:'Level of Education',

    
        
          V:  data2?.questionnaireResponse?.[0]?.language === "en"|| data2?.questionnaireResponse?.[0]?.language === null?"Are you currently following a special diet?":"هل تتبعين حالياً نظاماً غذائياً خاصاً؟",
         
          W:  data2?.questionnaireResponse?.[0]?.language === "en"?"Vegetarian (Diet)":"حمية نباتية)",
         
          X: data2?.questionnaireResponse?.[0]?.language === "en"?"Therapeutic (Diet)":"علاجي (نظام غذائي)",
         
          Y: data2?.questionnaireResponse?.[0]?.language === "en"?"Weight management (Diet)":"علاجي (نظام غذائي)",
         
  Z:data2?.questionnaireResponse?.[0]?.language === "en"? "Allergy-free (Diet)":"خالي من الحساسية (نظام غذائي)",
         
          AA: data2?.questionnaireResponse?.[0]?.language === "en"?"Sport (Diet)":"رياضة (نظام غذائي)",
         
          AB: data2?.questionnaireResponse?.[0]?.language === "en"?"Do you suffer from any food allergies or intolerances?":"هل تعاني من أي حساسية أو عدم تحمل الطعام؟",
         
        
          AC: data2?.questionnaireResponse?.[0]?.language === "en"?"Please provide the list of allergies or intolerances suffered":"يرجى تقديم قائمة بالحساسية أو عدم التحمل الذي تعاني منه",
          
         
          AD: data2?.questionnaireResponse?.[0]?.language === "en"?"Do you regularly take any supplements?":"هل تتناول أي مكملات غذائية بانتظام؟",
         
          AE: data2?.questionnaireResponse?.[0]?.language === "en"?"Supplements":"المكملات",
          
         
          AF:data2?.questionnaireResponse?.[0]?.language === "en"? "How do you rate your own health?":"كيف تقيم صحتك الخاصة؟",
         
         
          AG:data2?.questionnaireResponse?.[0]?.language === "en"? "During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling? Please input value in [0-7] days":"خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية قوية مثل رفع الأثقال أو الحفر أو التمارين الرياضية أو ركوب الدراجات السريعة؟ الرجاء إدخال القيمة خلال [0-7] أيام",
         
          AH: data2?.questionnaireResponse?.[0]?.language === "en"?"How much time did you usually spend doing vigorous physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes":"ما مقدار الوقت الذي أمضيته عادةً في ممارسة الأنشطة البدنية العنيفة في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة",
          
        
          AI: data2?.questionnaireResponse?.[0]?.language === "en"?"During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at a regular pace, or doubles tennis? Do not include walking. Please input value in [0-7] Days.":"خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية معتدلة مثل حمل أحمال خفيفة، أو ركوب الدراجة بوتيرة منتظمة، أو لعب التنس المزدوج؟ لا تشمل المشي. الرجاء إدخال القيمة خلال [0-7] أيام",
         
          AJ: data2?.questionnaireResponse?.[0]?.language === "en"?"How much time did you usually spend doing moderate physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes":"ما هو مقدار الوقت الذي أمضيته عادةً في ممارسة الأنشطة البدنية المعتدلة في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة",
         
          AK: data2?.questionnaireResponse?.[0]?.language === "en"?"During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days":"خلال آخر 7 أيام، في كم يومًا مشيت لمدة 10 دقائق على الأقل في المرة الواحدة؟ الرجاء إدخال القيمة خلال [0-7] أيام",
          
          AL:data2?.questionnaireResponse?.[0]?.language === "en"? "How much time did you usually spend walking on one of those days? Please input value in [0-6]hours and [0-60] minutes":"كم من الوقت كنت تقضيه عادة في المشي في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة",
         
         
          AM:data2?.questionnaireResponse?.[0]?.language === "en"? "During the last 7 days, on how many days did your child do vigorous physical activities like play clubs on the street, rollerblading, or fast bicycling? Please input value in [0-7] Days":"خلال الأيام السبعة الماضية، ما هو عدد الأيام التي مارس فيها طفلك أنشطة بدنية قوية مثل اللعب في النوادي في الشارع، أو التزلج على الجليد، أو ركوب الدراجات السريعة؟ الرجاء إدخال القيمة خلال [0-7] أيام",
          
          AN:data2?.questionnaireResponse?.[0]?.language === "en"? "During the last 7 days, on how many days did you do moderate physical activities like rope jumping, ice-skating in the malls or at skating centers, or bicycling at a regular pace? Do notinclude walking.Please input value in [0-7] Days":"خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية معتدلة مثل القفز على الحبل، أو التزلج على الجليد في مراكز التسوق أو مراكز التزلج، أو ركوب الدراجات بوتيرة منتظمة؟ لا تشمل المشي. يرجى إدخال القيمة خلال [0-7] أيام",
          
          AO:data2?.questionnaireResponse?.[0]?.language === "en"? "During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days":"خلال آخر 7 أيام، في كم يومًا مشيت لمدة 10 دقائق على الأقل في المرة الواحدة؟ الرجاء إدخال القيمة خلال [0-7] أيام",
          
          
          AP:data2?.questionnaireResponse?.[0]?.language === "en"? "Do you smoke?":"هل تدخن؟",
         
         
          AQ:data2?.questionnaireResponse?.[0]?.language === "en"? "What type of water did you use for drinking?":"ما نوع الماء الذي استخدمته للشرب؟",
          
          AR:data2?.questionnaireResponse?.[0]?.language === "en"? "If you did NOT use tap water, please tell us the reason why? ":"إذا لم تستخدم ماء الصنبور، من فضلك أخبرنا عن السبب؟ اختر واحدة من",
          
          AS: data2?.questionnaireResponse?.[0]?.language === "en"?"What type of water did you use for preparation of your tea/coffee? Select one from":"ما نوع الماء الذي استخدمته لتحضير الشاي/القهوة؟ اختر واحدة من",
         
          
          AT:data2?.questionnaireResponse?.[0]?.language === "en"? "Do you cook or participate in food preparation?":"هل تطبخ أو تشارك في إعداد الطعام؟",
         
          AU:data2?.questionnaireResponse?.[0]?.language === "en"? "What type of water do you use for cooking?":"ما نوع الماء الذي تستخدمه في الطهي؟",
         
          AV:data2?.questionnaireResponse?.[0]?.language === "en"? "If you used bottled water, please specify the water brand(s)":"إذا كنت تستخدم المياه المعبأة في زجاجات، يرجى تحديد ماركة (علامات) المياه",
         
          AW:data2?.questionnaireResponse?.[0]?.language === "en"? "Do you wash your hands before you eat?":"هل تغسل يديك قبل أن تأكل؟",
         
          AX:data2?.questionnaireResponse?.[0]?.language === "en"? "Do you wash your hands before/during food preparation?":"هل تغسل يديك قبل/أثناء تحضير الطعام؟",
          
          AY: data2?.questionnaireResponse?.[0]?.language === "en"?"How do you prepare fruits and vegetables before you eat them?":"كيف تقومين بتحضير الفواكه والخضروات قبل تناولها؟",
          
          AZ: data2?.questionnaireResponse?.[0]?.language === "en"?"How often do you wash fruits and vegetables before consumption?":"كم مرة تغسل الفواكه والخضروات قبل تناولها؟",
          
          BA: data2?.questionnaireResponse?.[0]?.language === "en"?"Do you use anything to treat fruits and vegetables when you wash/prepare them ?":"هل تستخدم أي شيء لمعالجة الفواكه والخضروات عند غسلها أو تحضيرها؟",
          
          BB: data2?.questionnaireResponse?.[0]?.language === "en"?"Do you use one of them to treat vegetables?":"هل تستخدم واحدة منها لعلاج الخضار؟",
          
          BC: data2?.questionnaireResponse?.[0]?.language === "en"?"How long do you soak fruit and vegetable? Please input value in [0-6]hours and [0-60]minutes":"كم من الوقت تنقع الفواكه والخضروات؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60]دقيقة",
          
        
          BD: data2?.questionnaireResponse?.[0]?.language === "en"?"Do you rinse the fruit/vegetables after soaking?":"هل تغسل الفواكه/الخضار بعد نقعها؟",
         
          BE:data2?.questionnaireResponse?.[0]?.language === "en"? "Have you suffered from any symptoms of food poisoning (e.g., diarrhea, vomiting, nausea) last year?":"هل عانيت من أي أعراض تسمم غذائي (مثل الإسهال والقيء والغثيان) العام الماضي؟",
          
          BF:data2?.questionnaireResponse?.[0]?.language === "en"? "How many times did you have food poisoning last year?":"كم مرة تعرضت للتسمم الغذائي العام الماضي؟",
          
          BG: data2?.questionnaireResponse?.[0]?.language === "en"?"What kind of food poisoning symptoms did you suffer from?":"ما هي أعراض التسمم الغذائي التي عانيت منها؟",
          
          BH: data2?.questionnaireResponse?.[0]?.language === "en"?"What kind of materials your cookware is made of?":"ما نوع المواد المصنوعة من تجهيزات المطابخ الخاصة بك؟",
          
         
         
            BI: data2?.questionnaireResponse?.[0]?.language === "en"?"Who is the primary food shopper(s) in your household? The primary food shopper(s) is the person(s) who does the grocery shopping most often.":"من هو المتسوق (المتسوقون) الرئيسيون للأغذية في منزلك؟ المتسوق (المتسوقون) الأساسيون للأغذية هو الشخص (الأشخاص) الذي يقوم بالتسوق من البقالة في أغلب الأحيان.",
          
          BJ: data2?.questionnaireResponse?.[0]?.language === "en"?"What was the single most frequently used food source in the past 30 days?":"ما هو مصدر الغذاء الوحيد الأكثر استخدامًا خلال الثلاثين يومًا الماضية؟",
          
          BK:data2?.questionnaireResponse?.[0]?.language === "en"? "In the past 30 days, on how many days did the primary food shopper(s) shop/purchase food? [0-30] Days":"خلال الثلاثين يومًا الماضية، ما هو عدد الأيام التي قام فيها متسوق (متسوقو) المواد الغذائية الأساسية بالتسوق/شراء الطعام؟ [0-30] أيام",
          
          BL:data2?.questionnaireResponse?.[0]?.language === "en"? "What was the amount in AED spent on food purchase in the past 30 days?":"ما هو المبلغ الذي تم إنفاقه بالدرهم الإماراتي على شراء المواد الغذائية خلال الثلاثين يومًا الماضية؟",
          
          BM: data2?.questionnaireResponse?.[0]?.language === "en"?"Which factors influence your food purchase decisions?":"ما هي العوامل التي تؤثر على قرارات شراء الطعام؟",
          
          BN:data2?.questionnaireResponse?.[0]?.language === "en"? "What is your preferred payment method?":"ماهي طريقة الدفع المفضلة لك؟",
          
          BO: data2?.questionnaireResponse?.[0]?.language === "en"?"I prefer fresh foods":"أفضّل الأطعمة الطازجة",
          
          BP:data2?.questionnaireResponse?.[0]?.language === "en"? "I enjoy trying new foods.":"أنا أستمتع بتجربة الأطعمة الجديدة",
          
          BQ: data2?.questionnaireResponse?.[0]?.language === "en"?"I prefer online food shopping/purchase.":"أفضّل التسوق/شراء الطعام عبر الإنترنت",
          
          BR: data2?.questionnaireResponse?.[0]?.language === "en"?"I avoid wasting food.":"أتجنب إهدار الطعام",
          
          BS:data2?.questionnaireResponse?.[0]?.language === "en"? "I avoid storing/stacking food.":"أتجنب تخزين/تكديس الطعام",
         
          BT: data2?.questionnaireResponse?.[0]?.language === "en"?"What is your opinion about organic foods?":"ما هو رأيك في الأطعمة العضوية؟",
          
          BU:data2?.questionnaireResponse?.[0]?.language === "en"? "What is your opinion about locally sourced foods?":"ما هو رأيك في الأطعمة ذات المصدر المحلي؟",
          
          BV:data2?.questionnaireResponse?.[0]?.language === "en"? "What is your opinion about sustainable foods?":"ما هو رأيك في الأطعمة المستدامة؟",
          
          
          BW:data2?.questionnaireResponse?.[0]?.language === "en"? "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekdays? (if you did not use smartphone, enter 0)":"كم عدد الساعات التي استخدمت فيها هاتفك الذكي يوميًا لأسباب شخصية (وليس للعمل) خلال الثلاثين يومًا الماضية خلال أيام الأسبوع؟ (إذا لم تكن تستخدم الهاتف الذكي، أدخل 0)",
          
          BX:data2?.questionnaireResponse?.[0]?.language === "en"? "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekends? (if you did not use smartphone, enter 0)":"كم عدد الساعات التي استخدمت فيها هاتفك الذكي يوميًا لأسباب شخصية (وليس للعمل) خلال الثلاثين يومًا الماضية خلال عطلات نهاية الأسبوع؟ (إذا لم تكن تستخدم الهاتف الذكي، أدخل 0)",
          
          BY:data2?.questionnaireResponse?.[0]?.language === "en"? "What was the single most frequently used smartphone content type during the past 30 days?":"ما هو نوع محتوى الهاتف الذكي الأكثر استخدامًا خلال الثلاثين يومًا الماضية؟",
          
          
          BZ:data2?.questionnaireResponse?.[0]?.language === "en"? "How many hours per day did you use a social media platform in the past 30 days during weekdays? (if you did not use social media, enter 0)":"كم عدد الساعات يوميًا التي استخدمت فيها إحدى منصات التواصل الاجتماعي خلال الثلاثين يومًا الماضية خلال أيام الأسبوع؟ (إذا لم تكن تستخدم وسائل التواصل الاجتماعي، أدخل 0)",
          
          CA:data2?.questionnaireResponse?.[0]?.language === "en"? "How many hours per day did you use a social media platform in the past 30 days during weekends? (if you did not use social media, enter 0)":"كم عدد الساعات التي استخدمت فيها إحدى منصات التواصل الاجتماعي يوميًا خلال الثلاثين يومًا الماضية خلال عطلات نهاية الأسبوع؟ (إذا لم تكن تستخدم وسائل التواصل الاجتماعي، أدخل 0)",
          
          CB: data2?.questionnaireResponse?.[0]?.language === "en"?"What was the single most frequently used social media (e.g., Instagram, X (Twitter), Facebook) content type during the past 30 days?":"ما هو نوع محتوى وسائل التواصل الاجتماعي الأكثر استخدامًا (على سبيل المثال، Instagram وX (Twitter) وFacebook) خلال الثلاثين يومًا الماضية؟",
          CC:'.',
          CD:'.'  



      },
      {
        A:data1?.participantCode || 'NA',
        B:data1?.participantCode?.slice(0, 10) || 'NA',
        C:data1?.startTime || 'NA',
        D:data1?.firstName || 'NA',
        E:data1?.familyName || 'NA',
        F:data1?.demographicResponse?.nationality || 'NA',
        G:data1?.demographicResponse?.location || 'NA',
        H:appState?.types?.incomeGroups?.find(
          (gender) => gender?.id === data1?.demographicResponse?.incomeGroupId
        )?.label || 'NA',
        I:data1?.dob || 'NA',
        J:data1?.demographicResponse?.age || 'NA',
        K:appState?.types?.genderTypes?.find(
          (gender) => gender?.genderId === data1?.genderId
        )?.genderName || 'NA',
        L:data1?.demographicResponse?.isPregnant === true
        ? "Yes"
        : data1?.demographicResponse?.isPregnant === false
        ? "No"
        : "NA",
        M:data1?.demographicResponse?.isLactating === true
        ? "Yes"
        : data1?.demographicResponse?.isPregnant === false
        ? "No"
        : "NA",
        N:data1?.demographicResponse?.weight || 'NA',
        O:data1?.demographicResponse?.height || 'NA',
        P:data1?.demographicResponse?.weightMeasured || 'NA',
        Q:data1?.demographicResponse?.heightMeasured || 'NA',
        R:data1?.demographicResponse?.bodyFat || 'NA',
        S:appState?.types?.maritalStatusTypes?.find(
          (mart) => mart?.maritalId === data1?.maritalStatusId
        )?.maritalName || 'NA',
        T:appState?.types?.occupationTypes?.find(
          (occ) => occ?.occupationId === data1?.occupationId
        )?.occupationName || 'NA',
        U:appState?.types?.academicLevelTypes?.find(
          (aca) => aca?.academicLevelId === data1?.academicLevelId
        )?.academicLevelName || 'NA',


        
        V: xlData?.find(
          (item) =>
            item?.question ==="Are you currently following a special diet?"||item?.question ==="هل تتبعين حالياً نظاماً غذائياً خاصاً؟")?.answer,
         
          W: xlData?.find(
          (item) =>
            item?.question ==="Vegetarian (Diet)" || item?.question ==="حمية نباتية)")?.answer || 'NA',
         
          X: xlData?.find(
          (item) =>
            item?.question ==="Therapeutic (Diet)" || item?.question ==="علاجي (نظام غذائي)")?.answer || 'NA',
         
          Y: xlData?.find(
          (item) =>
            item?.question ==="Weight management (Diet)" ||item?.question ==="إدارة الوزن (النظام الغذائي)")?.answer || 'NA',
         
          Z: xlData?.find(
          (item) =>
            item?.question ==="Allergy-free (Diet)" ||   item?.question ==="خالي من الحساسية (نظام غذائي)")?.answer || 'NA',
         
          AA: xlData?.find(
          (item) =>
            item?.question ==="Sport (Diet)" ||item?.question ==="رياضة (نظام غذائي)")?.answer || 'NA',
         
          AB: xlData?.find(
          (item) =>
            item?.question ==="Do you suffer from any food allergies or intolerances?" ||item?.question ==="هل تعاني من أي حساسية أو عدم تحمل الطعام؟")?.answer || 'NA',
         
        
          AC: xlData?.find(
          (item) =>
            item?.question ==="Please provide the list of allergies or intolerances suffered" ||item?.question ==="يرجى تقديم قائمة بالحساسية أو عدم التحمل الذي تعاني منه")?.answer || 'NA',
          
         
          AD: xlData?.find(
          (item) =>
            item?.question ==="Do you regularly take any supplements?" ||item?.question ==="هل تتناول أي مكملات غذائية بانتظام؟")?.answer || 'NA',
         
          AE: xlData?.find(
          (item) =>
            item?.question ==="Supplements" ||item?.question ==="المكملات")?.answer || 'NA',
          
         
          AF: xlData?.find(
          (item) =>
            item?.question ==="How do you rate your own health?"||item?.question ==="كيف تقيم صحتك الخاصة؟")?.answer || 'NA',
         
         
          AG: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling? Please input value in [0-7] days"|| item?.question ==="خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية قوية مثل رفع الأثقال أو الحفر أو التمارين الرياضية أو ركوب الدراجات السريعة؟ الرجاء إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
         
          AH: xlData?.find(
          (item) =>
            item?.question ==="How much time did you usually spend doing vigorous physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes" || item?.question ==="ما مقدار الوقت الذي أمضيته عادةً في ممارسة الأنشطة البدنية العنيفة في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة")?.answer || 'NA',
          
        
          AI: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at a regular pace, or doubles tennis? Do not include walking. Please input value in [0-7] Days."|| item?.question ==="خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية معتدلة مثل حمل أحمال خفيفة، أو ركوب الدراجة بوتيرة منتظمة، أو لعب التنس المزدوج؟ لا تشمل المشي. الرجاء إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
         
          AJ: xlData?.find(
          (item) =>
            item?.question ==="How much time did you usually spend doing moderate physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes" || item?.question ==="ما هو مقدار الوقت الذي أمضيته عادةً في ممارسة الأنشطة البدنية المعتدلة في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة")?.answer || 'NA',
         
          AK: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days" || item?.question ==="خلال آخر 7 أيام، في كم يومًا مشيت لمدة 10 دقائق على الأقل في المرة الواحدة؟ الرجاء إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
          
          AL: xlData?.find(
          (item) =>
            item?.question ==="How much time did you usually spend walking on one of those days? Please input value in [0-6]hours and [0-60] minutes" ||item?.question ==="كم من الوقت كنت تقضيه عادة في المشي في أحد تلك الأيام؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60] دقيقة")?.answer || 'NA',
         
         
          AM: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did your child do vigorous physical activities like play clubs on the street, rollerblading, or fast bicycling? Please input value in [0-7] Days"||item?.question ==="خلال الأيام السبعة الماضية، ما هو عدد الأيام التي مارس فيها طفلك أنشطة بدنية قوية مثل اللعب في النوادي في الشارع، أو التزلج على الجليد، أو ركوب الدراجات السريعة؟ الرجاء إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
          
          AN: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did you do moderate physical activities like rope jumping, ice-skating in the malls or at skating centers, or bicycling at a regular pace? Do notinclude walking.Please input value in [0-7] Days"|| item?.question ==="خلال الأيام السبعة الماضية، ما هو عدد الأيام التي قمت فيها بممارسة أنشطة بدنية معتدلة مثل القفز على الحبل، أو التزلج على الجليد في مراكز التسوق أو مراكز التزلج، أو ركوب الدراجات بوتيرة منتظمة؟ لا تشمل المشي. يرجى إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
          
          AO: xlData?.find(
          (item) =>
            item?.question ==="During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days" ||item?.question ==="خلال آخر 7 أيام، في كم يومًا مشيت لمدة 10 دقائق على الأقل في المرة الواحدة؟ الرجاء إدخال القيمة خلال [0-7] أيام")?.answer || 'NA',
          
          
          AP: xlData?.find(
          (item) =>
            item?.question ==="Do you smoke?" ||item?.question ==="هل تدخن؟")?.answer || 'NA',
         
         
          AQ: xlData?.find(
          (item) =>
            item?.question ==="What type of water did you use for drinking?" ||item?.question ==="ما نوع الماء الذي استخدمته للشرب؟")?.answer || 'NA',
          
          AR: xlData?.find(
          (item) =>
            item?.question ==="If you did NOT use tap water, please tell us the reason why?" || item?.question ==="إذا لم تستخدم ماء الصنبور، من فضلك أخبرنا عن السبب؟ اختر واحدة من")?.answer || 'NA',
          
          AS: xlData?.find(
          (item) =>
            item?.question ==="What type of water did you use for preparation of your tea/coffee? Select one from" || item?.question ==="ما نوع الماء الذي استخدمته لتحضير الشاي/القهوة؟ اختر واحدة من")?.answer || 'NA',
         
          
          AT: xlData?.find(
          (item) =>
            item?.question ==="Do you cook or participate in food preparation?"|| item?.question ==="هل تطبخ أو تشارك في إعداد الطعام؟")?.answer || 'NA',
         
          AU: xlData?.find(
          (item) =>
            item?.question ==="What type of water do you use for cooking?" || item?.question ==="ما نوع الماء الذي تستخدمه في الطهي؟")?.answer || 'NA',
         
          AV: xlData?.find(
          (item) =>
            item?.question ==="If you used bottled water, please specify the water brand(s)"||item?.question ==="إذا كنت تستخدم المياه المعبأة في زجاجات، يرجى تحديد ماركة (علامات) المياه")?.answer || 'NA',
         
          AW: xlData?.find(
          (item) =>
            item?.question ==="Do you wash your hands before you eat?" || item?.question ==="هل تغسل يديك قبل أن تأكل؟")?.answer || 'NA',
         
          AX: xlData?.find(
          (item) =>
            item?.question ==="Do you wash your hands before/during food preparation?"||item?.question ==="هل تغسل يديك قبل/أثناء تحضير الطعام؟")?.answer || 'NA',
          
          AY: xlData?.find(
          (item) =>
            item?.question ==="How do you prepare fruits and vegetables before you eat them?"|| item?.question ==="كيف تقومين بتحضير الفواكه والخضروات قبل تناولها؟")?.answer || 'NA',
          
          AZ: xlData?.find(
          (item) =>
            item?.question ==="How often do you wash fruits and vegetables before consumption?" || item?.question ==="كم مرة تغسل الفواكه والخضروات قبل تناولها؟")?.answer || 'NA',
          
          BA: xlData?.find(
          (item) =>
            item?.question ==="Do you use anything to treat fruits and vegetables when you wash/prepare them ?" || item?.question ==="هل تستخدم أي شيء لمعالجة الفواكه والخضروات عند غسلها أو تحضيرها؟")?.answer || 'NA',
          
          BB: xlData?.find(
          (item) =>
            item?.question ==="Do you use one of them to treat vegetables?" ||item?.question ==="هل تستخدم واحدة منها لعلاج الخضار؟")?.answer || 'NA',
          
          BC: xlData?.find(
          (item) =>
            item?.question ==="How long do you soak fruit and vegetable? Please input value in [0-6]hours and [0-60]minutes" || item?.question ==="كم من الوقت تنقع الفواكه والخضروات؟ الرجاء إدخال القيمة بعد [0-6]ساعات و[0-60]دقيقة")?.answer || 'NA',
          
        
          BD: xlData?.find(
          (item) =>
            item?.question ==="Do you rinse the fruit/vegetables after soaking?"|| item?.question ==="هل تغسل الفواكه/الخضار بعد نقعها؟")?.answer || 'NA',
         
          BE: xlData?.find(
          (item) =>
            item?.question ==="Have you suffered from any symptoms of food poisoning (e.g., diarrhea, vomiting, nausea) last year?" ||item?.question ==="هل عانيت من أي أعراض تسمم غذائي (مثل الإسهال والقيء والغثيان) العام الماضي؟")?.answer || 'NA',
          
          BF: xlData?.find(
          (item) =>
            item?.question ==="How many times did you have food poisoning last year?" ||item?.question ==="كم مرة تعرضت للتسمم الغذائي العام الماضي؟")?.answer || 'NA',
          
          BG: xlData?.find(
          (item) =>
            item?.question ==="What kind of food poisoning symptoms did you suffer from?" ||item?.question ==="ما هي أعراض التسمم الغذائي التي عانيت منها؟")?.answer || 'NA',
          
          BH: xlData?.find(
          (item) =>
            item?.question ==="What kind of materials your cookware is made of?"||item?.question ==="ما نوع المواد المصنوعة من تجهيزات المطابخ الخاصة بك؟")?.answer || 'NA',
          
         
         
          BI: xlData?.find(
            (item) =>
              item?.question === "Who is the primary food shopper(s) in your household? The primary food shopper(s) is the person(s) who does the grocery shopping most often." ||
              item?.question ==="من هو المتسوق (المتسوقون) الرئيسيون للأغذية في منزلك؟ المتسوق (المتسوقون) الأساسيون للأغذية هو الشخص (الأشخاص) الذي يقوم بالتسوق من البقالة في أغلب الأحيان.")?.answer || 'NA',
         
          BJ: xlData?.find(
          (item) =>
            item?.question ==="What was the single most frequently used food source in the past 30 days?"||item?.question ==="ما هو مصدر الغذاء الوحيد الأكثر استخدامًا خلال الثلاثين يومًا الماضية؟")?.answer || 'NA',
          
          BK: xlData?.find(
          (item) =>
            item?.question ==="In the past 30 days, on how many days did the primary food shopper(s) shop/purchase food? [0-30] Days"|| item?.question ==="خلال الثلاثين يومًا الماضية، ما هو عدد الأيام التي قام فيها متسوق (متسوقو) المواد الغذائية الأساسية بالتسوق/شراء الطعام؟ [0-30] أيام")?.answer || 'NA',
          
          BL: xlData?.find(
          (item) =>
            item?.question ==="What was the amount in AED spent on food purchase in the past 30 days?" || item?.question ==="ما هو المبلغ الذي تم إنفاقه بالدرهم الإماراتي على شراء المواد الغذائية خلال الثلاثين يومًا الماضية؟")?.answer || 'NA',
          
          BM: xlData?.find(
          (item) =>
            item?.question ==="Which factors influence your food purchase decisions?" || item?.question ==="ما هي العوامل التي تؤثر على قرارات شراء الطعام؟")?.answer || 'NA',
          
          BN: xlData?.find(
          (item) =>
            item?.question ==="What is your preferred payment method?"|| item?.question ==="ماهي طريقة الدفع المفضلة لك؟")?.answer || 'NA',
          
          BO: xlData?.find(
          (item) =>
            item?.question ==="I prefer fresh foods"||item?.question ==="أفضّل الأطعمة الطازجة")?.answer || 'NA',
          
          BP: xlData?.find(
          (item) =>
            item?.question ==="I enjoy trying new foods." ||item?.question ==="أنا أستمتع بتجربة الأطعمة الجديدة")?.answer || 'NA',
          
          BQ: xlData?.find(
          (item) =>
            item?.question ==="I prefer online food shopping/purchase." || item?.question ==="أفضّل التسوق/شراء الطعام عبر الإنترنت")?.answer || 'NA',
          
          BR: xlData?.find(
          (item) =>
            item?.question ==="I avoid wasting food." || item?.question ==="أتجنب إهدار الطعام")?.answer || 'NA',
          
          BS: xlData?.find(
          (item) =>
            item?.question ==="I avoid storing/stacking food."||item?.question ==="أتجنب تخزين/تكديس الطعام")?.answer || 'NA',
         
          BT: xlData?.find(
          (item) =>
            item?.question ==="What is your opinion about organic foods?" || item?.question ==="ما هو رأيك في الأطعمة العضوية؟")?.answer || 'NA',
          
          BU: xlData?.find(
          (item) =>
            item?.question ==="What is your opinion about locally sourced foods?" || item?.question ==="ما هو رأيك في الأطعمة ذات المصدر المحلي؟")?.answer || 'NA',
          
          BV: xlData?.find(
          (item) =>
            item?.question ==="What is your opinion about sustainable foods?"|| item?.question ==="ما هو رأيك في الأطعمة المستدامة؟")?.answer || 'NA',
          
          
          BW: xlData?.find(
          (item) =>
            item?.question ==="How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekdays? (if you did not use smartphone, enter 0)" || item?.question ==="كم عدد الساعات التي استخدمت فيها هاتفك الذكي يوميًا لأسباب شخصية (وليس للعمل) خلال الثلاثين يومًا الماضية خلال أيام الأسبوع؟ (إذا لم تكن تستخدم الهاتف الذكي، أدخل 0)")?.answer || 'NA',
          
          BX: xlData?.find(
          (item) =>
            item?.question ==="How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekends? (if you did not use smartphone, enter 0)" ||item?.question ==="كم عدد الساعات التي استخدمت فيها هاتفك الذكي يوميًا لأسباب شخصية (وليس للعمل) خلال الثلاثين يومًا الماضية خلال عطلات نهاية الأسبوع؟ (إذا لم تكن تستخدم الهاتف الذكي، أدخل 0)")?.answer || 'NA',
          
          BY: xlData?.find(
          (item) =>
            item?.question ==="What was the single most frequently used smartphone content type during the past 30 days?" || item?.question ==="ما هو نوع محتوى الهاتف الذكي الأكثر استخدامًا خلال الثلاثين يومًا الماضية؟")?.answer || 'NA',
          
          
          BZ: xlData?.find(
          (item) =>
            item?.question ==="How many hours per day did you use a social media platform in the past 30 days during weekdays? (if you did not use social media, enter 0)" || item?.question ==="كم عدد الساعات يوميًا التي استخدمت فيها إحدى منصات التواصل الاجتماعي خلال الثلاثين يومًا الماضية خلال أيام الأسبوع؟ (إذا لم تكن تستخدم وسائل التواصل الاجتماعي، أدخل 0)")?.answer || 'NA',
          
          CA: xlData?.find(
          (item) =>
            item?.question ==="How many hours per day did you use a social media platform in the past 30 days during weekends? (if you did not use social media, enter 0)" || item?.question ==="كم عدد الساعات التي استخدمت فيها إحدى منصات التواصل الاجتماعي يوميًا خلال الثلاثين يومًا الماضية خلال عطلات نهاية الأسبوع؟ (إذا لم تكن تستخدم وسائل التواصل الاجتماعي، أدخل 0)")?.answer || 'NA',
          
          CB: xlData?.find(
          (item) =>
            item?.question ==="What was the single most frequently used social media (e.g., Instagram, X (Twitter), Facebook) content type during the past 30 days?"||item?.question ==="ما هو نوع محتوى وسائل التواصل الاجتماعي الأكثر استخدامًا (على سبيل المثال، Instagram وX (Twitter) وFacebook) خلال الثلاثين يومًا الماضية؟")?.answer || 'NA',
          CC:'Food Intake'
      },
    ]
    //const Role = [{ A: roleSearch.length !== 0 ? `ROLE : ${roleSearch}` : null }];
    let table1 = [
      {
        A: "Participant Code",
        B: data1?.participantCode,
      },
      {
        A: "Family Code",
        B: data1?.participantCode?.slice(0, 10),
      },
      {
        A: "Survey  Date and Time",
        B: data1?.startTime,
      },
      {
        A: "Demographics",
        B: "",
      },
      {
        A: "First Name",
        B: data1?.firstName,
      },
      {
        A: "Family Name",
        B: data1?.familyName,
      },
      {
        A: "Emirate",
        B: data1?.demographicResponse?.nationality,
      },
      {
        A: "City / Area",
        B: data1?.demographicResponse?.location,
      },
      {
        A: "Household Income per Month",
        B: appState?.types?.incomeGroups?.find(
          (gender) => gender?.id === data1?.demographicResponse?.incomeGroupId
        )?.label,
      },
      {
        A: "DOB",
        B: data1?.dob,
      },
      {
        A: "UAE Citizen?",
        B: "",
      },
      {
        A: "Age",
        B: data1?.demographicResponse?.age,
      },
      {
        A: "Gender",
        B: appState?.types?.genderTypes?.find(
          (gender) => gender?.genderId === data?.genderId
        )?.genderName,
      },
      {
        A: "Pregnant?",
        B:
          data1?.demographicResponse?.isPregnant === true
            ? "Yes"
            : data1?.demographicResponse?.isPregnant === false
            ? "No"
            : "NA",
      },
      {
        A: "BreastFeeding?",
        B:
          data1?.demographicResponse?.isLactating === true
            ? "Yes"
            : data1?.demographicResponse?.isPregnant === false
            ? "No"
            : "NA",
      },
      {
        A: "Weight (Kgs)",
        B: data1?.demographicResponse?.weight,
      },
      {
        A: "Weight (Kgs) - Calculated",
        B: "",
      },
      {
        A: "Height (Cm)",
        B: data1?.demographicResponse?.height,
      },
      {
        A: "Height (Cm) - Calculated",
        B: "",
      },
      {
        A: "Body Fat (%)",
        B: "",
      },
      {
        A: "Marital Status",
        B: appState?.types?.maritalStatusTypes?.find(
          (mart) => mart?.maritalId === data1?.maritalStatusId
        )?.maritalName,
      },
      {
        A: "Current Situation",
        B: appState?.types?.occupationTypes?.find(
          (occ) => occ?.occupationId === data1?.occupationId
        )?.occupationName,
      },
      {
        A: "Level of Education",
        B: appState?.types?.academicLevelTypes?.find(
          (aca) => aca?.academicLevelId === data1?.academicLevelId
        )?.academicLevelName,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Survey Questionnaire (Visit 1)",
        B: "",
      },
      {
        A: "General",
        B: "",
      },
      {
        A: "Are you currently following a special diet?",
        B: xlData?.find(
          (item) =>
            item?.question === "Are you currently following a special diet?"
        )?.answer,
      },
      {
        A: "Vegetarian (Diet)",
        B: xlData?.find((item) => item?.question === "Vegetarian (Diet)")
          ?.answer,
      },
      {
        A: "Therapeutic (Diet)",
        B: xlData?.find((item) => item?.question === "Therapeutic (Diet)")
          ?.answer,
      },
      {
        A: "Weight management (Diet)",
        B: xlData?.find((item) => item?.question === "Weight management (Diet)")
          ?.answer,
      },
      {
        A: "Allergy-free (Diet)",
        B: xlData?.find((item) => item?.question === "Allergy-free (Diet)")
          ?.answer,
      },
      {
        A: "Sport (Diet)",
        B: xlData?.find((item) => item?.question === "Sport (Diet)")?.answer,
      },
      {
        A: "Do you suffer from any food allergies or intolerances?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Do you suffer from any food allergies or intolerances?"
        )?.answer,
      },
      {
        A: "Please provide the list of allergies or intolerances suffered",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Please provide the list of allergies or intolerances suffered"
        )?.answer,
      },
      {
        A: "Supplements",
        B: "",
      },
      {
        A: "Do you regularly take any supplements?",
        B: xlData?.find(
          (item) => item?.question === "Do you regularly take any supplements?"
        )?.answer,
      },
      {
        A: "Supplements",
        B: xlData?.find((item) => item?.question === "Supplements")?.answer,
      },
      {
        A: "Self perceived health",
        B: "",
      },
      {
        A: "How do you rate your own health?",
        B: xlData?.find(
          (item) => item?.question === "How do you rate your own health?"
        )?.answer,
      },
      {
        A: "Physical activity - adult",
        B: "",
      },
      {
        A: "During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling? Please input value in [0-7] days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling? Please input value in [0-7] days"
        )?.answer,
      },
      {
        A: "How much time did you usually spend doing vigorous physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How much time did you usually spend doing vigorous physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes"
        )?.answer,
      },
      {
        A: "During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at a regular pace, or doubles tennis? Do not include walking. Please input value in [0-7] Days.",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at a regular pace, or doubles tennis? Do not include walking. Please input value in [0-7] Days."
        )?.answer,
      },
      {
        A: "How much time did you usually spend doing moderate physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How much time did you usually spend doing moderate physical activities on one of those days? Please input value in [0-6]hours and [0-60] minutes"
        )?.answer,
      },
      {
        A: "During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days"
        )?.answer,
      },
      {
        A: "How much time did you usually spend walking on one of those days? Please input value in [0-6]hours and [0-60] minutes",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How much time did you usually spend walking on one of those days? Please input value in [0-6]hours and [0-60] minutes"
        )?.answer,
      },
      {
        A: "Physical activity - child",
        B: "",
      },
      {
        A: "During the last 7 days, on how many days did your child do vigorous physical activities like play clubs on the street, rollerblading, or fast bicycling? Please input value in [0-7] Days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did your child do vigorous physical activities like play clubs on the street, rollerblading, or fast bicycling? Please input value in [0-7] Days"
        )?.answer,
      },
      {
        A: "During the last 7 days, on how many days did you do moderate physical activities like rope jumping, ice-skating in the malls or at skating centers, or bicycling at a regular pace? Do notinclude walking.Please input value in [0-7] Days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did you do moderate physical activities like rope jumping, ice-skating in the malls or at skating centers, or bicycling at a regular pace? Do notinclude walking.Please input value in [0-7] Days"
        )?.answer,
      },
      {
        A: "During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "During the last 7 days, on how many days did you walk for at least 10 minutes at a time? Please input value in [0-7] Days"
        )?.answer,
      },
      {
        A: "Smoking status",
        B: "",
      },
      {
        A: "Do you smoke?",
        B: xlData?.find((item) => item?.question === "Do you smoke?")?.answer,
      },
      {
        A: "Drinking water",
        B: "",
      },
      {
        A: "What type of water did you use for drinking?",
        B: xlData?.find(
          (item) =>
            item?.question === "What type of water did you use for drinking?"
        )?.answer,
      },
      {
        A: "If you did NOT use tap water, please tell us the reason why? ",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "If you did NOT use tap water, please tell us the reason why?"
        )?.answer,
      },
      {
        A: "What type of water did you use for preparation of your tea/coffee?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What type of water did you use for preparation of your tea/coffee?"
        )?.answer,
      },
      {
        A: "Food Safety",
        B: "",
      },
      {
        A: "Do you cook or participate in food preparation?",
        B: xlData?.find(
          (item) =>
            item?.question === "Do you cook or participate in food preparation?"
        )?.answer,
      },
      {
        A: "What type of water do you use for cooking?",
        B: xlData?.find((item) => item?.question === "")?.answer,
      },
      {
        A: "If you used bottled water, please specify the water brand(s)",
        B: xlData?.find(
          (item) =>
            item?.question === "What type of water do you use for cooking?"
        )?.answer,
      },
      {
        A: "Do you wash your hands before you eat?",
        B: xlData?.find(
          (item) => item?.question === "Do you wash your hands before you eat?"
        )?.answer,
      },
      {
        A: "Do you wash your hands before/during food preparation?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Do you wash your hands before/during food preparation?"
        )?.answer,
      },
      {
        A: "How do you prepare fruits and vegetables before you eat them?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How do you prepare fruits and vegetables before you eat them?"
        )?.answer,
      },
      {
        A: "How often do you wash fruits and vegetables before consumption?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How often do you wash fruits and vegetables before consumption?"
        )?.answer,
      },
      {
        A: "Do you use anything to treat fruits and vegetables when you wash/prepare them ?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Do you use anything to treat fruits and vegetables when you wash/prepare them ?"
        )?.answer,
      },
      {
        A: "Do you use one of them to treat vegetables?",
        B: xlData?.find(
          (item) =>
            item?.question === "Do you use one of them to treat vegetables?"
        )?.answer,
      },
      {
        A: "How long do you soak fruit and vegetable? Please input value in [0-6]hours and [0-60]minutes",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How long do you soak fruit and vegetable? Please input value in [0-6]hours and [0-60]minutes"
        )?.answer,
      },
      {
        A: "Do you rinse the fruit/vegetables after soaking?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Do you rinse the fruit/vegetables after soaking?"
        )?.answer,
      },
      {
        A: "Have you suffered from any symptoms of food poisoning (e.g., diarrhea, vomiting, nausea) last year?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Have you suffered from any symptoms of food poisoning (e.g., diarrhea, vomiting, nausea) last year?"
        )?.answer,
      },
      {
        A: "How many times did you have food poisoning last year?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How many times did you have food poisoning last year?"
        )?.answer,
      },
      {
        A: "What kind of food poisoning symptoms did you suffer from?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What kind of food poisoning symptoms did you suffer from?"
        )?.answer,
      },
      {
        A: "What kind of materials your cookware is made of?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What kind of materials your cookware is made of?"
        )?.answer,
      },
      {
        A: "",
        B: "",
      },
      {
        A: "Consumer behavior Questionnaire",
        B: "",
      },
      {
        A: "Food shopping/purchasing, attitude, and behaviour",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Food shopping/purchasing, attitude, and behaviour"
        )?.answer,
      },
      {
        A: "Who is the primary food shopper(s) in your household? The primary food shopper(s) is the person(s) who does the grocery shopping most often.",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Who is the primary food shopper(s) in your household? The primary food shopper(s) is the person(s) who does the grocery shopping most often."
        )?.answer,
      },
      {
        A: "What was the single most frequently used food source in the past 30 days?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What was the single most frequently used food source in the past 30 days?"
        )?.answer,
      },
      {
        A: "In the past 30 days, on how many days did the primary food shopper(s) shop/purchase food? [0-30] Days",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "In the past 30 days, on how many days did the primary food shopper(s) shop/purchase food? [0-30] Days"
        )?.answer,
      },
      {
        A: "What was the amount in AED spent on food purchase in the past 30 days?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What was the amount in AED spent on food purchase in the past 30 days?"
        )?.answer,
      },
      {
        A: "Which factors influence your food purchase decisions?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "Which factors influence your food purchase decisions?"
        )?.answer,
      },
      {
        A: "What is your preferred payment method?",
        B: xlData?.find(
          (item) => item?.question === "What is your preferred payment method?"
        )?.answer,
      },
      {
        A: "I prefer fresh foods..",
        B: xlData?.find((item) => item?.question === "I prefer fresh foods")
          ?.answer,
      },
      {
        A: "I enjoy trying new foods.",
        B: xlData?.find(
          (item) => item?.question === "I enjoy trying new foods."
        )?.answer,
      },
      {
        A: "I prefer online food shopping/purchase.",
        B: xlData?.find(
          (item) =>
            item?.question === "I prefer online food shopping/purchase. "
        )?.answer,
      },
      {
        A: "I avoid wasting food.",
        B: xlData?.find((item) => item?.question === "I avoid wasting food.")
          ?.answer,
      },
      {
        A: "I avoid storing/stacking food.",
        B: xlData?.find(
          (item) => item?.question === "I avoid storing/stacking food."
        )?.answer,
      },
      {
        A: "What is your opinion about organic foods?",
        B: xlData?.find(
          (item) =>
            item?.question === "What is your opinion about organic foods?"
        )?.answer,
      },
      {
        A: "What is your opinion about locally sourced foods?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What is your opinion about locally sourced foods?"
        )?.answer,
      },
      {
        A: "What is your opinion about sustainable foods?",
        B: xlData?.find(
          (item) =>
            item?.question === "What is your opinion about sustainable foods?"
        )?.answer,
      },
      {
        A: "Smartphone usage time and purpose",
        B: xlData?.find(
          (item) => item?.question === "Smartphone usage time and purpose"
        )?.answer,
      },
      {
        A: "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekdays? (if you did not use smartphone, enter 0)",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekdays? (if you did not use smartphone, enter 0)"
        )?.answer,
      },
      {
        A: "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekends? (if you did not use smartphone, enter 0)",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How many hours per day did you use your smartphone for personal reasons (not for work) in the past 30 days during weekends? (if you did not use smartphone, enter 0)"
        )?.answer,
      },
      {
        A: "What was the single most frequently used smartphone content type during the past 30 days?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What was the single most frequently used smartphone content type during the past 30 days?"
        )?.answer,
      },
      {
        A: "Social media usage time and purpose",
        B: "",
      },
      {
        A: "How many hours per day did you use a social media platform in the past 30 days during weekdays? (if you did not use social media, enter 0)",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How many hours per day did you use a social media platform in the past 30 days during weekdays? (if you did not use social media, enter 0)"
        )?.answer,
      },
      {
        A: "How many hours per day did you use a social media platform in the past 30 days during weekends? (if you did not use social media, enter 0)",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "How many hours per day did you use a social media platform in the past 30 days during weekends? (if you did not use social media, enter 0)"
        )?.answer,
      },
      {
        A: "What was the single most frequently used social media (e.g., Instagram, X (Twitter), Facebook) content type during the past 30 days?",
        B: xlData?.find(
          (item) =>
            item?.question ===
            "What was the single most frequently used social media (e.g., Instagram, X (Twitter), Facebook) content type during the past 30 days?"
        )?.answer,
      },
      {
        A: "Food Intake",
        B: "Visit 1",
      },
      {
        A: "",
        B: "Name",
        C: "Quantity",
        D: "Measurment",
        E: "Location",
        F: "Activity",
        G: "Consumption Time",
      },
      ...Object.values(sortedData)
        .map((groups, index) =>
          groups.map((group) => ({
            A: groups[0].foodIntakeType,
            B: group.foodName,
            C: group.quantity,
            D: group.measurement,
            E: group.location,
            F: group.activities,
            G: group.consumptionTime,
          }))
        )
        .flat(),
      {
        A: "",
        B: "",
      },
      {
        A: "",
        B: "Visit 2",
      },
      {
        A: "",
        B: "Name",
        C: "Quantity",
        D: "Measurment",
        E: "Location",
        F: "Activity",
        G: "Consumption Time",
      },
      ...Object.values(sortedData2)
        .map((groups, index) =>
          groups.map((group) => ({
            A: groups[0].foodIntakeType,
            B: group.foodName,
            C: group.quantity,
            D: group.measurement,
            E: group.location,
            F: group.activities,
            G: group.consumptionTime,
          }))
        )
        .flat(),

      {},
      {
        A: "Nutrient Values",
        B: "Visit 1",
        C: "",
        D: "Visit 2",
        E: "",
        F: "Average",
        G: "",
      },
      {
        A: "Calcium",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName ||na.nutrientNameArabic === "Calcium")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Calcium")?.nutrientValue,
        E: "",
        F: calculateAverage("Calcium"),
        G: "",
      },
      {
        A: "Calories",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Calories")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Calories")?.nutrientValue,
        E: "",
        F: calculateAverage("Calories"),
        G: "",
      },
      {
        A: "Carbohydrates",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName ||na.nutrientNameArabic === "Carbohydrates")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Carbohydrates")?.nutrientValue,
        E: "",
        F: calculateAverage("Carbohydrates"),
        G: "",
      },
      {
        A: "Cholesterol",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Cholesterol")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Cholesterol")?.nutrientValue,
        E: "",
        F: calculateAverage("Cholesterol"),
        G: "",
      },
      {
        A: "Fat",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Fat")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Fat")?.nutrientValue,
        E: "",
        F: calculateAverage("Fat"),
        G: "",
      },
      {
        A: "Folate",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Folate")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Folate")?.nutrientValue,
        E: "",
        F: calculateAverage("Folate"),
        G: "",
      },
      {
        A: "Iron",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Iron")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Iron")?.nutrientValue,
        E: "",
        F: calculateAverage("Iron"),
        G: "",
      },
      {
        A: "Magnesium",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Magnesium")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Magnesium")?.nutrientValue,
        E: "",
        F: calculateAverage("Magnesium"),
        G: "",
      },
      {
        A: "Mono Fat",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Mono Fat")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Mono Fat")?.nutrientValue,
        E: "",
        F: calculateAverage("Mono Fat"),
        G: "",
      },
      {
        A: "Phosphorus",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Phosphorus")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic=== "Phosphorus")?.nutrientValue,
        E: "",
        F: calculateAverage("Phosphorus"),
        G: "",
      },
      {
        A: "Poly Fat",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Poly Fat")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Poly Fat")?.nutrientValue,
        E: "",
        F: calculateAverage("Poly Fat"),
        G: "",
      },
      {
        A: "Potassium",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic=== "Potassium")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName ||na.nutrientNameArabic=== "Potassium")?.nutrientValue,
        E: "",
        F: calculateAverage("Potassium"),
        G: "",
      },
      {
        A: "Protein",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Protein")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Protein")?.nutrientValue,
        E: "",
        F: calculateAverage("Protein"),
        G: "",
      },
      {
        A: "Saturated Fat",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Saturated Fat")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Saturated Fat")?.nutrientValue,
        E: "",
        F: calculateAverage("Saturated Fat"),
        G: "",
      },
      {
        A: "Sodium",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Sodium")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Sodium")?.nutrientValue,
        E: "",
        F: calculateAverage("Sodium"),
        G: "",
      },
      {
        A: "Total Dietary Fiber",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Total Dietary Fiber")
          ?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Total Dietary Fiber")
          ?.nutrientValue,
        E: "",
        F: calculateAverage("Total Dietary Fiber"),
        G: "",
      },
      {
        A: "Trans Fatty Acid",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Trans Fatty Acid")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Trans Fatty Acid")?.nutrientValue,
        E: "",
        F: calculateAverage("Trans Fatty Acid"),
        G: "",
      },
      {
        A: "Vitamin A - RAE",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin A - RAE")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin A - RAE")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin A - RAE"),
        G: "",
      },
      {
        A: "Vitamin B1 - Thiamin",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B1 - Thiamin")
          ?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B1 - Thiamin")
          ?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin B1 - Thiamin"),
        G: "",
      },
      {
        A: "Vitamin B12",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B12")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B12")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin B12"),
        G: "",
      },
      {
        A: "Vitamin B2 - Riboflavin",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B2 - Riboflavin")
          ?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B2 - Riboflavin")
          ?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin B2 - Riboflavin"),
        G: "",
      },
      {
        A: "Vitamin B3 - Niacin",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B3 - Niacin")
          ?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B3 - Niacin")
          ?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin B3 - Niacin"),
        G: "",
      },
      {
        A: "Vitamin B6",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin B6")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName ||na.nutrientNameArabic=== "Vitamin B6")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin B6"),
        G: "",
      },
      {
        A: "Vitamin C",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin C")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin C")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin C"),
        G: "",
      },
      {
        A: "Vitamin D",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin D")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin D")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin D"),
        G: "",
      },
      {
        A: "Vitamin E - Alpha-Toco",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin E - Alpha-Toco")
          ?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin E - Alpha-Toco")
          ?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin E - Alpha-Toco"),
        G: "",
      },
      {
        A: "Vitamin K",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin K")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Vitamin K")?.nutrientValue,
        E: "",
        F: calculateAverage("Vitamin K"),
        G: "",
      },
      {
        A: "Water",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Water")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Water")?.nutrientValue,
        E: "",
        F: calculateAverage("Water"),
        G: "",
      },
      {
        A: "Zinc",
        B: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 1)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Zinc")?.nutrientValue,
        C: "",
        D: data1?.nutrientValueResponse
          ?.filter((m) => m.visitNumber === 2)
          .find((na) => na.nutrientName||na.nutrientNameArabic === "Zinc")?.nutrientValue,
        E: "",
        F: calculateAverage("Zinc"),
        G: "",
      },
    ];


    

    const finalData = [
      // { A: "", B: "ADAFSA REPORTS SUMMARY" },
      // ...TimeStampp,
      {},
      // ...table1,
      ...HorizontalTable,
    ];
    // Create a workbook
    const wb = XLSX.utils.book_new();
    // Create a worksheet
    const sheet = XLSX.utils.json_to_sheet(finalData, {
      skipHeader: true,
    });

    const dataInfo = {
      titleCell: "F1",
      titleRange: "A1:I2",
      timeStamp: "J2",
      tableHeader: "A4:N4",
      tbodyRange: `A5:N${finalData.length}`,
      serialNum: `A5:A${finalData.length}`,
      visitNum: `I5:I${finalData.length}`,
      demographicsTitle: "A7",
      widecell: "A4-A26",
    };

    XLSX.utils.book_append_sheet(wb, sheet, data1?.participantCode);

    const workbookBlob = workbook2blob(wb);

    const headerIndexes = [];
    finalData.forEach((data, index) =>
      data["A"] === "Serial No" ? headerIndexes.push(index) : null
    );

    return addStyles(workbookBlob, dataInfo);
  };

  // #4
  const createDownloadData = useCallback(() => {
    // if(totalSize===0)return

    handleExport().then((url) => {
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", data1?.participantCode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }, [handleExport]);

  const formik = useFormik({
    initialValues: {
      firstName: data1?.firstName,
      familyName: data1?.familyName,
      participantCode: data1?.participantCode,
      dob: data1?.dob,
      age: data1?.demographicResponse?.age,
      genderId: data1?.demographicResponse?.genderId,
      incomeGroupId: data1?.demographicResponse?.incomeGroupId,
      height: data1?.demographicResponse?.height,
      weight: data1?.demographicResponse?.weight,
      estimatedHeight: data1?.demographicResponse?.estimatedHeight,
      estimatedWeight: data1?.demographicResponse?.estimatedWeight,
      nationality: data1?.demographicResponse?.nationality||data1?.demographicResponse?.nationalityArabic,
      isUAECitizen: data1?.demographicResponse?.isUAECitizen,
      maritalStatusId: data1?.demographicResponse?.maritalStatusId,
      isPregnant: data1?.demographicResponse?.isPregnant,
      isLactating: data1?.demographicResponse?.isLactating,
      academicLevelId: data1?.demographicResponse?.academicLevelId,
      occupationId: data1?.occupationId,
      location: data1?.demographicResponse?.location||data1?.demographicResponse?.locationArabic,
      bodyFat: data1?.demographicResponse?.bodyFat,
      employmentStudentStatus:
        data1?.demographicResponse?.employmentStudentStatus,
    },
    enableReinitialize: true,
    onSubmit: (values) => {},
    validate: (values) => {
      const errors = {};
      if (!values.participantCode) {
        errors.participantCode = `${t("Head of Participant Code Required")}`;
      }
      if (!values.firstName) {
        errors.firstName = `${t("First Name Required")}`;
      }
      if (!values.familyName) {
        errors.familyName = `${t("Family Name Required")}`;
      }
      if (!values.genderId) {
        errors.genderId = `${t("Gender Required")}`;
      }
      if (!values.dob) {
        errors.dob = `${t("DOB Required")}`;
      }
      // if (!values.relationship) {
      //   errors.relationship = "Relationship Required";
      // }
      if (!values.academicLevelId) {
        errors.academicLevelId = `${t("Academic Level Required")}`;
      }
      if (!values.maritalStatusId) {
        errors.maritalStatusId = `${t("Marital Status Required")}`;
      }
      if (!values.relativeRelationId) {
        errors.relativeRelationId = `${t("Relationship Required")}`;
      }
      if (!values.occupationId) {
        errors.occupationId = `${t("Occupation Required")}`;
      }
      return errors;
    },
  });
  const handleDateChange = (newDate) => {
    formik.setFieldValue(
      "dob",
      moment(newDate["$d"]).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
    );
    const year = moment(moment(newDate["$d"]).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")).year();
    const currentYear = moment().year();
    const age = currentYear - year;
    formik.setFieldValue("age", age);
  };

  const handleEdit = (parent, child,visit) => {
    if (edit[0] === parent && edit[1] === child) {
      setEdit([]);
      return;
    }
    setEdit([parent, child,visit]);
  };


  const editfood = sortedData?.flat();

  const editfood1 = sortedData2?.flat();

  const [flattenedData, setFlattenedData] = useState([]);

  const [flattenedData1, setFlattenedData1] = useState([]);

  const [selectedFoodNames, setSelectedFoodNames] = useState([]);

  const [selectedFoodNames1, setSelectedFoodNames1] = useState([]);

  useEffect(() => {
    if (sortedData) {
      setFlattenedData1(sortedData.flat());
    }
  }, [sortedData]);

  useEffect(() => {
    if (sortedData2) {
      setFlattenedData(sortedData2.flat());
    }
  }, [sortedData2]);
  useEffect(() => {
    const newFoodArray = flattenedData.map(item => ({
      foodName: item.foodName,
      foodNameArabic:item.foodNameArabic,
      foodId: item.foodId,
      quantity:item.quantity,
      measurement:item.measurement || item.measurementArabic,
      consumptionTime:item.consumptionTime,
      activities:item.activities || item.activitiesArabic,
      location:item.location || item.locationArabic,
      foodIntakeTypeId:item.foodIntakeTypeId 
    }));
    setSelectedFoodNames(newFoodArray);
  }, [flattenedData]);



  useEffect(() => {
    const newFoodArray1 = flattenedData1.map(item => ({
      foodName: item.foodName,
      foodNameArabic:item.foodNameArabic,
      foodId: item.foodId,
      quantity:item.quantity,
      measurement:item.measurement || item.measurementArabic,
      consumptionTime:item.consumptionTime,
      activities:item.activities || item.activitiesArabic,
      location:item.location || item.locationArabic,
      foodIntakeTypeId:item.foodIntakeTypeId 
    }));
    setSelectedFoodNames1(newFoodArray1);
  }, [flattenedData1]);

 const handleSubmit = (visit) => {
    dispatch(setLoading(true));
    setEdit([])
    if (visit === 1) {
      if(editfood[0]?.language === 'en'){
        axios
        .put(
          `/api/household/updateFoodIntakeResponse/participant/${data1?.participantId}/visit/1`,
          {
            description: data?.foodIntakeDescriptionResponse?.[0]?.description,
            reason: data?.foodIntakeDescriptionResponse?.[0]?.reason,
            foodIntakeValues: flattenedData1,
          },
          {
            headers: { Authorization: "Bearer " + appState?.accessToken },
          }
        )
        .then((res) => {
          axios.get(
        `/api/household/getParticipantCompleteInformation/participant/${id}`,
        {
          headers: { authorization: `Bearer ${appState?.accessToken}` },
        }
      )
      .then((res) => {
        dispatch(setLoading(false));
        setData({
           ...data1,
          questionnaireResponse: res?.data?.data?.questionnaireResponse?.map(
            (ques) => ({
              ...ques,
              response: Object.entries(JSON.parse(ques?.response)).map(
                ([question, answer]) => ({
                  question,
                  answer,
                })
              ),
            })
          ),
        });
        setQuesssionnaire(res?.data?.data?.questionnaireResponse);

        setResponse(res?.data?.data);
        // console.log(res?.data?.data?.demographicResponse?.height?.toString());
        toast.success(t("Food Intake Updated Successfully"));
      })
      .catch((err) => {
        dispatch(setLoading(false));
        dispatch(setApiErrorStatusCode(err?.response?.status));
      });
        })
        .catch(() => {
          dispatch(setLoading(false));
         });
      }else{

        axios
        .put(
          `/api/household/updateFoodIntakeResponse/participant/${data1?.participantId}/visit/1`,
          {
            description: data?.foodIntakeDescriptionResponse?.[0]?.description,
            reason: data?.foodIntakeDescriptionResponse?.[0]?.reason,
            foodIntakeValues: selectedFoodNames1,
          },
          {
            headers: {
              'X-Language': 'ar',
              authorization: `Bearer ${appState?.accessToken}`
            }
          }
        )
        .then((res) => {
          axios.get(
        `/api/household/getParticipantCompleteInformation/participant/${id}`,
        {
          headers: { authorization: `Bearer ${appState?.accessToken}` },
        }
      )
      .then((res) => {
        dispatch(setLoading(false));
        setData({
           ...data1,
          questionnaireResponse: res?.data?.data?.questionnaireResponse?.map(
            (ques) => ({
              ...ques,
              response: Object.entries(JSON.parse(ques?.response)).map(
                ([question, answer]) => ({
                  question,
                  answer,
                })
              ),
            })
          ),
        });
        setQuesssionnaire(res?.data?.data?.questionnaireResponse);

        setResponse(res?.data?.data);
        // console.log(res?.data?.data?.demographicResponse?.height?.toString());
        toast.success(t("Food Intake Updated Successfully"));
      })
      .catch((err) => {
        dispatch(setLoading(false));
        dispatch(setApiErrorStatusCode(err?.response?.status));
      });
        })
        .catch(() => {
          dispatch(setLoading(false));
       });

      }
      
    }
    if (visit === 2) {
      if(editfood1[0]?.language === 'en'){

        axios
        .put(
          `/api/household/updateFoodIntakeResponse/participant/${data1?.participantId}/visit/2`,
          {
            description: data?.foodIntakeDescriptionResponse?.[1]?.description,
            reason: data?.foodIntakeDescriptionResponse?.[1]?.reason,
            foodIntakeValues: sortedData2?.flat(),
          },
          {
            headers: { Authorization: "Bearer " + appState?.accessToken },
          }
        )
        .then((res) => {
          // dispatch(setLoading(false));
          axios.get(
            `/api/household/getParticipantCompleteInformation/participant/${id}`,
            {
              headers: { authorization: `Bearer ${appState?.accessToken}` },
            }
          )
          .then((res) => {
            console.log( res?.data?.data?.genderId)
            dispatch(setLoading(false));
            setData({
               ...data1,
              questionnaireResponse: res?.data?.data?.questionnaireResponse?.map(
                (ques) => ({
                  ...ques,
                  response: Object.entries(JSON.parse(ques?.response)).map(
                    ([question, answer]) => ({
                      question,
                      answer,
                    })
                  ),
                })
              ),
            });
            setQuesssionnaire(res?.data?.data?.questionnaireResponse);
            setResponse(res?.data?.data);
            toast.success(t("Food Intake Updated Successfully"));

            // console.log(res?.data?.data?.demographicResponse?.height?.toString());
           
          })
          .catch((err) => {
            dispatch(setLoading(false));
            dispatch(setApiErrorStatusCode(err?.response?.status));
          });
        })
        .catch(() => {
          dispatch(setLoading(false));  
        });

      }else{
     
        axios
        .put(
          `/api/household/updateFoodIntakeResponse/participant/${data1?.participantId}/visit/2`,
          {
            description: data?.foodIntakeDescriptionResponse?.[1]?.description,
            reason: data?.foodIntakeDescriptionResponse?.[1]?.reason,
            foodIntakeValues:selectedFoodNames1
            
          },
          {
            headers: {
              authorization: `Bearer ${appState?.accessToken}`,
              'X-Language': "ar",
            }
          },
        )
        .then((res) => {
          // dispatch(setLoading(false));
          axios.get(
            `/api/household/getParticipantCompleteInformation/participant/${id}`,
            {
              headers: {
                'X-Language': 'ar',
                authorization: `Bearer ${appState?.accessToken}`
              },
            }
          )
          .then((res) => {
            console.log( res?.data?.data?.genderId)
            dispatch(setLoading(false));
            setData({
               ...data1,
              questionnaireResponse: res?.data?.data?.questionnaireResponse?.map(
                (ques) => ({
                  ...ques,
                  response: Object.entries(JSON.parse(ques?.response)).map(
                    ([question, answer]) => ({
                      question,
                      answer,
                    })
                  ),
                })
              ),
            });
            setQuesssionnaire(res?.data?.data?.questionnaireResponse);
            setResponse(res?.data?.data);
            toast.success(t("Food Intake Updated Successfully"));

            // console.log(res?.data?.data?.demographicResponse?.height?.toString());
           
          })
          .catch((err) => {
            dispatch(setLoading(false));
            dispatch(setApiErrorStatusCode(err?.response?.status));
          });
        })
        .catch(() => {
          dispatch(setLoading(false));  
        });

      }
      
    }
  };

  const handleDemographics = () => {
    dispatch(setLoading(true));
    axios
      .put(
        `/api/household/updateDemographics/participant/${data1  ?.participantId}`,
        {
            isPregnant: formik?.values?.isPregnant,
            isLactating: formik?.values?.isLactating,
            age: formik?.values?.age,
            height: formik?.values?.height,
            weight: formik?.values?.weight,
            estimatedHeight: formik?.values?.estimatedHeight,
            estimatedWeight: formik?.values?.estimatedWeight,
            bodyFat: formik?.values?.bodyFat,
            genderId: formik?.values?.genderId,
            maritalStatusId: formik?.values?.maritalStatusId,
            employmentStudentStatus: formik?.values?.employmentStudentStatus,
            incomeGroupId: formik?.values?.incomeGroupId,
            academicLevelId: formik?.values?.academicLevelId,
            location: formik?.values?.location,
            nationality: formik?.values?.nationality,
            isUAECitizen: formik?.values?.isUAECitizen,
        },
        {
          headers: { Authorization: "Bearer " + appState?.accessToken ,},
        }
      )
      .then((res) => {
        toast.success(t("Demographics Updated Successfully"));
        axios.get(
          `/api/household/getParticipantCompleteInformation/participant/${id}`,
          {
            headers: { authorization: `Bearer ${appState?.accessToken}` },
          }
        )
        .then((res) => {
        
        dispatch(setLoading(false));
          setDemo([
            {
              "First Name": res?.data?.data?.firstName,
              "Family Name": res?.data?.data?.familyName,
              "Participant Code": res?.data?.data?.participantCode,
              DOB: moment(res?.data?.data?.dob).format("DD-MM-YYYY"),
              Age: res?.data?.data?.demographicResponse?.age?.toString(),
              Gender: appState?.types?.genderTypes?.find(
                (gender) =>
                  gender?.genderId ===
                  res?.data?.data?.demographicResponse?.genderId
              )?.genderName,
              Height: res?.data?.data?.demographicResponse?.height?.toString(),
              Weight: res?.data?.data?.demographicResponse?.weight?.toString(),
            },
            {
              Nationality: res?.data?.data?.demographicResponse?.nationality|| res?.data?.data?.demographicResponse?.nationalityArabic,
              "Marital Status": appState?.types?.maritalStatusTypes?.find(
                (mart) =>
                  mart?.maritalId ===
                  res?.data?.data?.demographicResponse?.maritalStatusId
              )?.maritalName,
              Pregnant: res?.data?.data?.demographicResponse?.genderId === 1
                ? "NA"
                : res?.data?.data?.demographicResponse?.isPregnant
                ? "Yes"
                : "No",
              "Breast Feeding": res?.data?.data?.demographicResponse?.genderId === 1
                ? "NA"
                : res?.data?.data?.demographicResponse?.isLactating
                ? "Yes"
                : "No",
              "Academic Level": appState?.types?.academicLevelTypes?.find(
                (aca) =>
                  aca?.academicLevelId ===
                  res?.data?.data?.demographicResponse?.academicLevelId
              )?.academicLevelName,
              Occupation: appState?.types?.occupationTypes?.find(
                (occ) => occ?.occupationCode == res?.data?.data?.occupationId
              )?.occupationName,
              Location: res?.data?.data?.demographicResponse?.location||res?.data?.data?.demographicResponse?.locationArabic,
            },
          ]);
        })
        .catch((err) => {
          dispatch(setLoading(false));
          dispatch(setApiErrorStatusCode(err?.response?.status));
        });
      })
      .catch(() => {
        dispatch(setLoading(false));
      });
  };
const [demoEdit,setDemoEdit] = useState(false)
  const handleDemoEdit = ()=>{
    setDemoEdit(!demoEdit)
  }
const [open,setOpen] = useState(false)
const handleClose = ()=>setOpen(false)
  const handleAdd = ()=>setOpen(true)

  const [location,setLocation] = useState('')
  const [mealType,setMealType] = useState('')
  const [quantity,setQuantity] = useState('')
  const [activity,setActivity] = useState('')
  const [time,setTime] = useState('')


  const handleAddFood = ()=>{

  }
const meals = [
  {
    foodIntakeTypeId:1,
    foodIntakeType:'Breakfast'
  }
]
const [searchValue,setSearchValue] = useState('')
const [foodOptions,setFoodOptions] = useState([])
useEffect(()=>{
  if (searchValue?.length >= 3){
const debounce = setTimeout(()=>{
  axios.get('/api/food/search',{
  headers: {authorization : `Bearer ${appState?.accessToken}`},
  params:{
    ...(searchValue && {search:searchValue}),
    pageSize:8217,
    pageNumber:1
  }
})
.then((res)=>{
  dispatch(setLoading(false))
  setFoodOptions(res?.data?.data?.items)
}).catch(err=>{
    dispatch(setLoading(false))
    dispatch(setApiErrorStatusCode(err?.response?.status))
    toast.error(err?.response?.data?.Errors[0])
})
},500)
return()=>{
  clearTimeout(debounce)
}
  }
  else{
    setFoodOptions([])
  }
},[searchValue])


const [nutritionvalue, SetNutritionvalue] = useState();
const [nutritionvalue1, SetNutritionvalue1] = useState();
const handleView2 = (value,name1) => {
  setOpen2(true)
  SetNutritionvalue1(value)
  SetNutritionname1(name1)
 }
  const [nutritionres1, SetNutritionres1] = useState([])
const [nutritionres, SetNutritionres] = useState([])
const [open1,setOpen1] = useState(false)
const [nutritionname, SetNutritionname] = useState('')




const [open2,setOpen2] = useState(false)
const handleView = (value,name) => {
  setOpen1(true)
  SetNutritionvalue(value)
  SetNutritionname(name)
 }


 const handleClose1 = ()=>{
  setOpen1(false)
}
const handleClose2 = ()=>{
  setOpen2(false)
}

const [nutritionname1, SetNutritionname1] = useState('')

useEffect(()=>{
  if(nutritionvalue === undefined){
    // console.log("Nutrition value is undefined");
    return;
  }else{
  
    axios
       .get(`/api/food/nutritionalComponent/${nutritionvalue}`, {
         headers: { authorization: `Bearer ${appState?.accessToken}` },
       }).then((nutritionresponse)=>{
         //console.log(nutritionresponse?.data?.data[0]?.nutrient?.name)
         SetNutritionres(nutritionresponse?.data?.data)
       }).catch((err)=>{
         console.log(err)
         
       })
  
  }
     
  
   },[nutritionvalue])
  
  
  
   useEffect(()=>{
  
    if(nutritionvalue1 === undefined){
      // console.log("Nutrition value is undefined");
      return;
    }else{
  
      axios
       .get(`/api/food/nutritionalComponent/${nutritionvalue1}`, {
         headers: { authorization: `Bearer ${appState?.accessToken}` },
       }).then((nutritionresponse)=>{
         //console.log(nutritionresponse?.data?.data[0]?.nutrient?.name)
         SetNutritionres1(nutritionresponse?.data?.data)
       }).catch((err)=>{
         console.log(err)
         
       })
  
    }
    
  
   },[nutritionvalue1])
const index = data1?.nutrientIndexResponse?.[0]?.physical_activity_index;
const index1 =data1?.nutrientIndexResponse?.[0]?.lactation_index;
const index2 = data1?.nutrientIndexResponse?.[0]?.trimester_index;
const vindex= data1?.nutrientIndexResponse?.[1]?.physical_activity_index;
const vindex1= data1?.nutrientIndexResponse?.[1]?.lactation_index;
const vindex2= data1?.nutrientIndexResponse?.[1]?.trimester_index;


useEffect(()=>{
  console.log("sdfghjn",data2?.questionnaireResponse?.[1]?.language)
},[data2?.questionnaireResponse?.[1]?.language])
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <Paper sx={{ mb: "1rem" }}>

      <Dialog
        open={open1}
        onClose={handleClose1}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
         
         <Box display={'flex'} justifyContent={'center'} alignContent={'center'} alignItems={'center'} gap={2} pb={2} > 
          <Box><Typography fontWeight={'bold'}>{nutritionname}:</Typography></Box>
          <Box><Typography >{"Nutrition Values"}</Typography></Box>
         </Box>
        </DialogTitle>
        <DialogContent >
        <Grid container columnSpacing={"1rem"} rowSpacing={"1.5rem"}>
                {nutritionres?.map((nitem, nindex) => (
                    <Grid
                      item
                      key={nindex}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Typography fontWeight={"bold"}>
                        {t(nitem?.nutrient?.name)}{" "}
                      </Typography>
                      <TextField
                        value={nitem?.quantity}
                        size="small"
                        readOnly
                        style={{ width: "65%" }}
                        sx={{
                          '.MuiInputBase-root' :{

                            pointerEvents:'none',
                            cursor:'default'
                          }
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose1}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open2}
        onClose={handleClose2}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
        <Box display={'flex'} justifyContent={'center'} alignContent={'center'} alignItems={'center'} gap={2} pb={2} > 
          <Box><Typography fontWeight={'bold'}>{nutritionname1}:</Typography></Box>
          <Box><Typography >{"Nutrition Values"}</Typography></Box>
         </Box>
        </DialogTitle>
        <DialogContent >
        <Grid container columnSpacing={"1rem"} rowSpacing={"1.5rem"}>
                {nutritionres1?.map((nitem1, nindex1) => (
                    <Grid
                      item
                      key={nindex1}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Typography fontWeight={"bold"}>
                        {t(nitem1?.nutrient?.name)}{" "}
                      </Typography>
                      <TextField
                        value={nitem1?.quantity}
                        size="small"
                        readOnly
                        style={{ width: "65%" }}
                        sx={{
                          '.MuiInputBase-root' :{
                            pointerEvents:'none',
                            cursor:'default'
                          }
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose2}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth={"sm"}
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">{t("Filters")}</DialogTitle>
        <DialogContent style={{ marginTop: "1rem" }}>
          <Grid
            container
            rowSpacing={"1rem"}
            columnSpacing={"1rem"}
            paddingTop={"0.5rem"}
          >
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Meal Type")}</InputLabel>
                <Select value={mealType} onChange={(e)=>{setMealType(e.target.value)}} fullWidth size="small" label={t("Meal Type")}>
                <MenuItem value={''}>{t("Select")}</MenuItem>
                  {appState?.types?.genderTypes?.map((city) => (
                    <MenuItem value={city?.genderId}>
                      {t(`${city?.genderName}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
                  <Autocomplete
                    size="small"
                    id="combo-box-demo"
                    // value={interviewerValue}
                    // onChange={(event, newValue) => {
                    //   setInterviewerValue(newValue);
                    // }}
                    // options={interviewOptions}
                    isOptionEqualToValue={(option, value) =>
                      option.label === value?.label
                    }
                    sx={{ width: "100%" }}
                    renderInput={(params) => (
                      <TextField {...params} label={t("Select Food Name")} />
                    )}
                  />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
            <TextField size="small" value={location} onChange={(e)=>{setLocation(e.target.value)}} fullWidth label={t("Location")}/>
            </Grid>
            <Grid item xs={12} md={6}>
            <TextField size="small" value={location} onChange={(e)=>{setLocation(e.target.value)}} fullWidth label={t("Location")}/>
            </Grid>
            <Grid item xs={12} md={6}>
            <TextField size="small" value={location} onChange={(e)=>{setLocation(e.target.value)}} fullWidth label={t("Location")}/>
            </Grid>
            <Grid item xs={12} md={6}>
            <TextField size="small" value={location} onChange={(e)=>{setLocation(e.target.value)}} fullWidth label={t("Location")}/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button onClick={handleAddFood} autoFocus>
            {t("Submit")}
          </Button>
        </DialogActions>
      </Dialog>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          borderBottom={"1px solid #CECECE"}
          padding={"0px 10px"}
          alignItems={"center"}
        >
          <Typography
            fontWeight={"bold"}
            fontSize={"1.3rem"}
            style={{ padding: "10px" }}
            // style={{ textDecoration: "underline" }}
          >
            {t("Participant Details")}
          </Typography>
          <Box display={"flex"} justifyContent={"space-between"} gap={"10px"}>
            <Button
              variant="outlined"
              onClick={() => {
                handleClick();
              }}
            >
              {t("PDF")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                createDownloadData();
              }}
            >
              {t("CSV")}
            </Button>
          </Box>
        </Box>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant={downLg ? "scrollable" : "fullWidth"}
              scrollButtons
              selectionFollowsFocus
            >
              <Tab label={t("Consent")} {...a11yProps(0)} />
              <Tab label={t("Demographics")} {...a11yProps(1)} />
              <Tab label={t("Survey Response")} {...a11yProps(2)} />
              <Tab label={t("Food Intake")} {...a11yProps(3)} />
              <Tab label={t("Nutrients")} {...a11yProps(3)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            {/* <img src={`data:image/jpeg;base64, ${data1?.participantConsent?.signature.replace(
                  /\n/g,
                  ""
                )}`} alt="Signature" style={{width:'100%'}}/> */}
            {/* <img src={`data:image/jpeg;base64, ${data?.participantConsent?.consent}`} alt="" /> */}
            {data1?.participantConsent?.consent ? (
              <iframe
                style={{
                  width: "100%",
                  height: "calc(100vh - 220px)",
                  maxHeight: "35rem",
                }}
                src={`data:application/pdf;base64,${data1?.participantConsent?.consent?.replace(
                  /\n/g,
                  ""
                )}`}
                type="application/pdf"
              />
            ) : (
              t("Consent not available")
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <form onSubmit={formik.handleSubmit}>
              <Grid
                container
                columnSpacing={"1rem"}
                rowSpacing={"1.5rem"}
                style={{
                  width: "100%",
                  height: "calc(100vh - 220px)",
                  overflow: "auto",
                  maxHeight: "35rem",
                }}
                paddingRight={{lg:"10px",sm:"10px",xs:"10px"}}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                 
                >
                  <Typography fontWeight={"bold"}>
                    {t("First Name")}{" "}
                  </Typography>
                  <TextField
                    value={formik?.values?.firstName}
                    name="firstName"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.firstName} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("Family Name")}{" "}
                  </Typography>
                  <TextField
                    value={formik?.values?.familyName}
                    name="familyName"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.familyName} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("Participant Code")}{" "}
                  </Typography>
                  <TextField
                    value={formik?.values?.participantCode}
                    name="participantCode"
                    onChange={formik.handleChange}
                    size="small"
                    disabled
                    style={{ width: "65%" }}
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.participantCode} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {" "}
                    {t("Date of Birth")}{" "}
                  </Typography>

                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        size="small"
                        //value={fromdate}
                         disabled
                        // disabled={!demoEdit}
                        style={{ width: "65%" }}
                        disableFuture
                        fullWidth
                        name={"dob"}
                        format="DD/MM/YYYY"
                        value={dayjs(formik.values.dob) || null}
                        onChange={handleDateChange}
                        onBlur={formik.handleBlur}
                        slotProps={{
                          textField: {
                            size: "small",
                            error:
                              formik.touched.dob && formik.errors.dob
                                ? true
                                : false,
                            helperText:
                              formik.touched.dob &&
                              formik.errors.dob &&
                              formik.errors.dob,
                          },
                        }}
                        renderInput={(params) => (
                          <TextField
                            // disabled={page==='view'}
                            error={
                              formik.touched.dob && formik.errors.dob
                                ? true
                                : false
                            }
                            helperText={
                              formik.touched.dob &&
                              formik.errors.dob &&
                              formik.errors.dob
                            }
                            fullWidth
                            style={{ width: "100%" }}
                            name="dob"
                            // value={formik.values.dob}
                            sx={{
                              "& .MuiInputBase-input": {
                                // height: "10px",
                              },
                              width: "100%",
                            }}
                            {...params}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Age")}</Typography>
                  <TextField
                    value={formik?.values?.age}
                    name="age"
                    onChange={formik.handleChange}
                    size="small"
                    disabled
                    style={{ width: "65%" }}
                  />
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}> {t("Gender")}</Typography>

                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <Select
                      size="small"
                      name={"genderId"}
                      value={formik?.values?.genderId}
                      onChange={formik.handleChange}
                      disabled={!demoEdit}
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      {appState?.types?.genderTypes?.map((gender, index) => (
                        <MenuItem key={index} value={gender?.genderId}>
                          {gender?.genderName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}> {t("Income")}</Typography>
                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <Select
                      size="small"
                      name={"incomeGroupId"}
                      value={formik?.values?.incomeGroupId}
                      onChange={formik.handleChange}
                      disabled={!demoEdit}
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      {appState?.types?.incomeGroups?.map((income, index) => (
                        <MenuItem key={index} value={income?.id}>
                          {income?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Height")} </Typography>
                  <TextField
                    value={formik?.values?.height}
                    name="height"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                     disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.height} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Weight")} </Typography>
                  <TextField
                    value={formik?.values?.weight}
                    name="weight"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                   disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.weight} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Height (Estimated)")} </Typography>
                  <TextField
                    value={formik?.values?.estimatedHeight}
                    name="estimatedHeight"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                      disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.height} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Weight (Estimated)")} </Typography>
                  <TextField
                    value={formik?.values?.estimatedWeight}
                    name="estimatedWeight"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                     disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.weight} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Body Fat")} </Typography>
                  <TextField
                    value={formik?.values?.bodyFat}
                    name="bodyFat"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.weight} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("Nationality")}{" "}
                  </Typography>
                  <TextField
                    value={formik?.values?.nationality||formik?.values?.nationalityArabic}
                    name="nationality"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled={!demoEdit}
                  />
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.weight} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("UAE citizen ?")}{" "}
                  </Typography>
                  {/* <TextField
                    value={formik?.values?.isUAECitizen ? 'Yes' : 'No'}
                    name="nationality"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled={!demoEdit}
                  /> */}
                   <FormControl fullWidth size="small" style={{ width: "65%" }}>
                  <Select
                      size="small"
                      name={"isUAECitizen"}
                      value={formik?.values?.isUAECitizen}
                      onChange={formik.handleChange}
                      disabled={!demoEdit}
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      <MenuItem value={true}>{t("Yes")}</MenuItem>
                      <MenuItem value={false}>{t("No")}</MenuItem>

                    </Select>
                    </FormControl>
                  {/* <Typography style={{ width: "65%" }}>{data?.demographicResponse?.weight} </Typography> */}
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("Marital Status")}{" "}
                  </Typography>

                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <Select
                      size="small"
                      name={"maritalStatusId"}
                      value={formik?.values?.maritalStatusId}
                      onChange={formik.handleChange}
                      disabled={!demoEdit}
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      {appState?.types?.maritalStatusTypes?.map(
                        (mar, index) => (
                          <MenuItem key={index} value={mar?.maritalId}>
                            {mar?.maritalName}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                {formik?.values?.maritalStatusId == 1 ||
                formik?.values?.genderId == 1 ? (
                  ""
                ) : (
                  <Grid
                    item
                    sm={12}
                    md={6}
                    lg={4}
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    width={"100%"}
                  >
                    <Typography fontWeight={"bold"}>
                      {t("Pregnancy")}
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                      style={{ width: "65%" }}
                    >
                      <Select
                        size="small"
                        name={"isPregnant"}
                        value={formik?.values?.isPregnant}
                        onChange={formik.handleChange}
                        disabled={!demoEdit}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        <MenuItem value={true}>{t("Yes")}</MenuItem>
                        <MenuItem value={false}>{t("No")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {formik?.values?.maritalStatusId == 1 ||
                formik?.values?.genderId == 1 ? (
                  ""
                ) : (
                  <Grid
                    item
                    sm={12}
                    md={6}
                    lg={4}
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    width={"100%"}
                  >
                    <Typography fontWeight={"bold"}>
                      {t("Breast Feeding")}
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                      style={{ width: "65%" }}
                    >
                      <Select
                        size="small"
                        name={"isLactating"}
                        value={formik?.values?.isLactating}
                        onChange={formik.handleChange}
                        disabled={!demoEdit}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        <MenuItem value={true}>{t("Yes")}</MenuItem>
                        <MenuItem value={false}>{t("No")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>
                    {t("Academic Level")}
                  </Typography>

                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <Select
                      size="small"
                      name={"academicLevelId"}
                      value={formik?.values?.academicLevelId}
                      onChange={formik.handleChange}
                      disabled={!demoEdit}
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      {appState?.types?.academicLevelTypes?.map((ac, index) => (
                        <MenuItem key={index} value={ac?.academicLevelId}>
                          {ac?.academicLevelName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Occupation")}</Typography>

                  <FormControl fullWidth size="small" style={{ width: "65%" }}>
                    <Select
                      size="small"
                      name={"occupationId"}
                      value={formik?.values?.occupationId}
                      onChange={formik.handleChange}
                      disabled
                    >
                      <MenuItem value="">{t("Select")}</MenuItem>
                      {appState?.types?.occupationTypes?.map((oc, index) => (
                        <MenuItem key={index} value={oc?.occupationId}>
                          {oc?.occupationName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  sm={12}
                  md={6}
                  lg={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Typography fontWeight={"bold"}>{t("Location")}</Typography>
                  <TextField
                    value={formik?.values?.location||formik?.values?.locationArabic}
                    name="location"
                    onChange={formik.handleChange}
                    size="small"
                    style={{ width: "65%" }}
                    disabled={!demoEdit}
                  />
                </Grid>
              </Grid>
              <Box
                display={"flex"}
                justifyContent={"center"}
                marginTop={"20px"}
                gap={'10px'}
                
              >

                {appState?.roleinfo
?.role === 'Recruiter'||appState?.roleinfo
?.role === 'Administrator'|| appState?.roleinfo
?.role === 'Administrator'  && appState?.roleinfo
?.role === 'Recruiter'?<></>:<><Button variant="contained" style={{'minWidth':'110px'}} onClick={()=>{handleDemoEdit()}}>{t('Edit')}</Button>
                
                <Button
                  variant="contained"
                  onClick={() => {
                    handleDemographics();
                  }}
                  style={{'minWidth':'110px'}}
                >
                  {t('Submit')}
                </Button>
                
                
                </>}
               
               
                
              </Box>
            </form>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
          <Box
              style={{
                width: "100%",
                height: "calc(100vh - 220px)",
                overflow: "auto",
                maxHeight: "35rem",
              }}
            >
{data1?.questionnaireResponse?.map(ress => {
          const qdata1 = ress?.response;
          const qdata1response = JSON.parse(qdata1);

          const qdata2 = ress?.responseArabic;
          const qdata2response = JSON.parse(qdata2)

          
          const lang = ress?.language;
          // console.log(ress?.language)
          if(lang === null || undefined){
            var finalang = 'en';
          }else{
            var finalang = ress?.language;
          }
   

          if (finalang === 'en') {
            return (
              <div >
                  <Typography
                    fontWeight={"bold"}
                    marginBottom={"1rem"}
                    marginTop={"1rem"}
                    fontSize={"1.4rem"}
                  >
                    {t("Visit Number")} : {ress.visitNumber}
                  </Typography>


                  
                  {Object.entries(qdata1response||qdata2response).map(([key, value]) => (
                      


                             <div
                                
                                style={{
                                  border: "1px solid #CECECE",
                                  marginBottom: "10px",
                                  padding: "10px",
                                }}
                              >
                                <Typography>
                                  {t("Question")} : {key}
                                </Typography>
                                <Typography
                                  margin={"10px 0px 10px 0px"}
                                  fontWeight={"bold"}
                                >
                                  {t("Answer")} : {value}
                                </Typography>
                              </div>
        ))}
                
                </div>
            )
             
        
          } else  {
            return (
              <div >
                  <Typography
                    fontWeight={"bold"}
                    marginBottom={"1rem"}
                    marginTop={"1rem"}
                    fontSize={"1.4rem"}
                  >
                    {t("Visit Number")} : {ress?.visitNumber}
                  </Typography>


                  
                  {Object.entries(qdata2response).map(([key, value]) => (
                      


                             <div
                                
                                style={{
                                  border: "1px solid #CECECE",
                                  marginBottom: "10px",
                                  padding: "10px",
                                }}
                              >
                                <Typography>
                                  {t("Question")} : {key}
                                </Typography>
                                <Typography
                                  margin={"10px 0px 10px 0px"}
                                  fontWeight={"bold"}
                                >
                                  {t("Answer")} : {value}
                                </Typography>
                              </div>
        ))}
                
                </div>
            ); 
          }
        })}
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Grid
              style={{
                width: "100%",
                height: "calc(100vh - 220px)",
                overflow: "auto",
                maxHeight: "35rem",
              }}
              // padding={"20px 0px 0px 30px"}
            >
              <Typography
                fontSize={"1.2rem"}
                fontWeight={"bold"}
                textAlign={"center"}
                marginBottom={"1rem"}
                style={{ textDecoration: "underline" }}
              >
                {t("Visit Number 1")}
              </Typography>
              <Box style={{ border: "1px solid black", padding: "10px" }}>
                {sortedData?.map((group, index) => (
                  <div style={{ marginBottom: "20px", fontSize: "1.3rem" }}>
                    <center
                      style={{
                        marginBottom: "10px",
                        textDecoration: "underline",
                      }}
                    >
                      <span>
                        <b>{t(group[0]?.foodIntakeType)}</b>
                      </span>
                    </center>
                    <Grid
                      display={"flex"}
                      flexDirection={"row"}
                      alignItems={"center"}
                      flexWrap={"wrap"}
                    >
                      {group?.map((food, index2) => (
                        <Grid
                          width={downLg ? "100%" : "50%"}
                          marginBottom={"30px"}
                        >
                          <Typography display={'flex'}  alignItems={'center'}>
                            <b>{t("Food Name")}</b> :{" "} 
                            
                            {edit[0] === group[0]?.foodIntakeType &&
                            edit[1] === index2&& edit[2]===food.visitNumber ? (
                              
                    <Autocomplete
                    size="small"
                    id="combo-box-demo"
                    value={searchValue||food?.foodName ? '' : foodOptions?.find((f)=>(f.name===food?.foodName  || ''))}
                    onInputChange={(e, v) => {
                      setSearchValue(v)
                  }}
                    getOptionLabel={(item) => item.name || food?.foodName }
                    options={foodOptions}
                    isOptionEqualToValue={(option, value) =>
                        option?.name  === value?.name
                    }
                    onChange={(e, v) => {
                             setSortedData(
                                    sortedData?.map((it) =>
                                      it.map((gg, index) => ({
                                        ...gg,
                                         foodName:
                              index === index2 &&
                              edit[0] === gg?.foodIntakeType &&
                              gg?.foodName != null 
                                ? v.name
                                : gg.foodName,
                                foodNameArabic:
                                index === index2 &&
                                edit[0] === gg?.foodIntakeType &&
                                gg?.foodNameArabic != null 
                                  ? v.name
                                  : gg.foodNameArabic,
                                            measurement: index === index2 &&
                                            edit[0] === gg?.foodIntakeType
                                              ? v.measurementName
                                              : gg.measurement,
                                              foodId:index === index2 &&
                                              edit[0] === gg?.foodIntakeType
                                                ? v.foodId
                                                : gg.foodId
                                      }))
                                    )
                                  );
                             
                                  setSearchValue('')
                    }}
                    sx={{ width: "50%" }}
                    renderInput={(params) => (
                      <TextField {...params} label={t("Search Food Item")} />
                    )}
                  />
                            ) : (
                             <>{food?.foodName || food?.foodNameArabic}</>
                            )}
                          </Typography>
                          {/* <Typography>
                            <b>{t("Food Id")}</b> : {food?.foodId}
                          </Typography> */}
                          <Typography display={'flex'}  alignItems={'center'}>
                            <b>{t("Quantity")}</b> :{" "}
                            {edit[0] === group[0]?.foodIntakeType &&
                            edit[1] === index2 && edit[2]===food.visitNumber ? (
                              <TextField
                                size="small"
                                value={food?.quantity}
                                onChange={(e) => {
                                  setSortedData(
                                    sortedData?.map((it) =>
                                      it.map((gg, index) => ({
                                        ...gg,
                                        quantity:
                                          index === index2 &&
                                          group[0]?.foodIntakeType ===
                                            gg.foodIntakeType
                                            ? e.target.value
                                            : gg.quantity,
                                      }))
                                    )
                                  );
                                }}
                              />
                            ) : (
                              food?.quantity
                            )}{" "}
                            {food?.measurement||food?.measurementArabic}
                          </Typography>
                          <Typography>
                            <b>{t("Location")}</b> :{" "}
                            {edit[0] === group[0]?.foodIntakeType &&
                            edit[1] === index2 && edit[2]===food.visitNumber? (
                              <TextField
                                size="small"
                                value={food?.location || food?.locationArabic}
                                onChange={(e) => {
                                  setSortedData(
                                    sortedData?.map((it) =>
                                      it.map((gg, index) => ({
                                        ...gg,
                                        location:
                                          index === index2 &&
                                          group[0]?.foodIntakeType ===
                                            gg.foodIntakeType
                                            ? e.target.value
                                            : gg.location,
                                      }))
                                    )
                                  );
                                }}
                              />
                            ) : (
                              food?.location||food?.locationArabic
                            )}
                          </Typography>
                          <Typography>
                            <b>{t("Activities")}</b> :{" "}
                            {edit[0] === group[0]?.foodIntakeType &&
                            edit[1] === index2 && edit[2]===food.visitNumber? (
                              <TextField
                                size="small"
                                value={food?.activities ||food?.activitiesArabic}
                                onChange={(e) => {
                                  setSortedData(
                                    sortedData?.map((it) =>
                                      it.map((gg, index) => ({
                                        ...gg,
                                        activities:
                                          index === index2 &&
                                          group[0]?.foodIntakeType ===
                                            gg.foodIntakeType
                                            ? e.target.value
                                            : gg.activities,
                                      }))
                                    )
                                  );
                                }}
                              />
                            ) : (
                              food?.activities||food?.activitiesArabic
                            )}
                          </Typography>
                          {food?.consumptionTime != null ? (
                            <Typography>
                              <b>{t("Consumption Time")}</b> :{" "}
                              {moment(food?.consumptionTime).format(
                                "DD-MM-YYYY  HH:mm A"
                              )}
                            </Typography>
                          ) : (
                            ""
                          )}

                          {/* <Button
                            onClick={() => {
                              handleEdit(group[0]?.foodIntakeType, index2,food.visitNumber);
                            }}
                            variant="contained"
                          >
                            {t('Edit')}
                          </Button> */}
                          { appState?.roleinfo
?.role === 'Recruiter' ||appState?.roleinfo
?.role === 'Administrator' || appState?.appState?.roleinfo
?.role === 'Administrator' & appState?.roleinfo
?.role === 'Recruiter'?<></>:<><Button
                            onClick={() => {
                              handleEdit(group[0]?.foodIntakeType, index2,food.visitNumber);
                            }}
                            variant="contained"
                          >
                            {t('Edit')}
                          </Button></>}
                          <Button
                            onClick={() => {
                              handleView(food?.foodId,food?.foodName||food?.foodNameArabic)
                            }}
                            variant="contained"
                            sx={{marginLeft:'1.5rem'}}
                          >
                            {t('View')}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                ))}
                
                <Box>
  {data1?.foodIntakeDescriptionResponse?.length > 0 ? (
    <>
      <Typography fontSize={"1.2rem"}>
        <b>{t("Description")}</b> :{" "}
        {data1.foodIntakeDescriptionResponse[0].language === 'en'
          ? data1.foodIntakeDescriptionResponse[0].description
          : data1.foodIntakeDescriptionResponse[0].descriptionArabic}
      </Typography>
      {
                         (data1?.foodIntakeDescriptionResponse[0]?.description  === "Usual")||(data1?.foodIntakeDescriptionResponse[0]?.descriptionArabic) === "المعتاد"?<></>:<>  <Typography fontSize={"1.2rem"}>
                          <b>{t("Reason")}</b> :
                          
                          {data1?.foodIntakeDescriptionResponse[0]?.language === 'en' ? (data1?.foodIntakeDescriptionResponse[0]?.reason):(data1?.foodIntakeDescriptionResponse[0]?.reasonArabic)}
                        </Typography></>
                        }
    </>
  ) : (
    <Typography fontSize={"1.2rem"}>No description available</Typography>
  )}
</Box>

                  
                
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  gap={'10px'}
                >
                {/* <Button
                    variant="contained"
                    onClick={() => {
                      handleAdd();
                    }}
                  >
                    Add Food Item
                  </Button> */}
                <Button
                    variant="contained"
                    onClick={() => {
                      handleSubmit(1);
                    }}
                    color="green"
                  >
                    {t('Submit')}
                  </Button>
                  </Box>
              </Box>
              {sortedData2?.length ? (
                <Box key={sortedData2}>
                  <Typography
                    fontSize={"1.2rem"}
                    fontWeight={"bold"}
                    textAlign={"center"}
                    marginBottom={"1rem"}
                    style={{ textDecoration: "underline" }}
                    marginTop={"1rem"}
                  >
                    {t("Visit Number 2")}
                  </Typography>
                  <Box style={{ border: "1px solid black", padding: "10px" }}>
                    {sortedData2.map((group, index) => (
                      <div style={{ marginBottom: "20px", fontSize: "1.3rem" }}>
                        <center
                          style={{
                            marginBottom: "10px",
                            textDecoration: "underline",
                          }}
                        >
                          <span>
                            <b>{t(group[0]?.foodIntakeType)}</b>
                          </span>
                        </center>
                        <Grid
                          display={"flex"}
                          flexDirection={"row"}
                          alignItems={"center"}
                          flexWrap={"wrap"}
                        >
                          {group.map((food, index2) => (
                            <Grid
                              width={downLg ? "100%" : "50%"}
                              marginBottom={"30px"}
                            >
                              <Typography display={'flex'} alignItems={'center'}>
                                <b>{t("FoodName")}</b> :{" "} 
                                
                                {edit[0] === group[0]?.foodIntakeType &&
                                edit[1] === index2 && edit[2]===food?.visitNumber? (
                                  <Autocomplete
                    size="small"
                    id="combo-box-demo"
                    value={searchValue ? '': foodOptions?.find((f)=>(f.name===food?.foodName || ''))}
                    onInputChange={(e, v) => {
                      setSearchValue(v)
                  }}
                    getOptionLabel={(item) => item.name || food?.foodName || food?.foodNameArabic || '' }
                    options={foodOptions}
                    isOptionEqualToValue={(option, value) =>
                        option?.name  === value?.name
                    }
                    onChange={(e, v) => {
                      setSortedData2(
                        sortedData2?.map((it) =>
                          it.map((gg, index) => ({
                            ...gg,
                            foodName:
                              index === index2 &&
                              edit[0] === gg?.foodIntakeType &&
                              gg?.foodName != null 
                                ? v.name
                                : gg.foodName,
                                foodNameArabic:
                                index === index2 &&
                                edit[0] === gg?.foodIntakeType &&
                                gg?.foodNameArabic != null 
                                  ? v.name
                                  : gg.foodNameArabic,
                                measurement: index === index2 &&
                                edit[0] === gg?.foodIntakeType
                                  ? v.measurementName
                                  : gg.measurement,
                                  foodId:index === index2 &&
                                  edit[0] === gg?.foodIntakeType
                                    ? v.foodId
                                    : gg.foodId
                          }))
                        )
                      );
                                  setSearchValue('')
                    }}
                    sx={{ width: "50%" }}
                    renderInput={(params) => (
                      <TextField {...params} label={t("Search Food Item")} />
                    )}
                  />
                                ) : (
                                  <>{food?.foodName || food?.foodNameArabic}</>
                                )}
                              </Typography>
                              
                              <Typography>
                                <b>{t("Quantity")}</b> :{" "}
                                {edit[0] === group[0]?.foodIntakeType &&
                                edit[1] === index2 && edit[2]===food.visitNumber? (
                                  <TextField
                                    size="small"
                                    value={food?.quantity}
                                    onChange={(e) => {
                                      setSortedData2(
                                        sortedData2?.map((it) =>
                                          it.map((gg, index) => ({
                                            ...gg,
                                            quantity:
                                              index === index2 &&
                                              group[0]?.foodIntakeType ===
                                                gg.foodIntakeType
                                                ? e.target.value
                                                : gg.quantity,
                                          }))
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  food?.quantity
                                )}{" "}
                                {food?.measurement || food?.measurementArabic}
                              </Typography>
                              <Typography>
                                <b>{t("Location")}</b> :{" "}
                                {edit[0] === group[0]?.foodIntakeType &&
                                edit[1] === index2 && edit[2]===food.visitNumber? (
                                  <TextField
                                    size="small"
                                    value={food?.location}
                                    onChange={(e) => {
                                      setSortedData2(
                                        sortedData2?.map((it) =>
                                          it.map((gg, index) => ({
                                            ...gg,
                                            location:
                                              index === index2 &&
                                              group[0]?.foodIntakeType ===
                                                gg.foodIntakeType
                                                ? e.target.value
                                                : gg.location,
                                          }))
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  food?.location || food?.locationArabic
                                )}
                              </Typography>
                              <Typography>
                                <b>{t("Activities")}</b> :{" "}
                                {edit[0] === group[0]?.foodIntakeType &&
                                edit[1] === index2 && edit[2]===food.visitNumber? (
                                  <TextField
                                    size="small"
                                    value={food?.activities}
                                    onChange={(e) => {
                                      setSortedData2(
                                        sortedData2?.map((it) =>
                                          it.map((gg, index) => ({
                                            ...gg,
                                            activities:
                                              index === index2 &&
                                              group[0]?.foodIntakeType ===
                                                gg.foodIntakeType
                                                ? e.target.value
                                                : gg.activities,
                                          }))
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  food?.activities || food?.activitiesArabic
                                )}
                              </Typography>
                              {food?.consumptionTime != null ? (
                                <Typography>
                                  <b>{t("Consumption Time")}</b> :{" "}
                                  {moment(food?.consumptionTime).format(
                                    "DD-MM-YYYY  HH:mm A"
                                  )}
                                </Typography>
                              ) : (
                                ""
                              )}

{ appState?.roleinfo
?.role === 'Recruiter' ||appState?.roleinfo
?.role === 'Administrator' || appState?.appState?.roleinfo
?.role === 'Administrator' & appState?.roleinfo
?.role === 'Recruiter'?<></>:<><Button
                                onClick={() => {
                                  handleEdit(group[0]?.foodIntakeType, index2,food.visitNumber);
                                }}
                                variant="contained"
                              >
                                {t('Edit')}
                              </Button></>}
                              
                                <Button
                              onClick={() => {
                                handleView2(food?.foodId,food?.foodName||food?.foodNameArabic)
                              }}
                              variant="contained"
                              sx={{marginLeft:'1.5rem'}}
                            >
                              {t('View')}
                            </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    ))}
                   
                       <Box>
                       {data1?.foodIntakeDescriptionResponse?.length > 0 ? (
                        <>
                        <Typography fontSize={"1.2rem"}>
                          <b>{t("Description")}</b> :{" "}
                        

{data1?.foodIntakeDescriptionResponse[1]?.language === 'en' ? (data1?.foodIntakeDescriptionResponse[1]?.description):(data1?.foodIntakeDescriptionResponse[1]?.descriptionArabic)}
                        </Typography>


                        {
                          (data1?.foodIntakeDescriptionResponse[1]?.description==="Usual")||(data1?.foodIntakeDescriptionResponse[1]?.descriptionArabic) ==="المعتاد"?<></>:<>  <Typography fontSize={"1.2rem"}>
                          <b>{t("Reason")}</b>:
                          
                          {data1?.foodIntakeDescriptionResponse[1]?.language === 'en' ? (data1?.foodIntakeDescriptionResponse[1]?.reason):(data1?.foodIntakeDescriptionResponse[1]?.reasonArabic)}
                        </Typography></>
                        }
                      
                        </>
  ) : (
    <Typography fontSize={"1.2rem"}>No description available</Typography>
  )}
                      </Box> 
                      

                      { appState?.loginInfo?.role === 'Recruiter' ||appState?.loginInfo?.role === 'Administrator' || appState?.appState?.loginInfo?.role === 'Administrator' & appState?.loginInfo?.role === 'Recruiter'?
                      
                      <></>:<>
                        <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                <Button
                    variant="contained"
                    onClick={() => {
                      handleSubmit(2);
                    }}
                    color="green"
                  >
                    {t('Submit')}
                  </Button>
                  </Box>
                      </>}
                 
                  </Box>
                </Box>
              ) : (
                ""
              )}
            </Grid>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Box p={1}
            
              style={{
                width: "100%",
                height: "calc(100vh - 220px)",
                overflow: "auto",
                maxHeight: "35rem",
                
              }}
            >
              <Box display={'flex'} justifyContent={'space-around'}>
              <Box>
              <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("Visit Number")} :{" "}
                {data1?.nutrientIndexResponse?.[0]?.visitNumber}
              </Typography>
              <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("BMI Value ")} : {data1?.nutrientIndexResponse?.[0]?.bmiValue}
              </Typography>
              <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("EER Value")} : {data1?.nutrientIndexResponse?.[0]?.eerValue}
                
              </Typography>
              
  <Box sx={{display:'flex',alignItems:'center',justifyContent:'flex-start'}}>
              <Box>
              <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("Physical Activity Level")}  :
              </Typography></Box>
              <Box><Typography fontWeight={"bold"} >{index === 1 && <p>
                  {t("Sedentary")}</p>}
            {index === 2 && <p> {t("Low active")}</p>}
            {index === 3 && <p>{t("active")}</p>}
            {index === 4 && <p> {t("very active")}</p>}</Typography></Box>
              </Box>


{
  gender ===2?<>
 <Box sx={{display:'flex',alignItems:'center',justifyContent:'flex-start'}}>
                <Box><Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("Lactation Period")} :
              </Typography></Box>
                <Box> 
                  <Typography fontWeight={"bold"}>{index1 === 1 && <p>{t("0–6 Months")}</p>}
                  {index1 === 2 && <p>  {t("6–12 Months")}</p>}</Typography>
           </Box>
              </Box>

  </>:<>{''}
  </>
}

       {
        gender === 2?<><Box sx={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
        <Box><Typography marginBottom={"2rem"} fontWeight={"bold"}>
                      {t("Pregnancy")} :
                    </Typography></Box>
        <Box><Typography  fontWeight={"bold"}> {index2 === 1 && <p>{t("1st trimester")}</p>}
                  {index2 === 2 && <p>{t("2nd trimester")}</p>}
                  {index2 === 3 && <p>{t("3rd trimester")}</p>}</Typography></Box>
      </Box></>:<></>
       }      

             
              
              </Box>
              {data1?.nutrientValueResponse?.filter(
                (nutr) => nutr.visitNumber === 2
              )?.length ? (
                  <Box>
                  <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                    {t("Visit Number")} :{" "}

                    {data1?.nutrientIndexResponse?.[1]?.visitNumber}
                  </Typography>
                  <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                    {t("BMI Value ")} :{" "}
                    {data1?.nutrientIndexResponse?.[1]?.bmiValue}
                  </Typography>
                  <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                    {t("EER Value")} :{" "}
                    {data1?.nutrientIndexResponse?.[1]?.eerValue}
                  </Typography>


                  <Box sx={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
                    <Box> <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("Physical Activity Level")} :
              </Typography></Box>
                    <Box><Typography fontWeight={"bold"}>{vindex === 1 && <p>
                  {t("Sedentary")}</p>}
            {vindex === 2 && <p> {t("Low active")}</p>}
            {vindex === 3 && <p>{t("active")}</p>}
            {vindex === 4 && <p> {t("very active")}</p>}</Typography></Box>
                  </Box>
                 
       {
        gender === 2?<>
        <Box sx={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
                  <Box> <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                {t("Lactation Period")} :
              </Typography></Box>
                  <Box><Typography fontWeight={"bold"}> {vindex1 === 1 && <p>{t("0–6 Months")}</p>}
                  {vindex1 === 2 && <p>  {t("6–12 Months")}</p>}</Typography>
            </Box>
                 </Box>
        </>:<></>
    }
                 {
                  gender === 2?<>
                   <Box sx={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
              <Box> <Typography marginBottom={"2rem"} fontWeight={"bold"}>
                {t("Pregnancy")} :
              </Typography></Box>
              <Box> <Typography fontWeight={"bold"}> {vindex2 === 1 && <p>{t("1st trimester")}</p>}
            {vindex2 === 2 && <p>{t("2nd trimester")}</p>}
            {vindex2 === 3 && <p>{t("3rd trimester")}</p>}</Typography></Box>
             </Box>
                  </>:<></>
                 }
             
            
             
                    
                  </Box>
                  
              ) : (
                ""
              )}
              {data1?.nutrientValueResponse?.filter(
                (nutr) => nutr.visitNumber === 2
              )?.length ? (
                <Box>
                  <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                    {t(" Average BMI Value ")} :{Bmiaverage}
                  </Typography>
                  <Typography marginBottom={"1rem"} fontWeight={"bold"}>
                    {t(" Average EER Value ")} :{EEraverage}
                  </Typography>
                  </Box>
              ) : (
                ""
              )}
                </Box>

              <Typography
                marginBottom={"2rem"}
                fontWeight={"bold"}
                textAlign={"center"}
                fontSize={"1.2rem"}
                style={{ textDecoration: "underline" }}
              >
                {t("Visit Number 1")}
              </Typography>
              <Grid container columnSpacing={"1rem"} rowSpacing={"1.5rem"}>
                {data1?.nutrientValueResponse
                  ?.filter((nutr) => nutr.visitNumber === 1)
                  ?.map((nutrients, index) => (
                    <Grid
                      item
                      key={index}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Typography fontWeight={"bold"}>
                        {t(nutrients?.nutrientName||nutrients?.nutrientNameArabic)}{" "}
                      </Typography>
                      <TextField
                        value={nutrients?.nutrientValue}
                        size="small"
                        readOnly
                        style={{ width: "65%" }}
                        sx={{
                          '.MuiInputBase-root' :{
                            pointerEvents:'none',
                            cursor:'default'
                          }
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
              
              <Typography
                marginBottom={"2rem"}
                fontWeight={"bold"}
                marginTop={"1rem"}
                textAlign={"center"}
                fontSize={"1.2rem"}
                style={{ textDecoration: "underline" }}
              >
                {data1?.nutrientValueResponse?.filter(
                  (nutr) => nutr.visitNumber === 2
                )?.length
                  ? t("Visit Number 2")
                  : ""}
              </Typography>
              <Grid container columnSpacing={"1rem"} rowSpacing={"1.5rem"}>
                {data1?.nutrientValueResponse
                  ?.filter((nutr) => nutr.visitNumber === 2)
                  ?.map((nutrients, index) => (
                    <Grid
                      item
                      key={index}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Typography fontWeight={"bold"}>
                        {t(nutrients?.nutrientName ||nutrients?.nutrientNameArabic)}{" "}
                      </Typography>
                      <TextField
                        value={nutrients?.nutrientValue}
                        sx={{
                          '.MuiInputBase-root' :{
                            pointerEvents:'none',
                            cursor:'default'
                          }
                        }}
                        size="small"
                        style={{ width: "65%" }}
                      />
                    </Grid>
                  ))}
              </Grid>
              
              {data1?.nutrientValueResponse?.filter(
                (nutr) => nutr?.visitNumber === 2
              )?.length ? (
                <>
                  <Typography
                    marginBottom={"2rem"}
                    marginTop={"1rem"}
                    fontWeight={"bold"}
                    textAlign={"center"}
                    fontSize={"1.2rem"}
                    style={{ textDecoration: "underline" }}
                  >
                    {t("Nutrients Average")}
                  </Typography>
                  <Grid container columnSpacing={"1rem"} rowSpacing={"1.5rem"}>
                    {data1?.nutrientValueResponse
                      ?.filter((nutr) => nutr.visitNumber === 1)
                      ?.map((nutrients, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sm={12}
                          md={6}
                          lg={4}
                          display={"flex"}
                          justifyContent={"space-between"}
                          alignItems={"center"}
                          width={"100%"}
                        >
                          <Typography fontWeight={"bold"}>
                            {t(nutrients?.nutrientName||nutrients?.nutrientNameArabic)}
                          </Typography>
                          <TextField
                             value={calculateAverage(nutrients?.nutrientId)} 
                            sx={{
                              '.MuiInputBase-root' :{
                                pointerEvents:'none',
                                cursor:'default'
                              }
                            }}
                            size="small"
                            readOnly
                            style={{ width: "65%" }}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </>
              ) : (
                ""
              )}
              {/* Recommendations:
              <Typography fontWeight={600}>BMI - {Bmiaverage <= 18.5 ? 'Increase calorie intake with nutrient-dense foods, consider consulting a healthcare professional.':Bmiaverage <= 24.9 ? 'Maintain balanced nutrition and regular physical activity for overall health.':Bmiaverage <= 29.9 ? 'Gradually reduce calorie intake, increase physical activity, consider professional support for weight loss.':Bmiaverage > 29.9 ? 'Develop a comprehensive weight loss plan with healthcare providers, focus on gradual, lifestyle-based changes for sustainable results.':''}</Typography>
              <Typography>EER - Low on colories (Please take more colories contained food)</Typography>
              <Typography>Water Intake- Low (Please take more water)  </Typography> */}
            </Box>
          </CustomTabPanel>
        </Box>
      </Paper>
    </div>
  );
};

export default ReportView;
