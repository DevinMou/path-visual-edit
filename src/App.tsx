import React, { useState, ChangeEvent, useEffect, useLayoutEffect, useRef } from 'react';
import './App.scss';
import Select from './components/select'
import {TouchItem, RegisterType, touchContext} from './components/touch'

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
  useLayoutEffect(()=>{

  },[])
  const [points,setPoints] = useState<Point[]>([{
    type: 'M',
    arguments: [10, 10]
  }])

  const [canvasSize,setCanvasSize] = useState<number[]>([400,400])

  const [unfold, setUnFold] = useState(false)

  const touchRef = useRef<RegisterType>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>,pointIndex:number,argumentIndex:number) => {
    const arr = [...points]
    arr[pointIndex].arguments[argumentIndex] = event.target?.value
    setPoints(arr)
  }
  const appendPoint = () => {
    const arr = [...points]
    arr.push({type:'M',arguments:[]})
    setUnFold(true)
    setPoints(arr)    
  }
  const selectChange = (value: any, index: number) => {
    const arr = [...points]
    arr[index] = {type:value,arguments:[]}
    setPoints(arr)
  }
  useEffect(()=>{
    setUnFold(false)
  }, [points])
  useEffect(()=>{
    if(touchRef.current){
      touchRef.current.register({
      })
    }
  },[])
  return (
    <div className="App">
      <div className="main">
        <TouchItem ref={touchRef} className="touch-main">
          <div className="board">
            <div className="canvas" style={{width:canvasSize[0]+'px',height:canvasSize[1]+'px'}}></div>
          </div>
          <div className="line-model"></div>
          <div className="arc-model"></div>
          <div className="bezier-model"></div>
        </TouchItem>
      </div>
      <div className="points">
        {
          points.map((item,index)=>(
            <div className="point" key={index}>
              <Select className="point-type" unfold={unfold&&index===points.length-1} value={item.type} options={pointType} handleChange={value=>selectChange(value,index)}></Select>
              <div className="point-arguments">
                {
                  pointArguments[item.type].map((item$,index$) => (
                    <span className="point-argument" key={item.type+index$}>
                      <label>{item$}</label>
                      <span className="box">
                        <span>{item.arguments[index$]}</span>
                        <input type="text" value={item.arguments[index$]||''} onChange={event=>handleChange(event,index,index$)} name={`${item.type}:${item$}`}/>
                      </span>
                    </span>
                  ))
                }
              </div>
            </div>
            
          ))
        }
        <button onClick={appendPoint}>add point</button>
      </div>
    </div>
  );
}

export default App;
