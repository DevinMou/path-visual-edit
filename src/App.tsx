/* eslint-disable no-extend-native */
import React, { useState, ChangeEvent, useEffect, useLayoutEffect, useRef } from 'react';
import './App.scss';
import Select from './components/select'
import {TouchItem, RegisterType, touchContext} from './components/touch'

interface Point {
  type?: string
  arguments?: number[]
  preM?: [number,number]
}

interface pArguments {
  [key: string]: {label?:string[];limit?:string[];init?:(x:number,y:number)=>{preM?:[number,number];arguments:number[]}}
}

const pointArguments: pArguments = {
  M: {label:['x','y'],init:(x,y)=>({arguments:[x+10,y+10]})},
  L: {label:['x','y'],init:(x,y)=>({arguments:[x+50,y+50]})},
  H: {label:['x'],init:(x,y)=>({arguments:[x+50]})},
  V: {label:['y'],init:(x,y)=>({arguments:[y+50]})},
  C: {label:['x1','y1','x2','y2','x','y'],init:(x,y)=>({arguments:[x+5,y-10,x+10,y-10,x+15,y]})},
  S: {label:['x2','y2','x','y'],init:(x,y)=>({arguments:[x+10,y-15,x+20,y]})},
  Q: {label:['x1','y1','x','y'],init:(x,y)=>({arguments:[x+10,y-15,x+20,y]})},
  T: {label:['x','y'],init:(x,y)=>({arguments:[x+15,y]})},
  A: {label:['rx','ry','rotate','l-a','c-w','x','y'],init:(x,y)=>({preM:[x,y],arguments:[50,50,0,0,1,x+100,y]})},
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

function getArcCenter([x1,y1]:[number,number],[x2,y2]:[number,number],a:number,b:number,r:number){
  const c=Math.cos(r),s=Math.sin(r),d=b**2*c**2+a**2*s**2,e=b**2*s**2+a**2*c**2,
  A:(x:number,y:number)=>number=(x,y)=>c*x+s*y,
  B:(x:number,y:number)=>number=(x,y)=>c*y+s*x,
  f:(x:number,y:number)=>number=(x,y)=>2*B(x,y)*s*a**2-2*A(x,y)*c*b**2,
  g:(x:number,y:number)=>number=(x,y)=>-2*B(x,y)*c*a**2-2*A(x,y)*s*b**2,
  h = 2*c*s*b**2-2*c*s*a**2,
  i:(x:number,y:number)=>number=(x,y)=>a**2*b**2-b**2*A(x,y)**2-a**2*B(x,y)**2,
  t=2*c*a**2*(B(x1,y1)-B(x2,y2))+2*s*b**2*(A(x1,y1)-A(x2,y2)),
  j=(b**2*(A(x1,y1)**2-A(x2,y2)**2)+a**2*(B(x1,y1)**2-B(x2,y2)**2)),
  k=(2*s*a**2*(B(x1,y1)-B(x2,y2))-2*c*b**2*(A(x1,y1)-A(x2,y2)))
  if(t!==0){
    const a$ = d+e*k/t**2+k/t*h,
    b$ = 2*j/t*k/t*e+f(x1,y1)+g(x1,y1)*k/t+j/t*h,
    c$ = e*j/t**2+g(x1,y1)*j/t-i(x1,y1),
    m1 = (-b$+(b$**2-4*a$*c$)**0.5)/2/a$,
    m2 = (-b$-(b$**2-4*a$*c$)**0.5)/2/a$,
    n1 = j/t+k/t*m1,
    n2 = j/t+k/t*m2
    return [[m1,n1],[m2,n2]]
  }else{
    const m = -j/k,
    a$ = e,
    b$ = g(x1,y1)+h*m,
    c$ = d*m**2+f(x1,y1)*m-i(x1,y1),
    n1 = (-b$+(b$**2-4*a$*c$)**0.5)/2/a$,
    n2 = (-b$-(b$**2-4*a$*c$)**0.5)/2/a$
    return n1===n2 ? [[m,n1]] : [[m,n1],[m,n2]]
  }

}

function getCA([x1,y1]:[number,number],[x2,y2]:[number,number]):number{
  const s = (x1*y2-x2*y1)/(x1**2+y1**2)
  const c = x2/x1+s*y1/x1
  if(c===0){
   return s>0 ? Math.PI/2 : Math.PI*3/2
  }else{
   return Math.atan(s/c)
  }
 }

declare global {
  interface Window {
    gc: (...args:any[])=>any
  }
}
window.gc = getArcCenter
function TouchPoint() {
  return (
  <div>

  </div>
  )
}

function ArcModel() {
  return (
    <div>
      <div>
        <span>center:</span>
      </div>
    </div>
  )
}

function PointArguments ({type,args,pointArguments,index,handle,isPreM}:{type:string;args:number[];pointArguments:pArguments;index:number;handle:(...args:any[])=>any;isPreM?:boolean}) {

  return  <div className="point-arguments">
      {
        pointArguments[type!].label?.map((item$,index$) => (
          <span className="point-argument" key={type!+index$}>
            <label>{item$}</label>
            <span className="box">
              <span>{args![index$]}</span>
              <input type="text" value={args![index$]} onChange={event=>handle(event,index,index$,isPreM)} name={`${type}:${item$}`}/>
            </span>
          </span>
        ))
      }
    </div>
}

function App() {
  useLayoutEffect(()=>{

  },[])
  const [points,setPoints] = useState<Point[]>([{
    preM: [10,10]
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>,pointIndex:number,argumentIndex:number,isPreM?:boolean) => {
    const arr = [...points]
    if (isPreM) {
      arr[pointIndex].preM![argumentIndex] = +event.target?.value
    }else {
      arr[pointIndex].arguments![argumentIndex] = +event.target?.value
    }
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
  const getLastM:(index?:number)=>number[] = (index) => {
    const len = points.length
    index === undefined && (index = len)
    if(len||index!==0){
      const lastPoint = points[index-1]
      if(lastPoint.type==='H'){
        return [lastPoint.arguments![0],getLastM(index-1)[1]]
      }else if (lastPoint.type==='V'){
        return [getLastM(index-1)[0],lastPoint.arguments![0]]
      }else {
        return lastPoint.arguments!.slice(-2)
      }
    }else {
      return [0,0]
    }
  }
  const appendPoint = () => {
    const arr = [...points]
    const lastP = arr[arr.length-1]
    const lastM = getLastM()
    if(pointArguments['L'].init){
      const {arguments:args} = pointArguments['L'].init(...(lastM as [number,number]))
      if(!lastP.type){
        lastP.type = 'L'
        lastP.arguments = args
      }else{
        arr.push({type:'L',arguments:args})
      }
      setUnFold(true)
      setPoints(arr)
    }
  }
  const selectChange = (event: React.MouseEvent, value: any, index: number) => {
    const arr = [...points]
    const [x,y] = getLastM(index)
    const point = pointArguments[value]
    const hasPre = index===0||points[index-1].type!=='M'
    if(!hasPre&&value==='M')return true
    if(point.init){
      const {arguments:args,preM} = point.init(hasPre?x+10:x,hasPre?y+10:y)
      if(preM&&hasPre){
        arr[index] = {type:value,arguments:args,preM}
      }else{
        arr[index] = {type:value,arguments:args}
      }
      setPoints(arr)
    }
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
      let d=""
      points.forEach(item=>{
        item.preM&&(d+='M'+item.preM.join(' '))
        item.type&&(d+=item.type+item.arguments!.join(' '))
      })
      ctx.clearRect(0,0,canvasSize[0],canvasSize[1])
      ctx.strokeStyle = '#333333'
      ctx.stroke(new Path2D(d))
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
    canvasRender()
  }, [points])

  useEffect(()=>{

  }, [pointActive])

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
              <div className={`pre-m`}>
                {item.preM?(
                  <>
                    <span className="point-type">M</span>
                    <PointArguments type="M" args={item.preM} index={index} isPreM={true} handle={handleChange} pointArguments={pointArguments} />
                  </>
                ):(
                  <div></div>
                )}
              </div>
              {
                item.type?(
                  <div className="point-value">
                    <Select className="point-type" unfold={unfold&&index===points.length-1} value={item.type} options={pointType} handleChange={(event,value)=>selectChange(event,value,index)}></Select>
                    <PointArguments type={item.type!} args={item.arguments!} index={index} handle={handleChange} pointArguments={pointArguments} />
                  </div>
                ):null
              }
            </div>
            
          ))
        }
        <button onClick={appendPoint}>add point</button>
      </div>
    </div>
  );
}

export default App;
