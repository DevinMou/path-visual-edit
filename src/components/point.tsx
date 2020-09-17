import React, { useMemo } from 'react'
import './point.scss'
import Select from './select'
import { Point } from '../App'

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

export default function PointC ({active,clickPoint,index,unfold,data,points,selectChange,appendPoint}:PointType) {
  const selectCancle = ()=>{

  }
  const disableOption = useMemo(()=>{
    const current = points[index]
    const pre = index===0 ? null : points[index-1]
    const next = index===points.length-1 ? null : points[index+1]
    const disable = []
    const all = ['M','L','H','V','C','S','Q','T','A','Z']
    if(current.preM){
      disable.push('M')
    }
    if(!pre){
      disable.push('S','T')
    }
    if(pre&&(!pre.type||!['C','S'].includes(pre.type))){
      disable.push('S')
    }
    if(pre&&(!pre.type||!['Q','T'].includes(pre.type))){
      disable.push('T')
    }
    if(next&&next.type&&next.type==='S'){
      disable.push(...all.filter(item=>!['C','S'].includes(item)))
    }
    if(next&&next.type&&next.type==='T'){
      disable.push(...all.filter(item=>!['Q','T'].includes(item)))
    }
    return [...new Set(disable)]
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
                <Select disableOption={disableOption} className="point-type" unfold={unfold} value={data.type} handleChange={(event,value)=>selectChange(event,value)}></Select>
              </div>
            ) : null
          }
          <div className={`point-row${!data.type||unfold?'':' hidden'}`}>
            <Select disableOption={disableOption} className="point-type" unfold={unfold} handleChange={(event,value)=>selectChange(event,value)} handleClose={selectCancle}></Select>
          </div>
        </div>
      </div>
    </>
  )
}