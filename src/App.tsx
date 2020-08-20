/* eslint-disable no-extend-native */
import React, { useState, ChangeEvent, useEffect, useLayoutEffect, useRef } from 'react';
import './App.scss';
import PointC from './components/point'
import {TouchItem, RegisterType, touchContext} from './components/touch'

export interface Point {
  type?: string
  arguments?: number[]
  preM?: [number,number]
}

interface pArguments {
  [key: string]: {label?:string[];limit?:string[];init?:(x:number,y:number)=>{arguments:number[]}}
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
  A: {label:['rx','ry','rotate','l-a','c-w','x','y'],init:(x,y)=>({arguments:[50,50,0,0,1,x+100,y]})},
  Z: {},
}

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

function getArcCenter([x1,y1]:[number,number],[x2,y2]:[number,number],a:number,b:number,r:number,laf:number,sf:number){
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
  let res
  if(t!==0){
    const a$ = d+e*k/t**2+k/t*h,
    b$ = 2*j/t*k/t*e+f(x1,y1)+g(x1,y1)*k/t+j/t*h,
    c$ = e*j/t**2+g(x1,y1)*j/t-i(x1,y1),
    m1 = (-b$+(b$**2-4*a$*c$)**0.5)/2/a$,
    m2 = (-b$-(b$**2-4*a$*c$)**0.5)/2/a$,
    n1 = j/t+k/t*m1,
    n2 = j/t+k/t*m2
    res = [[m1,n1],[m2,n2]]
  }else{
    const m = -j/k,
    a$ = e,
    b$ = g(x1,y1)+h*m,
    c$ = d*m**2+f(x1,y1)*m-i(x1,y1),
    n1 = (-b$+(b$**2-4*a$*c$)**0.5)/2/a$,
    n2 = (-b$-(b$**2-4*a$*c$)**0.5)/2/a$
    res = n1===n2 ? [[m,n1]] : [[m,n1],[m,n2]]
  }
  if(res.length>1){
    const [x,y] = res[0]
    const la = getCA([x1-x,y-y1],[x2-x,y-y1]) > Math.PI/2 ? 1 : 0
    return (sf===1?la === laf:la!==laf) ? res[0] : res[1]
  } else {
    return res[0]
  }
}

