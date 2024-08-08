import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, styled, Toolbar, Tooltip } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";
// import logo from "../../../assets/BoA logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearLastPath, setPreviosPath } from "../../../store/slices/app.tsx";
import { SM_WIDTH } from "../../../utils/constants";
import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import { t } from "i18next";
const Img = styled("img")(() => ({
  width: "208px",
  height: "51px",
  cursor: "pointer",
}));

const StyledNavbar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: '#45AEAE',
  paddingTop: theme.spacing(0.3),
  paddingLeft: theme.spacing(1),
  paddingBottom: theme.spacing(0.3),
  // borderBottom: `2px solid ${theme.palette.primary.main}`,
  display: "flex",
  flexDirection: "row",
  position: "fixed",
  top: 0,
  left: 0,
  alignItems: "center",
  // boxShadow: `0px 0px ${theme.palette.primary.main}`,
  justifyContent: "space-between",

}));

const Navbar = ({ setIsOpen, ...other }) => {
  const lang = sessionStorage.getItem('lang')

  const isLarge = useMediaQuery(`(min-width:${SM_WIDTH}px)`);
  const navigate = useNavigate();
  const name = sessionStorage.getItem('name')
  const [details,setDetails] = useState({})
  const login = JSON.parse(sessionStorage?.getItem('login'))
  const token = login?.data?.accessToken
  const location = useLocation()
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(setPreviosPath(location.pathname))
  },[location.pathname])
  const appState = useSelector((state) => state?.app);
  // console.log("sdfff",appState);

  useEffect(()=>{
    // console.log(appState?.prevPath)
  },[appState?.prevPath])

  const handleBack = () =>{
    if(appState?.prevPath?.length === 0){
      return
    }
    dispatch(clearLastPath())
    navigate(appState?.prevPath[appState?.prevPath?.length - 2])
  }

  const toggleNavbar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, [setIsOpen]);

  
  const [cookies, setCookie] = useCookies(['token']);
  const logOut = useCallback(() => {
    navigate("/");
    window.location.reload()
    // setCookie('token','')
    Cookies.remove('token1')
    Cookies.remove('unique_name')
  
  }, [navigate]);

  return (
    <div dir={lang==='ar'?'rtl':''}>
    <StyledNavbar {...other} elevation={2}>
      <Toolbar >
        <Box>
          {!isLarge && (
            <Tooltip title={t('Open Navigation')}>
              <IconButton onClick={toggleNavbar} color="white">
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          {/* <Img src={logo} alt='Boa_logo' onClick={() => handleImageClick()} /> */}
        </Box>
        
        <Box sx={{marginLeft:isLarge&&lang==='en'?'220px':'0px',marginRight:isLarge&&lang==='ar'?'230px':'0px'}} color={'#FFFFFF'} fontSize={{ xs: 14, md: 16, lg: 18}}>
        
            {t(location.pathname.split('/').length ==3 ? location.pathname?.split('/')[2].replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before each capital letter
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/(?:^|\s)\S/g, match => match.toUpperCase()):location.pathname.split('/').length ==4 ? location.pathname?.split('/')[3].replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before each capital letter
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/(?:^|\s)\S/g, match => match.toUpperCase()):location.pathname?.split('/')[1].replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before each capital letter
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/(?:^|\s)\S/g, match => match.toUpperCase()))}
    
        </Box>
      </Toolbar>
      
      <Box display={'flex'} justifyContent={'center'} alignItems={'center'}  marginRight={'1rem'}>
        <Tooltip title={t('Notifications')}>
        <IconButton
        aria-label='send'
        size='medium'
        sx={{ marginRight: "5%" ,marginLeft:'2%'}}
        color="white"
        // onClick={logOut}
      >
        <NotificationsIcon />
      </IconButton>
      </Tooltip>
      <Tooltip title={t('Logout')}>
        <IconButton
        aria-label='send'
        size='medium'
        sx={{ marginRight: "5%" ,marginLeft:'2%'}}
        color="white"
        onClick={logOut}
        style={lang==='ar'?{transform:'rotate(180deg)'}:{}}
      >
        <LogoutIcon />
      </IconButton>
      </Tooltip> 
      </Box>
    </StyledNavbar>
    </div>
  );
};

export default Navbar;
