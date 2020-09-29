import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemText,
  Link,
  makeStyles,
  useTheme,
  ListItemIcon,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import NotesIcon from '@material-ui/icons/Notes';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { OnClick } from '../@types/AppEvent';
import { drawerWidth } from '../styles/drawerWidth';

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));

export function Header() {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar className={classes.appBar} component="header">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open main menu"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography noWrap variant="h6" component="h1">
            스톱워치
          </Typography>
        </Toolbar>
      </AppBar>
      <Nav open={mobileOpen} onClose={handleDrawerToggle} />
    </>
  );
}

export function Nav({ open, onClose }: { open: boolean; onClose: OnClick }) {
  const classes = useStyles();
  const theme = useTheme();

  const drawer = (
    <List>
      <ListItem>
        <ListItemIcon>
          <AccessTimeIcon />
        </ListItemIcon>
        <ListItemText>
          <Link component={RouterLink} to="/">
            스톱워치
          </Link>
        </ListItemText>
      </ListItem>

      <ListItem>
        <ListItemIcon>
          <NotesIcon />
        </ListItemIcon>
        <ListItemText>
          <Link component={RouterLink} to="/myRecords">
            내 기록
          </Link>
        </ListItemText>
      </ListItem>

      <ListItem>
        <ListItemIcon>
          <EqualizerIcon />
        </ListItemIcon>
        <ListItemText>
          <Link component={RouterLink} to="/statisticOfUsers">
            전체유저 통계
          </Link>
        </ListItemText>
      </ListItem>
    </List>
  );

  return (
    <nav className={classes.drawer} aria-label="Main menu">
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={open}
          onClose={onClose}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}
