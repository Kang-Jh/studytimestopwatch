import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

export default function (props: any): ReactElement {
  return (
    <header>
      <div>
        <Link to="/">홈</Link>
      </div>
      <div>
        <Link to="/myRecords">내 기록</Link>
      </div>
    </header>
  );
}
