/* eslint-disable no-extend-native */
import React, { useState, ChangeEvent, useEffect, useLayoutEffect, useRef } from 'react';
import './App.scss';
import Select from './components/select'
import {TouchItem, RegisterType, touchContext} from './components/touch'

interface Point {
  type: string
  arguments: any[]
  preM: boolean|number[]
}

const pointArguments: {[key: string]: {label?:string[];init?:(x:number,y:number)=>{preM:number[],arguments:number[]}}} = {
  M: {label:['x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+10,y+10]})},
  L: {label:['x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+50,y+50]})},
  H: {label:['x'],init:(x,y)=>({preM:[x,y],arguments:[x+50]})},
  V: {label:['y'],init:(x,y)=>({preM:[x,y],arguments:[y+50]})},
  C: {label:['x1','y1','x2','y2','x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+5,y-10,x+10,y-10,x+15,y]})},
  S: {label:['x2','y2','x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+10,y-15,x+20,y]})},
  Q: {label:['x1','y1','x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+10,y-15,x+20,y]})},
  T: {label:['x','y'],init:(x,y)=>({preM:[x,y],arguments:[x+15,y]})},
  A: {label:['rx','ry','rotate','l-a','c-w','x','y'],init:(x,y)=>({preM:[x,y],arguments:[]})},
  Z: {},
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

class Animate {
  pool: any[]
  fn: (args:any)=>void
  active: boolean
  running: boolean
  direct: boolean
  constructor(fn:(args:any)=>void, direct?:boolean) {
    this.pool = []
    this.fn = fn
    this.active = false
    this.running = false
    this.direct = !!direct
  }
  push(payload:any) {
    this.running = true
    this.pool.push(payload)
    this.check()
  }
  stop() {
    this.running = false
  }
  check() {
    if (this.pool.length && !this.active) {
      this.active = true
      window.requestAnimationFrame(this.done.bind(this))
    }
  }
  done() {
    const args = [...this.pool]
    this.pool.length = 0
    if (this.running) {
      this.fn(this.direct ? args.last() : args)
      this.active = false
      this.check()
    } else {
      this.active = false
    }
  }
}


function App() {
  useLayoutEffect(()=>{

  },[])
  const [points,setPoints] = useState<Point[]>([{
    type: 'M',
    arguments: [10, 10],
    preM: false
  }])

  const [pointActive, setPointActive] = useState<null|number>(null)

  const [canvasSize,setCanvasSize] = useState<number[]>([400,400])

  const [canvasTransform,setCanvasTransform] = useState<number[]>([0.5,0.5,1,0,0]) // origin,scale,translate

  const [unfold, setUnFold] = useState(false)

  const [auxCanvas, setAuxCanvas] = useState<{width:number,height:number,show:boolean}>({width:400,height:400,show:false})

  const touchRef = useRef<RegisterType>(null)

  const mainRef = useRef<HTMLDivElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const auxRef = useRef<HTMLCanvasElement>(null)

  const ctxRef = useRef<CanvasRenderingContext2D|undefined|null>()
  const auxCtxRef = useRef<CanvasRenderingContext2D|undefined|null>()

  const context = useRef<{wheelAnimate?:Animate,$mainWidth?:number,$mainHeight?:number,origin?:number[],transform:number[]}>({origin:[],transform:[0.5,0.5,1,0,0]}).current

  const getNewTransform = (x:number,y:number)=>{
    const [cw,ch] = canvasSize,sw = context.$mainWidth||0,sh = context.$mainHeight||0,[ox,oy,s,dx,dy]=context.transform
    if(context.origin && context.origin[0]!==undefined&&context.origin[0]===x&&context.origin[1]===y){
      return context.transform
    }
    const A = [cw*ox*(1-s)+(sw-cw)/2+dx,ch*oy*(1-s)+(sh-ch)/2+dy]
    const O = [(x-A[0])/cw/s,(y-A[1])/ch/s]
    const O2 = [(sw-cw)/2+cw*O[0],(sh-ch)/2+ch*O[1]]
    context.origin = [x,y]
    return [...O,s,x-O2[0],y-O2[1]]
  }

  const wheel = (payload:any[any])=> {
    setCanvasTransform([...payload[1]])
  } 
  if(!context.wheelAnimate){
    context.wheelAnimate = new Animate(wheel,true)
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>,pointIndex:number,argumentIndex:number) => {
    const arr = [...points]
    arr[pointIndex].arguments[argumentIndex] = event.target?.value
    setPoints(arr)
  }
  const clickPoint = (event: React.MouseEvent,index: number) => {
    if(event.target!==event.currentTarget) return
    if(pointActive!==index){
      setPointActive(index)

    }else{

      setPointActive(null)
    }
    console.log(points[index])
  }
  const appendPoint = () => {
    const arr = [...points]
    arr.push({type:'M',arguments:[],preM:[]})
    setUnFold(true)
    setPoints(arr)    
  }
  const selectChange = (event: React.MouseEvent, value: any, index: number) => {
    const arr = [...points]
    arr[index] = {type:value,arguments:[],preM:event.shiftKey?true:[]}
    setPoints(arr)
  }
  const wheelHandle = (event:WheelEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if(String(event.deltaY).includes('.')){
      let t = event.deltaY
      1 === event.deltaMode && (t*=15)
      const e = event.ctrlKey,i = window.navigator.appVersion.includes('Mac') ? 4e3 : 2e3,n = t/(e?100:i)
      let newTransform = getNewTransform(event.pageX,event.pageY)
      newTransform[2] += -n
      context.transform = newTransform
      context.wheelAnimate?.push([0,newTransform])
    }else{
      context.transform[3] += -event.deltaX*1
      context.transform[4] += -event.deltaY*1
      context.wheelAnimate?.push([1,context.transform])
    }
  }
  const canvasRender = () => {
    const ctx = ctxRef.current
    if (ctx) {

    }
  }
  const auxRender = () => {
    if (pointActive===null||!points[pointActive]||!auxCtxRef.current) return
    const active = points[pointActive]
    const ctx = auxCtxRef.current
    switch (active.type) {
      case 'A':
        const [rx,ry,rotation,l_a_f,s_f,x,y] = active.arguments
        ctx.clearRect(0,0,auxCanvas.width,auxCanvas.height)
        ctx.beginPath()
        ctx.arc()
        break
      default:
        break
    }
  }
  useEffect(()=>{
    ctxRef.current = canvasRef.current?.getContext('2d')
    auxCtxRef.current = auxRef.current?.getContext('2d')
  },[])

  useEffect(()=>{
    const $main = mainRef.current
    if($main){
      $main.addEventListener('wheel',wheelHandle,{passive:false})
      const {width,height} = $main?.getBoundingClientRect()
      context.$mainWidth = width
      context.$mainHeight = height
    }
    return ()=> {
      $main?.removeEventListener('wheel',wheelHandle)
    }
  },[])
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
      <div className="main" ref={mainRef}>
        <TouchItem ref={touchRef} className="touch-main">
          <div className="board">
            <div className="canvas" style={{width:canvasSize[0]+'px',height:canvasSize[1]+'px',transformOrigin:`${canvasTransform[0]*100}% ${canvasTransform[1]*100}%`,transform:`translate(${canvasTransform[3]}px,${canvasTransform[4]}px) scale(${canvasTransform[2]})`}}>
              <canvas id="main-canvas" ref={canvasRef} width={canvasSize[0]} height={canvasSize[1]}></canvas>
              <canvas id="aux-canvas" className={auxCanvas.show?'show':''} ref={auxRef} width={auxCanvas.width} height={auxCanvas.height}></canvas>
            </div>
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
              <div className={`select-area${pointActive===index?' active':''}`} onClick={(event)=>clickPoint(event,index)}></div>
              <Select className="point-type" unfold={unfold&&index===points.length-1} value={item.type} options={pointType} handleChange={(event,value)=>selectChange(event,value,index)}></Select>
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
