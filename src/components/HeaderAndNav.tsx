import React from 'react';
import { Link } from 'react-router-dom';
import { OnClick } from '../@types/AppEvent';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

export function Header({
  onMenuClicked,
  showMenuButton,
}: {
  onMenuClicked: OnClick;
  showMenuButton: boolean;
}) {
  return (
    <AppBar role="banner" component="header">
      <Typography component="h1">스톱워치</Typography>
      <div className={`${showMenuButton ? 'Header-menuDiv' : 'srOnly'}`}>
        <button className="button primary" onClick={onMenuClicked}>
          <img className="Header-menuImage" src="" alt="메뉴 버튼" />
        </button>
      </div>
    </AppBar>
  );
}

export function Nav({ isMenuOpened }: { isMenuOpened: boolean }) {
  return (
    <nav role="navigation" className={`Nav ${isMenuOpened ? '' : 'srOnly'}`}>
      <ul>
        <li>
          <Link to="/" className="Nav-link">
            스톱워치
          </Link>
        </li>
        <li>
          <Link to="/myRecords" className="Nav-link">
            내 기록
          </Link>
        </li>

        <li>
          <Link to="/statisticOfUsers" className="Nav-link">
            전체유저 통계
          </Link>
        </li>
      </ul>
    </nav>
  );
}
