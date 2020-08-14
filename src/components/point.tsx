import React, { useMemo, useRef, useState, useEffect } from 'react'
import './select.scss'
import Select from './select'

interface PointType {
  active: boolean
  clickPoint: (event:React.MouseEvent)=>void
  index: number
  unfold: boolean
  data: any
  selectChange: (event:React.MouseEvent,value:string)=>void
  appendPoint: (index:number)=>void
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

export default function Point ({active,clickPoint,index,unfold,data,selectChange,appendPoint}:PointType) {
  const selectCancle = ()=>{

  }
  return (
    <>
      <div className="insert-before" onClick={()=>appendPoint(index)}></div>
      <div className="point">
        <div className={`select-area${active?' active':''}`} onClick={(event)=>clickPoint(event)}></div>
        <div className="main">
          <Select className="point-type" unfold={unfold} options={pointType} handleChange={(event,value)=>selectChange(event,value)} handleClose={selectCancle}></Select>
          <Select className="point-type" unfold={unfold} value={data.type} options={pointType} handleChange={(event,value)=>selectChange(event,value)}></Select>
        </div>
      </div>
    </>
  )
}