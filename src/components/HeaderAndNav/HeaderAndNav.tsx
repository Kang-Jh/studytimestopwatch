import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import './Nav.css';
import menuIcon from './images/menu-icon.svg';
import { OnClick } from '../../@types/AppEvent';

export function Header({
  onMenuClicked,
  showMenuButton,
}: {
  onMenuClicked: OnClick;
  showMenuButton: boolean;
}) {
  return (
    <header role="banner" className="Header primary">
      <h1 className="srOnly">공부용 스톱워치 애플리케이션</h1>
      <div className={`${showMenuButton ? 'Header-menuDiv' : 'srOnly'}`}>
        <button className="button primary" onClick={onMenuClicked}>
          <img className="Header-menuImage" src={menuIcon} alt="메뉴 버튼" />
        </button>
      </div>
    </header>
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
