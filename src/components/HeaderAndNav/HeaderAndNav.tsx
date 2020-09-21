import React, { useState, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import './Nav.css';
import menuIcon from './images/menu-icon.svg';

type OnClick = () => void;

function Header({ onClick }: { onClick: OnClick }) {
  return (
    <header role="banner" className="Header primary">
      <h1 className="srOnly">공부용 스톱워치 애플리케이션</h1>
      <div className="Header-menuDiv">
        <button className="button primary" onClick={onClick}>
          <img
            className="Header-menuImage"
            src={menuIcon}
            alt="메뉴 열기 버튼"
          />
        </button>
      </div>
    </header>
  );
}

function Nav({
  isMenuOpened,
  onClick,
}: {
  isMenuOpened: boolean;
  onClick: OnClick;
}) {
  return (
    <div className={`NavWrapper ${isMenuOpened ? '' : 'srOnly'}`}>
      <div className="Nav-menuDivCover primary">
        <div className="Nav-dummyDiv">
          <button className="button primary" onClick={onClick}>
            <img src={menuIcon} alt="메뉴 닫기 버튼" />
          </button>
        </div>
      </div>

      <nav role="navigation" className="Nav">
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
    </div>
  );
}

export default function HeaderAndNav(props: any): ReactElement {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onClicked = () => {
    setIsMenuOpened((state) => !state);
  };

  return (
    <>
      <Header onClick={onClicked} />
      <Nav isMenuOpened={isMenuOpened} onClick={onClicked} />
    </>
  );
}
