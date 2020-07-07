import React from 'react';
import Stopwatch from './components/stopwatch';
import './App.css';

function App() {
  return (
    <div className="App" aria-live="assertive">
      <main>
        <Stopwatch />
      </main>
    </div>
  );
}

export default App;
