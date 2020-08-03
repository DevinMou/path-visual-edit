import React, { useState, ChangeEvent, useEffect } from 'react';
import './App.scss';
import Select from './components/select'

interface Point {
  type: string,
  arguments: any[]
}

const pointArguments: {[key: string]: string[]} = {
  M: ['x','y'],
  L: ['x','y'],
  H: ['x'],
  V: ['y'],
  C: ['x1','y1','x2','y2','x','y'],
  S: ['x2','y2','x','y'],
  Q: ['x1','y1','x','y'],
  T: ['x','y'],
  A: ['rx','ry','rotate','l-a','c-w','x','y'],
  Z: [],
}

const pointType: {value: any;label: string}[] = [
  {value:'M',label:'M'},
  {value:'L',label:'L'},
  {value:'H',label:'H'},
  {value:'V',label:'V'},
  {value:'C',label:'C'},
  {value:'S',label:'S'},
  {value:'Q',label:'Q'},
  {value:'T',label:'T'},
  {value:'A',label:'A'},
  {value:'Z',label:'Z'}]

function App() {
  const [points,setPoints] = useState<Point[]>([{
    type: 'M',
    arguments: [10, 10]
  }])
  const handleChange = (event: ChangeEvent) => {
    console.log(event)
  }
  const extendOption = (el: HTMLElement) => {
    const e = new MouseEvent('click')
    el.dispatchEvent(e)
  }
  const selectChange = (value: any, index: number) => {
    const arr = [...points]
    arr[index] = {type:value,arguments:[]}
    setPoints(arr)
  }
  useEffect(()=>{

  }, [points])
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
        <select defaultValue="M">
          <option value="M">M</option>
          <option value="A">A</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="T">T</option>
        </select>
        {
          points.map((item,index)=>(
            <div className="point" key={index}>
              <div>
                <Select value={item.type} options={pointType} handleChange={value=>selectChange(value,index)}></Select>
              </div>
              <div>
                {
                  pointArguments[item.type].map((item$,index$) => (
                    <span key={index$}>
                      <label>{item$}
                        <input type="text" value={item.arguments[index$]} onChange={event=>handleChange(event)} name={`${item.type}:${item$}`}/>
                      </label>
                    </span>
                  ))
                }
              </div>
            </div>
            
          ))
        }
        <button>add point</button>
      </div>
    </div>
  );
}

export default App;
