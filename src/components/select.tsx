import React, { useMemo, useRef } from 'react'
import './select.scss'

interface SelectProps<T> {
    value:T
    options:{
        value: T
        label: string
    }[]
    handleChange: (arg:any)=>void
}

const Select:<T>({value,options,handleChange}:SelectProps<T>)=>React.FunctionComponentElement<SelectProps<T>> = ({value,options,handleChange})=> {
    const context = useRef({map:new Map()}).current
    const dist = useMemo(()=>{
        context.map.clear()
        options.forEach(item=>context.map.set(item.value,item.label))
        return context.map
    },[options, context.map])
    const optionClick = (value:any)=>{
        handleChange(value)
    }
    return (
        <span className="select">
            <span className="select-value">{dist.get(value)}</span>
            <span className="select-options">
                {
                    options.map((item,index)=><span key={index} className={value===item.value?'active':''} onClick={()=>optionClick(item.value)}>{item.label}</span>)
                }
            </span>
        </span>
    )
}

export default Select
