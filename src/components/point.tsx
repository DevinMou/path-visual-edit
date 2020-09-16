import React, { useMemo, useRef, useState, useEffect } from 'react'
import './point.scss'
import Select from './select'
import { Point } from '../App'

interface Pf {
  (points:Point[]):Point[]
}

interface PointType {
  active: boolean
  points: Point[]
  clickPoint: ()=>void
  index: number
  unfold: boolean
  data: Point
  selectChange: (event:React.MouseEvent,value:string)=>void
  appendPoint: (index:number)=>void
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

function PointArguments ({type,args,pointArguments,index,handle,isPreM}:{type:string;args:number[];pointArguments:pArguments;index:number;handle:(...args:any[])=>void;isPreM?:boolean}) {

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

export default function PointC ({active,clickPoint,index,unfold,data,points,selectChange,appendPoint}:PointType) {
  const selectCancle = ()=>{

  }
  const disableOption = useMemo(()=>{
    const current = points[index]
    const pre = index===0 ? null : points[index-1]
    const next = index===points.length-1 ? null : points[index+1]
    const disable = []
    if(!pre&&current.preM){
      disable.push('M')
    }
    if(pre&&(!pre.type||!['C','S'].includes(pre.type))){
      disable.push('S')
    }
    if(pre&&(!pre.type||!['Q','T'].includes(pre.type))){
      disable.push('T')
    }
    if(next){}

  },[points,index])
  return (
    <>
      <div className="insert-before" onClick={()=>appendPoint(index)}></div>
      <div className="point">
        <div className={`select-area${active?' active':''}`} onClick={clickPoint}></div>
        <div className="point-main">
          {
            data&&data.type ? (
              <div className="point-row">
                <Select className="point-type" unfold={unfold} value={data.type} handleChange={(event,value)=>selectChange(event,value)}></Select>
              </div>
            ) : null
          }
          <div className={`point-row${!data.type||unfold?'':' hidden'}`}>
            <Select className="point-type" unfold={unfold} handleChange={(event,value)=>selectChange(event,value)} handleClose={selectCancle}></Select>
          </div>
        </div>
      </div>
    </>
  )
}