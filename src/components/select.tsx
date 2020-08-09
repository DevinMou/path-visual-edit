import React, { useMemo, useRef, useState, useEffect } from 'react'
import './select.scss'

interface SelectProps<T> {
  className?: string
  unfold?: boolean
  value:T
  options:{
    value: T
    label: string
  }[]
  handleChange: (...args:any[])=>void
}

const Select:<T>({className,unfold,value,options,handleChange}:SelectProps<T>)=>React.FunctionComponentElement<SelectProps<T>> = ({className, unfold,value,options,handleChange})=> {
  const context = useRef({map:new Map()}).current
  const [selected,setSelected] = useState(false)
  const dist = useMemo(()=>{
    context.map.clear()
    options.forEach(item=>context.map.set(item.value,item.label))
    return context.map
  },[options, context.map])
  const optionClick = (event:React.MouseEvent,value:any)=>{
    handleChange(event, value)
    setSelected(false)
  }
  useEffect(()=>{
    unfold&&setSelected(true)
  },[])
  return (
    <span className={`select${className?' '+className:''}`}>
      <span className={`select-mask${selected?' active':''}`} onClick={()=>setSelected(false)}></span>
      <span className="select-value" onClick={()=>setSelected(true)}>{dist.get(value)}</span>
      <span className={`select-options${selected?' active':''}`}>
        {
          options.map((item,index)=><span key={index} className={value===item.value?'active':''} onClick={event=>optionClick(event,item.value)}>{item.label}</span>)
        }
      </span>
    </span>
  )
}

export default Select
