import React, { useMemo, useRef, useState, useEffect } from 'react'
import './select.scss'

interface SelectProps<T> {
  className?: string
  unfold?: boolean
  value?:T
  handleChange: (...args:any[])=>void|boolean
  handleClose?: ()=>void
}

const options: {value: any;label: string}[] = [
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

const Select:<T>({className,unfold,value,handleChange,handleClose}:SelectProps<T>)=>React.FunctionComponentElement<SelectProps<T>> = ({className, unfold,value,handleChange,handleClose})=> {
  const context = useRef({map:new Map()}).current
  const [selected,setSelected] = useState(false)
  const dist = useMemo(()=>{
    context.map.clear()
    options.forEach(item=>context.map.set(item.value,item.label))
    return context.map
  },[context.map])
  const optionClick = (event:React.MouseEvent,value:any)=>{
    if(handleChange(event, value))return
    setSelected(false)
  }
  const maskClick = ()=>{
    setSelected(false)
    handleClose&&handleClose()
  }
  useEffect(()=>{
    unfold&&setSelected(true)
  },[])
  return (
    <span className={`select${className?' '+className:''}`}>
      <span className={`select-mask${selected?' active':''}`} onClick={maskClick}></span>
      <span className={ value ? "select-value": "select-empty"} onClick={()=>setSelected(true)}>{ value ? dist.get(value) : '+'}</span>
      <span className={`select-options${selected?' active':''}`}>
        {
          options.map((item,index)=><span key={index} className={value===item.value?'active':''} onClick={event=>optionClick(event,item.value)}>{item.label}</span>)
        }
      </span>
    </span>
  )
}

export default Select
