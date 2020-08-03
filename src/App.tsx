import React from 'react';
import './App.scss';

function App() {
  return (
    <div className="App">
      <div className="main">
        <div className="board">
          <div className="canvas"></div>
        </div>
        <div className="line-model"></div>
        <div className="arc-model"></div>
        <div className="bezier-model"></div>
      </div>
      <div className="points">
        <button>add point</button>
      </div>
    </div>
  );
}

export default App;
