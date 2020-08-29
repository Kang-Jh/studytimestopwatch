import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

export default function (props: any): ReactElement {
  return (
    <header role="banner">
      <h1>
        <Link to="/">스톱워치</Link>
      </h1>
      <nav role="navigation">
        <ul>
          <li>
            <Link to="/myRecords">내 기록</Link>
          </li>

          <li>
            <Link to="/statisticOfUsers">전체유저 통계</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
