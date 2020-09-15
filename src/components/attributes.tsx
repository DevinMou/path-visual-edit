import React, { useMemo, useRef, useState, useEffect } from 'react'
import './point.scss'
import Select from './select'
import { Point } from '../App'

interface Pf {
  (points:Point[]):Point[]
}

interface PointType {
  index: number
  data: Point
  selectChange: (event:React.MouseEvent,value:string)=>void
  setPoints(points:Point[] | Pf):void
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

export default function PointC ({index,data,selectChange,setPoints}:PointType) {
  const selectCancle = ()=>{

  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>,pointIndex:number,argumentIndex:number,isPreM?:boolean) => {
    setPoints(points=>{
      const arr = [...points]
      if (isPreM) {
        arr[pointIndex].preM![argumentIndex] = +event.target?.value
      }else {
        arr[pointIndex].arguments![argumentIndex] = +event.target?.value
      }
      return arr
    })
  }

  return (
    <>
      <div className="point">
        <div className="point-main">
          {
            data&&data.hasOwnProperty('preM') ? 
              data.preM ? (
                <div className="point-row">
                  <span className="point-type">M</span>
                  <PointArguments type="M" args={data.preM} pointArguments={pointArguments} index={index} isPreM={true} handle={handleChange}/>
                </div>
              ) : (
                <div className="point-row">
                  <span className="point-type">M</span>
                  <div className="connect"></div>
                </div>
              )
             : null
          }
          {
            data&&data.type ? (
              <div className="point-row">
                <Select className="point-type" unfold={false} value={data.type} options={pointType} handleChange={(event,value)=>selectChange(event,value)}></Select>
                <PointArguments type={data.type} args={data.arguments!} pointArguments={pointArguments} index={index} handle={handleChange}/>
              </div>
            ) : null
          }
          <div className={`point-row${!data||!data.type?'':' hidden'}`}>
            <Select className="point-type" unfold={false} options={pointType} handleChange={(event,value)=>selectChange(event,value)} handleClose={selectCancle}></Select>
          </div>
        </div>
      </div>
    </>
  )
}