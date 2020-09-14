/* eslint-disable no-extend-native */
import React, { useState, useEffect, useRef, useMemo } from 'react';
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

type AMT = 'pb'|'pr'|'pa'|'ps'|'pe'|'pd'|'po'|'dr'
type LMT = 'pm'|'pl'|'ph'|'pv' 
interface ContextType {
  wheelAnimate?:Animate
  translateAnimate?:Animate
  $mainWidth?:number
  $mainHeight?:number
  origin?:number[]
  transform:number[]
  onModel?:boolean
  active?:number
  points?:Point[]
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
  const s = Math.sin(-r),c=Math.cos(-r)
    const A = (x:number,y:number)=>c*x-s*y
    const B = (x:number,y:number)=>-s*x-c*y
    const M = (x:number,y:number)=>2*a**2*B(x,y)*s-2*b**2*A(x,y)*c
    const N = (x:number,y:number)=>2*a**2*B(x,y)*c+2*b**2*A(x,y)*s
    const L = (x:number,y:number)=>a**2*B(x,y)**2+b**2*A(x,y)**2
    const n = N(x1,y1)-N(x2,y2)
    const m = M(x2,y2)-M(x1,y1)
    const l = L(x2,y2)-L(x1,y1)
    const d = b**2*c**2+a**2*s**2
    const f = 2*a**2*B(x1,y1)*s-2*b**2*A(x1,y1)*c
    const e = b**2*s**2+a**2*c**2
    const g = 2*a**2*B(x1,y1)*c+2*b**2*A(x1,y1)*s
    const h = (a**2-b**2)*2*c*s
    const i = a**2*b**2-b**2*A(x1,y1)**2-a**2*B(x1,y1)**2
    const eyc = (a$:number,b$:number,c$:number)=>{
        return [(-b$+(b$**2-4*a$*c$)**0.5)/2/a$,(-b$-(b$**2-4*a$*c$)**0.5)/2/a$]
    }
    let res
    if(n===0){
       const x = -l/m
       const a$ = e
       const b$ = g+h*x
       const c$ = d*x**2+f*x-i
       const [y,y$] = eyc(a$,b$,c$)
       res = [[x,y],[x,y$]]
    }else if(m===0){
       const y = l/n
       const a$ = d
       const b$ = f+h*y
       const c$ = e*y**2+g*y-i
       const [x,x$] = eyc(a$,b$,c$)
       res = [[x,y],[x$,y]]
    }else{
        const a$ = e*m**2/n**2+d+h*m/n
        const b$ = f+g*m/n+h*l/n+2*e*m*l/n**2
        const c$ = g*l/n+e*l**2/n**2-i
        const [x,x$] = eyc(a$,b$,c$)
        const y = x*m/n+l/n
        const y$ = x$*m/n+l/n
        res = [[x,y],[x$,y$]]
    }
  let center
  if(res[0].join('')!==res[1].join('')){
    const [x,y] = res[0]
    const la = getCA([x1-x,y-y1],[x2-x,y-y2]) > Math.PI/2 ? 1 : 0
    center = (sf===1?la === laf:la!==laf) ? res[0] : res[1]
  } else {
    center = res[0]
  }
  return center.map(item => +item.toFixed(7))
}

function getCA([x1,y1]:[number,number],[x2,y2]:[number,number]):number{
  return Math.atan2(x1*y2-x2*y1,y1*y2+x1*x2)
 }

declare global {
  interface Window {
    gc: (...args:any[])=>any
  }
}
window.gc = getArcCenter
function TouchPoint({name,model,data}:{name:string;model:string;data?:number[]|null}) {
  return (
    <span className="control-point" data-name={name} data-model={model} style={{transform:data ? `translate(${data[0]}px,${data[1]}px)`:'unset',display:data?'flex':'none'}}></span>
  )
}