function getCA([x1,y1]:[number,number],[x2,y2]:[number,number]):number{
  return Math.atan2(x1*y2-x2*y1,y1*y2-x1*x2)
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

function App() {
  useLayoutEffect(()=>{

  },[])
  const [points,setPoints] = useState<Point[]>([{
    preM: [10,10]
  }])

  const [pointActive, setPointActive] = useState<null|number>(null)

  const [canvasSize,setCanvasSize] = useState<number[]>([400,400])

  const [canvasTransform,setCanvasTransform] = useState<number[]>([0.5,0.5,1,0,0]) // origin,scale,translate

  const [unfold, setUnFold] = useState<number|null>(null)

  const [auxCanvas, setAuxCanvas] = useState<{width:number,height:number,show:boolean}>({width:400,height:400,show:false})

  const touchRef = useRef<RegisterType>(null)

  const mainRef = useRef<HTMLDivElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const auxRef = useRef<HTMLCanvasElement>(null)

  const ctxRef = useRef<CanvasRenderingContext2D|undefined|null>()
  const auxCtxRef = useRef<CanvasRenderingContext2D|undefined|null>()
  const arcRef = useRef<{[k:string]:null|number}>({rx:null,ry:null,cx:null,cy:null,rotation:null,x1:null,x2:null,y1:null,y2:null,as:null,ae:null,laf:null,sf:null})

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
  const clickPoint = (index: number) => {
    if(pointActive!==index){
      setPointActive(index)

    }else{

      setPointActive(null)
    }
    console.log(points[index])
  }
  const getLastM:(index?:number)=>[number,number] = (index) => {
    const len = points.length
    index === undefined && (index = len)
    if(len||index!==0){
      const lastPoint = points[index-1]
      if(lastPoint.type==='H'){
        return [lastPoint.arguments![0],getLastM(index-1)[1]] as [number,number]
      }else if (lastPoint.type==='V'){
        return [getLastM(index-1)[0],lastPoint.arguments![0]] as [number,number]
      }else {
        return lastPoint.arguments!.slice(-2) as [number,number]
      }
    }else {
      return [0,0]
    }
  }
  const appendPoint = (index:number) => {
    const arr = [...points]
    arr.splice(index,0,{})
    setUnFold(index)
    setPoints(arr)
  }
  const selectChange = (event: React.MouseEvent, value: any, index: number) => {
    const currentPoint = points[index]
    const hasPreM = currentPoint.hasOwnProperty('preM')
    const [x,y] = hasPreM&&currentPoint.preM? currentPoint.preM : getLastM(index)
    const point = pointArguments[value]
    if(hasPreM){
      const {arguments:args} = point.init!(x,y)
      currentPoint.arguments = args
      currentPoint.type = value
    }else{
      if(value==='M'){
        currentPoint.preM = [x+10,y+10]
      }
      else if (value==='A'){
        currentPoint.preM = [x+10,y+10]
        const {arguments:args} = point.init!(x+10,y+10)
        currentPoint.arguments = args
        currentPoint.type = value
      }
      else{
        currentPoint.preM = undefined
        const {arguments:args} = point.init!(x,y)
        currentPoint.arguments = args
        currentPoint.type = value
      }
    }
    setPoints([...points])
    clickPoint(index)
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
      if(pointActive!==null){
        // const [x,y] = getLastM(pointActive)
        const [nx,ny] = getLastM(pointActive+1)
        points.slice(0,pointActive).forEach(item=>{
          item.preM&&(d+='M'+item.preM.join(' '))
          item.type&&(d+=item.type+item.arguments!.join(' '))
        })

        points.slice(pointActive+1).forEach((item,index)=>{
          if(index===0){
            d+='M'
            d+=item.preM?item.preM.join(' '):(nx+' '+ny)
          }else{
            item.preM&&(d+='M'+item.preM.join(' '))
          }
          item.type&&(d+=item.type+item.arguments!.join(' '))
        })
      }else{
        points.forEach(item=>{
          item.preM&&(d+='M'+item.preM.join(' '))
          item.type&&(d+=item.type+item.arguments!.join(' '))
        })
      }
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
        const [rx,ry,rotation,laf,sf,x,y] = active.arguments
        if(rx>auxCanvas.width/2){
          auxCanvas.width = 2*rx
        }
        if(ry>auxCanvas.height/2){
          auxCanvas.height = 2*ry
        }
        ctx.clearRect(0,0,auxCanvas.width,auxCanvas.height)
        ctx.beginPath()
        const [x1,y1] = getLastM(pointActive)
        const [cx,cy] = getArcCenter([x1,y1],[x,y],rx,ry,rotation,laf,sf)
        const as = Math.atan2(cy-y1,cx-x1)-rotation
        const ae = Math.atan2(cy-y,cx-x)-rotation
        arcRef.current = {
          rx,ry,cx,cy,rotation,x1,x2:x,y1,y2:y,as,ae,laf,sf
        }
        // ctx.ellipse()
        break
      default:
        break
    }
  }

  const arcModelMouseHandle =(deltaX:number,deltaY:number,type:string)=>{
    let {rx,ry,cx,cy,rotation,x1,x2,y1,y2,as,ae,laf,sf} = arcRef.current as {[k:string]:number}
    const {sin,cos,PI} = Math
    switch(type){
      case 'ry':
        ry += (deltaX*cos(rotation+PI/2)-deltaY*sin(rotation+PI/2))
        break
      case 'rx':
        rx += (deltaX*cos(rotation)-deltaY*sin(rotation))
        break
      case 'as':
        as += getCA([x1-cx,cy-y1],[x1+deltaX,cy-y1-deltaY])
        break
      case 'ae':
        ae += getCA([x1-cx,cy-y1],[x1+deltaX,cy-y1-deltaY])
        break
      case 'rotation':
        const xr = (10+rx)*cos(rotation)
        const yr = (10+ry)*sin(rotation)
        rotation += getCA([xr+deltaX,yr-deltaY],[xr,yr])
        break
      case 'center':
        cx += deltaX
        cy += deltaY
        break
      default:
        break
    }
  }
  const [arcModelData,setArcModelData] = useState({})
  const getArcModelDetail=()=>{
    const {rx,ry,cx,cy,rotation,x1,x2,y1,y2,as,ae,laf,sf} = arcRef.current as {[k:string]:number}
    const rotate:(x:number,y:number,r:number)=>[number,number]=(x,y,r)=>{
      const c = Math.cos(r),s = Math.sin(r)
      return [x*c+y*s+cx,y*c-x*s+cy]
    }
    const {sin,cos,PI} = Math
    const b = rotate(0,-ry,rotation)
    const r = rotate(0,-ry-10,rotation)
    const a = rotate(rx,0,rotation)
    const ps = rotate(rx*cos(PI-as),-ry*sin(PI-as),rotation)
    const pe = rotate(rx*cos(PI-ae),-ry*sin(PI-ae),rotation)
    const d = rotate((rx+10)*cos(PI-as),-(ry+10)*sin(PI-as),rotation)
    const dr = -Math.atan2(cy-ps[1],cx-ps[0])
    const o = [cx,cy]

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
    setUnFold(null)
    canvasRender()
  }, [points,pointActive])

  useEffect(()=>{
    auxRender()
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
          <div className="arc-model">
            <span className="control-point" data-name="a0"></span>
            <span className="control-point" data-name="a1"></span>
            <span className="control-point" data-name="a2"></span>
            <span className="control-point" data-name="a3"></span>
            <span className="control-point" data-name="a4"></span>
            <span className="control-point" data-name="a5"></span>
            <span className="control-point" data-name="a6"></span>
          </div>
          <div className="bezier-model"></div>
        </TouchItem>
      </div>
      <div className="points">
        {
          points.map((item,index)=>(
            <PointC key={index} active={pointActive===index} index={index} unfold={unfold===index} data={item} clickPoint={()=>clickPoint(index)} selectChange={(event,value)=>selectChange(event,value,index)} appendPoint={appendPoint} setPoints={setPoints}/>
          ))
        }
        <button onClick={()=>appendPoint(points.length)}>add point</button>
      </div>
    </div>
  );
}

export default App;
