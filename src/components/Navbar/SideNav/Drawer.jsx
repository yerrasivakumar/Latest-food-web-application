import { styled, Toolbar } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SM_WIDTH } from "../../../utils/constants";
const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(() => ({
  backgroundColor: "#FFFFFF",
  zIndex: 0,
}));
const lang = sessionStorage.getItem('lang')
const MuiDrawer = ({ isOpen, children,setIsOpen, ...other }) => {
  const isLarge = useMediaQuery(`(min-width:${SM_WIDTH}px)`);
  // console.log("isOpen:", isOpen);
  // console.log("isLarge:", isLarge);

  return (
    // <div dir={lang==='ar'?'rtl':''}>
    <StyledDrawer
      anchor={lang==='ar'?'right':'left'}
      sx={{
        width: drawerWidth,
        // ".css-dm4aar-MuiPaper-root-MuiDrawer-paper": { width: drawerWidth },
        // ".css-12i7wg6-MuiPaper-root-MuiDrawer-paper": { width: drawerWidth },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
        boxShadow: '3px 0 2px rgba(0, 0, 0, 0.1);'
      }}
      {...other}
      elevation={6}
      variant={isLarge ? "permanent" : "temporary"}
      open={isOpen}
      onClose={()=>{setIsOpen(false)}}
    >
      <Toolbar />
      {children}
    </StyledDrawer>
    // </div>
  );
};

export default MuiDrawer;