function App() {
  const [points,setPoints] = useState<Point[]>([{
    preM: [10,10]
  }])

  const [pointActive, setPointActive] = useState<null|number>(null)

  const [canvasSize,setCanvasSize] = useState<number[]>([400,400])

  const [canvasTransform,setCanvasTransform] = useState<number[]>([0.5,0.5,1,0,0]) // origin,scale,translate

  const [unfold, setUnFold] = useState<number|null>(null)

  const auxContext = useRef<{index:null|number;show:boolean;type:string;name:string;model:string}>({index:null,show:false,type:'',name:'',model:''}).current

  const [auxCanvas, setAuxCanvas] = useState<{width:number,height:number}>({width:400,height:400})

  const auxData = useMemo(()=>pointActive === null ? null : points[pointActive], [points, pointActive])

  const touchRef = useRef<RegisterType>(null)

  const mainRef = useRef<HTMLDivElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const auxRef = useRef<HTMLCanvasElement>(null)

  const canvasBoardRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef([0,0])

  const ctxRef = useRef<CanvasRenderingContext2D|undefined|null>()
  const auxCtxRef = useRef<CanvasRenderingContext2D|undefined|null>()
  const arcRef = useRef<{[k:string]:null|number}>({rx:null,ry:null,cx:null,cy:null,rotation:null,x1:null,x2:null,y1:null,y2:null,as:null,ae:null,laf:null,sf:null})
  const lineRef = useRef<{[k:string]:null|number}>({mx:null,my:null,lx:null,ly:null,hx:null,vy:null})
  const bezierRef = useRef<{[k:string]:null|number}>({mx:null,my:null,x1:null,x2:null,y1:null,y2:null,x:null,y:null})

  const context = useRef<ContextType>({origin:[],transform:[0.5,0.5,1,0,0]}).current

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
  
  type ArcType = ['arc',{[k:string]:number},{[k in AMT]:k extends 'dr' ? number : number[]}]
  type LineType = ['line',{[k:string]:number},{[k in LMT]?:number[]}]

  const getLineEndPoint = (M:[number,number],point:Point,ctx:LineType[1]) => {
    const {mx,my,lx,ly,hx,vy} = ctx
    switch (point.type) {
      case 'L':
        return [[...point.arguments],[lx,ly]]
      case 'H':
        return [[point.arguments![0],M[1]],[hx,my]]
      case 'V':
        return [[M[0],point.arguments![0]],[mx,vy]]
    }
  }

  const auxModelRender = ([type,auxcontext,model]:ArcType | LineType, noAnimate?:boolean)=>{
    if(!noAnimate){
      context.onModel = true
      setPoints(points => {
        const point = points![context.active!]
        const nextPoint = context.active === points.length ? null : points[context.active! + 1]
        const [mx,my] = getLastM(context.active)
        if (type === 'arc') {
          const {x1,y1,x2,y2,rx,ry,rotation,sf,laf} = arcRef.current as {[k:string]:number}
          if (mx!==x1||my!==y1||context.active===0){
            point.preM = [x1,y1]
          }
          if (nextPoint && !nextPoint.preM && !(point.arguments![5] === x2 && point.arguments![6] === y2)){
            nextPoint.preM = [point.arguments![5],point.arguments![6]]
          }
          point.arguments = [rx,ry,rotation/Math.PI*180,laf,sf,x2,y2]
        } else if (type === 'line') {
          const {mx:x1,my:y1,lx,ly,hx,vy} = auxcontext
          if (mx!==x1||my!==y1||context.active===0){
            point.preM = [x1,y1]
          }
          const [[ox,oy],[nx,ny]] = getLineEndPoint([mx,my],point,auxcontext)
          if (nextPoint && !nextPoint.preM && !(ox===nx&&oy===ny)){
            nextPoint.preM = [ox,oy]
          }
          point.arguments = [lx,ly,hx,vy].filter(item=>item!==undefined)
        }
        return [...points]
      })
    }
    switch (type) {
      case 'arc':
        setArcModelData(model as ArcType[2])
        arcRender(auxcontext as ArcType[1])
      break
      case 'line':
        setLineModelData(model as LineType[2])
        const {mx,my,lx,ly,hx,vy} = auxcontext
        const linecontext = lx !== undefined ? [mx,my,lx,ly] : hx !== undefined ? [mx,my,hx,my] : [mx,my,mx,vy]
        lineRender(linecontext)
      break
    }
    
  }
  if(!context.wheelAnimate){
    context.wheelAnimate = new Animate(wheel,true)
    context.translateAnimate = new Animate(auxModelRender,true)
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
    const points = context.points!
    const len = points.length
    index === undefined && (index = len)
    const nowPoint = points[index]
    if(nowPoint&&nowPoint.preM){
      return nowPoint.preM
    }else if(len||index!==0){
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
        console.log(278)
        // const [x,y] = getLastM(pointActive)
        points.slice(0,pointActive).forEach(item=>{
          item.preM&&(d+='M'+item.preM.join(' '))
          item.type&&(d+=item.type+item.arguments!.join(' '))
        })

        if(pointActive<points.length-1){
          const [nx,ny] = getLastM(pointActive+1)
          points.slice(pointActive+1).forEach((item,index)=>{
            if(index===0){
              d+='M'
              d+=item.preM?item.preM.join(' '):(nx+' '+ny)
            }else{
              item.preM&&(d+='M'+item.preM.join(' '))
            }
            item.type&&(d+=item.type+item.arguments!.join(' '))
          })
        }
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

  const arcSvg2Canvas = ({x1,y1,rx,ry,rotation,laf,sf,x,y}:{[k:string]:number}) => {
    const [cx,cy] = getArcCenter([x1,y1],[x,y],rx,ry,rotation,laf,sf)
    // const as = -Math.atan2(cy-y1,x1-cx) + rotation
    // const ae = -Math.atan2(cy-y,x-cx) + rotation
    const sin = Math.sin(rotation)
    const cos = Math.cos(rotation)
    const as = Math.atan2(((y1-cy)*cos-(x1-cx)*sin)*rx,((x1-cx)*cos+(y1-cy)*sin)*ry)
    const ae = Math.atan2(((y-cy)*cos-(x-cx)*sin)*rx,((x-cx)*cos+(y-cy)*sin)*ry)
    return {cx,cy,as,ae}
  }
  const arcRender = ({cx,cy,rx,ry,rotation,as,ae,sf}:{[k:string]:number}) => {
    const ctx = auxCtxRef.current!
    ctx.clearRect(0,0,auxCanvas.width,auxCanvas.height)
    ctx.beginPath()
    ctx.ellipse(cx,cy,rx,ry,rotation,as,ae,!sf)
    ctx.stroke()
  }

  const lineRender = ([x1,y1,x,y]:number[]) => {
    const ctx = auxCtxRef.current!
    ctx.clearRect(0,0,auxCanvas.width,auxCanvas.height)
    ctx.beginPath()
    ctx.moveTo(x1,y1)
    ctx.lineTo(x,y)
    ctx.stroke()
  }

  const auxRender = () => {
    if(pointActive===null)return
    const active = points[pointActive!]
    if (active.type === 'A') {
      const [rx,ry,_rotation,laf,sf,x,y] = active.arguments
      const rotation = _rotation*Math.PI/180
      /* if(rx>auxCanvas.width/2){
        auxCanvas.width = 2*rx
      }
      if(ry>auxCanvas.height/2){
        auxCanvas.height = 2*ry
      } */
      const [x1,y1] = getLastM(pointActive!)
      const res = arcSvg2Canvas({x1,y1,rx,ry,rotation,laf,sf,x,y})
      arcRef.current = {
        rx,ry,rotation,x1,x2:x,y1,y2:y,laf,sf,...res
      }
      // setAuxCanvas({...auxCanvas})
      const {pb,pr,pa,ps,pe,pd,dr,po} = getArcModelDetail()
      auxModelRender(['arc',{cx:res.cx,cy:res.cy,rx,ry,rotation,as:res.as,ae:res.ae,sf},{pb,pr,pa,ps,pe,pd,dr,po}], true)
    } else if (['L','H','V'].includes(active.type!)) {
      const [mx,my] = getLastM(pointActive!)
      let {lx,ly,hx,vy} = lineRef.current
      let line = {}
      switch (active.type) {
        case 'L':
          [lx,ly] = active.arguments
          line = {mx,my,lx,ly}
        break
        case 'H':
          [hx] = active.arguments
          line = {mx,my,hx}
        break
        case 'V':
          [vy] = active.arguments
          line = {mx,my,vy}
        break
      }
      lineRef.current = {...line}
      auxModelRender(['line',line,getLineModelDetail()], true)
    }
  }

  const getRelativeSite = (transform:number[],pageX:number,pageY:number) => {
    const [ox,oy,r,tx,ty] = transform
    const left = rectRef.current[0] + canvasSize[0]*ox*(1-r) + tx
    const top = rectRef.current[1] + canvasSize[1]*oy*(1-r) + ty
    return [(pageX - left)/r,(pageY - top)/r]
  }
  const arcModelMouseHandle =(pageX: number, preX: number, pageY:number,preY:number,type:string)=>{
    // const deltaX:number = (pageX - preX)/transform[2],deltaY:number = (pageY - preY)/transform[2]
    const [relativeX,relativeY] = getRelativeSite(context.transform,pageX,pageY)
    const arc = arcRef.current as {[k:string]:number}
    let {rx,ry,cx,cy,rotation,sf,x1,y1,x2,y2,as:oas,ae:oae} = arc
    const vx = relativeX - cx
    const vy = relativeY - cy
    const sin = Math.sin(rotation)
    const cos = Math.cos(rotation)
    switch(type){
      case 'pb':
        let _ry = (vx*sin-vy*cos)*(sf?1:-1)
        if (_ry < 0) {
          _ry = 0
        }
        arc.ry = _ry
        break
      case 'pa':
        let _rx = (vx*cos+vy*sin)
        if (_rx < 0) {
          _rx = 0
        }
        arc.rx = _rx
        break
      case 'ps':
        arc.as = Math.atan2((vy*cos-vx*sin)*rx,(vx*cos+vy*sin)*ry)
        break
      case 'pe':
        arc.ae = Math.atan2((vy*cos-vx*sin)*rx,(vx*cos+vy*sin)*ry)
        break
      case 'pr':
        arc.rotation = Math.atan2(vy,vx)
        break
      case 'po':
        arc.cx = relativeX
        arc.cy = relativeY
        break
      default:
        break
    }
    if (arc.as !== oas || arc.ae !== oae) {
      const A = getCA([x1-cx,cy-y1],[x2-cx,cy-y2]) > 0 
      const laf = sf ? +A : +!A
      arc.laf = laf
    }
    const {pb,pr,pa,ps,pe,pd,dr,po} = getArcModelDetail()
    context.translateAnimate?.push(['arc',arc,{pb,pr,pa,ps,pe,pd,dr,po}])
  }

  const lineModelMouseHandle = (pageX: number, preX: number, pageY:number,preY:number,type:string) => {
    const [relativeX,relativeY] = getRelativeSite(context.transform,pageX,pageY)
    const line = lineRef.current as {[k:string]:number}
    switch(type){
      case 'pm':
        line.mx = relativeX
        line.my = relativeY
        break
      case 'pl':
        line.lx = relativeX
        line.ly = relativeY
        break
      case 'ph':
        line.hx = relativeX
        break
      case 'pv':
        line.vy = relativeY
        break
      default:
        break
    }
    const {pm,pl,ph,pv} = getLineModelDetail()
    const res = {pm} as LineModelType
    pl ? res.pl = pl : ph ? res.ph = ph : res.pv = pv
    context.translateAnimate?.push(['line',line,res])
  }

  const modelMouseHandle = (pageX: number, preX: number, pageY:number,preY:number,type:string, model: string)=>{
    const [relativeX,relativeY] = getRelativeSite(context.transform,pageX,pageY)
    if (model === 'arc') {

    } else if (model === 'line') {

    } else if (model === 'bezier') {}
  }
  const [arcModelData,setArcModelData] = useState({
    pa:[0,0],
    pb:[0,0],
    pr:[0,0],
    ps:[0,0],
    pe:[0,0],
    pd:[0,0],
    po:[0,0],
    dr:0
  })

  type LineModelType = {[k in LMT]?:number[]}

  const [lineModelData,setLineModelData] = useState<LineModelType>({
    pm:[0,0],
    pl:[0,0],
    ph:[0,0],
    pv:[0,0]
  })

  const getArcModelDetail=()=>{
    const {rx,ry,cx,cy,rotation,as,ae,sf} = arcRef.current as {[k:string]:number}
    const rotate:(x:number,y:number,r:number)=>[number,number]=(x,y,r)=>{
      const c = cos(r),s = sin(r)
      return [x*c+y*s+cx,y*c-x*s+cy]
    }
    const {sin,cos} = Math
    const pb = rotate(0,sf ? -ry : ry,-rotation)
    const pr = rotate(rx+10,0,-rotation)
    const pa = rotate(rx,0,-rotation)
    const ps = rotate((rx+5)*cos(-as),-(ry+5)*sin(-as),-rotation)
    const [x1,y1] = rotate(rx*cos(-as),-ry*sin(-as),-rotation)
    arcRef.current.x1 = x1
    arcRef.current.y1 = y1
    const pe = rotate((rx+5)*cos(-ae),-(ry+5)*sin(-ae),-rotation)
    const [x2,y2] = rotate(rx*cos(-ae),-ry*sin(-ae),-rotation)
    arcRef.current.x2 = x2
    arcRef.current.y2 = y2
    const pd = rotate((rx+15)*cos(-as),-(ry+15)*sin(-as),-rotation)
    const dr = -Math.atan2(ry**2*(rx*cos(-as)),rx**2*(-ry*sin(-as)))+rotation
    const po = [cx,cy]
    return {pb,pr,pa,ps,pe,pd,dr,po}
  }

  const getLineModelDetail:()=>LineModelType=()=>{
    const {mx,my,lx,ly,hx,vy} = lineRef.current as {[k:string]:number}
    const pm = [mx,my]
    const pl = lx === undefined ? undefined : [lx,ly]
    const ph = hx === undefined ? undefined : [hx,my]
    const pv = vy === undefined ? undefined : [mx,vy]
    return {pm,pl,ph,pv} as LineModelType
  }

  useEffect(()=>{
    const {x,y} = canvasBoardRef.current?.getBoundingClientRect()!
    rectRef.current = [x,y]
  },[canvasSize])

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
    if(context.onModel){
      context.onModel = false
      return
    }
    setUnFold(null)
    canvasRender()
    if(pointActive!==null&&auxCtxRef.current){
      const active = points[pointActive]
      if(auxContext.index!==pointActive||auxContext.type!==active.type){
        auxContext.index = pointActive
        auxContext.type = active.type || ''
        auxRender()
      }
    }else {
      auxContext.index = pointActive
    }
  }, [points,pointActive])
  useEffect(()=>{
    pointActive!==null&&(context.active = pointActive)
  },[pointActive])
  useEffect(()=>{
    context.points = points
  },[points])
  useEffect(()=>{
    if(touchRef.current){
      touchRef.current.register({
        className: 'control-point',
        start(pageX,pageY,target){
          const name = target.dataset['name']
          auxContext.name = name || ''
          const model = target.dataset['model']
          auxContext.model = model || ''
        },
        move(this:touchContext,pageX:number,pageY:number){
          if (auxContext.model === 'arc') {
            arcModelMouseHandle(pageX,this.pageX!,pageY,this.pageY!,auxContext.name)
          } else if (auxContext.model === 'line') {
            lineModelMouseHandle(pageX,this.pageX!,pageY,this.pageY!,auxContext.name)
          }
        }
      })
      touchRef.current.register({
        className: 'direction',
        click: [1, ()=>{
          context.onModel = true
          const arc = arcRef.current as {[k:string]:number}
          arc.sf = +!arc.sf
          const {pb,pr,pa,ps,pe,pd,dr,po} = getArcModelDetail()
          context.translateAnimate?.push(['arc',arc,{pb,pr,pa,ps,pe,pd,dr,po}])
        },[]]
      })
    }
  },[])
  return (
    <div className="App">
      <div className="main" ref={mainRef}>
        <TouchItem ref={touchRef} className="touch-main">
          <div className="board">
            <div className="canvas" ref={canvasBoardRef} style={{width:canvasSize[0]+'px',height:canvasSize[1]+'px',transformOrigin:`${canvasTransform[0]*100}% ${canvasTransform[1]*100}%`,transform:`translate(${canvasTransform[3]}px,${canvasTransform[4]}px) scale(${canvasTransform[2]})`}}>
              <canvas id="main-canvas" ref={canvasRef} width={canvasSize[0]} height={canvasSize[1]}></canvas>
              <canvas id="aux-canvas" className={pointActive!==null?'show':''} ref={auxRef} width={auxCanvas.width} height={auxCanvas.height}></canvas>
              <div className="arc-model" style={{display:pointActive!==null && auxData?.type === 'A'?'block':'none'}}>
                {
                  Object.entries(arcModelData).map(([name, val])=>(
                    name === 'dr' ? null :
                    name === 'pd' ? (
                      <span className={`direction${arcRef.current.sf ?'':' reverse'}`} data-name="pd" data-model="arc" style={{transform:`translate(${arcModelData.pd[0]}px,${arcModelData.pd[1]}px) rotate(${arcModelData.dr}rad)`}} key="pd"></span>
                    ) : <TouchPoint name={name} model="arc" data={val as number[]}  key={name}></TouchPoint>
                  ))
                }
              </div>
              <div className="line-model" style={{display:pointActive!==null && ['L','H','V'].includes(auxData?.type!) ? 'block':'none'}}>
                {
                  Object.entries(lineModelData).map(([name, val])=>(
                    <TouchPoint name={name} model="line" data={val as number[]}  key={name}></TouchPoint>
                  ))
                }
              </div>
              <div className="bezier-model" style={{display:pointActive!==null && ['C','S','Q','T'].includes(auxData?.type!) ? 'block':'none'}}></div>
            </div>
          </div>
        </TouchItem>
      </div>
      {/* <div className="points">
        {
          points.map((item,index)=>(
            <PointC key={index} active={pointActive===index} index={index} unfold={unfold===index} data={item} clickPoint={()=>clickPoint(index)} selectChange={(event,value)=>selectChange(event,value,index)} appendPoint={appendPoint} setPoints={setPoints}/>
          ))
        }
        <button onClick={()=>appendPoint(points.length)}>add point</button>
      </div> */}
      <div className="right-bar">
        <div className="points"></div>
        <div className="attributes-board">
        <PointC active={pointActive!==null} index={pointActive!} unfold={unfold===pointActive} data={auxData!} clickPoint={()=>clickPoint(pointActive!)} selectChange={(event,value)=>selectChange(event,value,pointActive!)} appendPoint={appendPoint} setPoints={setPoints}/>
        </div>
      </div>
    </div>
  );
}

export default App;
