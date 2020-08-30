import React, { useRef, forwardRef, useImperativeHandle } from 'react';

interface RegisterOptions {
    id?: string
    className?: string
    start?: (pageX:number,pageY:number,target:HTMLElement)=>void
    move?: (pageX:number,pageY:number)=>void
    end?: ()=>void
    click?: [number,()=>void,any[]]
    press?: [number,()=>void,any[]]
}


interface TouchContext {
    lock: boolean
    touch: any
    timer: null | number
    hub: {[key:string]:touchInstance}
    classArr: Map<Set<string>,touchInstance>
}

export interface RegisterType {
    register:(payload:RegisterOptions)=>void
}

enum op {
    C = 'click',
    P = 'press'
}

enum TouchStatus {
  STATUS_DOWN = 0,
  STATUS_MOVE = 1
}

export interface touchContext { 
  pageX: null | number
  pageY: null | number
  status: TouchStatus
  events: touchInstance
  startDate: number
}

type touchInstance = {
    [key in op]?: {
        [key: number]: [()=>void,any[]]
    }
} & {
    combo: number
    lastDate: null | number
} & {
    [key: string]: (pageX: number,pageY: number, target?: HTMLElement)=>void
}

export const FeedBack = forwardRef<RegisterType,{children:any;className: string;style?: React.CSSProperties}>(({children,className:parentClass,style},ref) => {
    const STATUS_DOWN = 0
    const STATUS_MOVE = 1
    const COMBO_DELAY = 500
    const customRef = useRef<TouchContext>({
        lock: false,
        touch: {},
        hub: {},
        classArr: new Map(),
        timer: null
    })
    const _this = customRef.current
    useImperativeHandle(ref,()=>({
        register(payload:RegisterOptions) {
            _this.classArr.clear()
            const { id, className, ...events } = payload
            if (!id && !className) return
            const selector = id ? '#' + id : '.' + className
            const oldObj:touchInstance = _this.hub[selector] || { combo: 0, lastDate: null }
            for (const eventName in events) {
              if (eventName === 'click' || eventName === 'press') {
                const value = events[eventName]
                if(value){
                  oldObj[eventName] = oldObj[eventName] || {}
                  const n = value[0]
                  const oo = oldObj[eventName] as any[]
                  if(oo){
                      oo[n] = value.slice(1)
                  }
                }
              } else {
                oldObj[eventName] = events[eventName as keyof typeof events] as ()=>void
              }
            }
            _this.hub[selector] = oldObj
        }
    }))
    const findOne = function(target:HTMLElement) {
        if (!target.id && !target.className) return false
        if (!_this.classArr.size) {
          for (const s in _this.hub) {
            if ((s as string).charAt(0) === '.') {
              _this.classArr.set(new Set(s.slice(1).split(' ')), _this.hub[s])
            }
          }
        }
        if (target.id && (('#' + target.id) in _this.hub)) {
          return _this.hub['#' + target.id]
        } else {
          for(let [k,v] of _this.classArr){
            if (new Set([...k, ...target.classList]).size === target.classList.length) {
              return v
            }
          }
          return false
        }
      }
    const startHandle = function (event:React.MouseEvent) {
        if (_this.lock||!Object.keys(_this.hub).length||_this.touch.status!==undefined) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        const nowDate = new Date().getTime()
        const { pageX, pageY, target } = event
        let events!:touchInstance
        if (!target) return
        let _target:HTMLElement = target as HTMLElement
        while (!0) {
            if(!_target){
                break
            }
            const res = findOne(_target)
            if (res) {
            events = res
            break
            } else if (_target === document.documentElement) {
            break
            } else if (_target.parentNode) {
            _target = _target.parentNode as HTMLElement
            }
        }
        if (events) {
            const touch: touchContext = { pageX: null, pageY: null, status: STATUS_DOWN, events, startDate: new Date().getTime() }
            if (touch.events.lastDate && nowDate - touch.events.lastDate >= COMBO_DELAY) {
            touch.events.combo = 0
            }
            touch.events.lastDate = nowDate
            _this.touch = touch
            if (events.start) {
            events.start.call(touch,pageX,pageY,_target)
            // events.start.bind(touch)(pageX, pageY)
            }
            if (events.press) {
            const timeArr:string[] = Object.keys(events.press)
            const timeFn = () => {
                if (timeArr.length) {
                const time = Number(timeArr.shift())
                return window.setTimeout(() => {
                    const [fn, bubble] = events.press && time!==undefined ? events.press[time] : []
                    if (bubble) {
                    _this.timer = timeFn()
                    } else {
                    _this.timer = null
                    }
                    fn&&fn()
                }, 0)
                } else {
                return null
                }
            }
            _this.timer = timeFn()
            }
        }
      }
  
    const moveHandle = function (event:React.MouseEvent) {
        if (_this.lock || _this.touch.status===undefined) {
          return
        }
        // event.preventDefault()
        event.stopPropagation()
        if (_this.timer !== null) {
          clearTimeout(_this.timer)
        }
        const { pageX, pageY } = event
        const touch = _this.touch
        if (!touch) {
        return
        }
        touch.status = STATUS_MOVE
        if (touch.events.move && touch.pageX !== null) {
        touch.events.move.bind(touch)(pageX, pageY)
        }
        touch.pageX = pageX
        touch.pageY = pageY
      }
  
    const endHandle = function (event:React.MouseEvent) {
        if (_this.lock || _this.touch.status===undefined) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        if (_this.timer !== null) {
          clearTimeout(_this.timer)
        }
        const nowDate = new Date().getTime()
        const { pageX, pageY } = event
        const touch = _this.touch
        if (!touch) {
        return
        }
        const derDate = nowDate - touch.events.lastDate
        let execed = false
        if (touch.status === STATUS_MOVE) {
        touch.events.combo = 0
        } else if (touch.status === STATUS_DOWN) {
        if (touch.events.combo === 0) {
            if (derDate >= COMBO_DELAY) {
            } else {
            touch.events.combo += 1
            }
        } else {
            if (derDate >= COMBO_DELAY) {
            touch.events.combo = 0
            } else {
            touch.events.combo += 1
            }
        }
        if (touch.events.combo > 0 && touch.events.click && touch.events.click[touch.events.combo] && touch.events.click[touch.events.combo][0]) {
            execed = true
            touch.events.click[touch.events.combo][0].bind(touch)()
            touch.events.combo = 0
        }
        }
        touch.events.lastDate = nowDate
        if (touch.events.end && !execed) {
        touch.events.end.bind(touch)(pageX, pageY)
        }
        _this.touch = {}
      }

  return (
    <div className={["touch-box",parentClass].join(' ')} style={style} onMouseDown={startHandle} onMouseMove={moveHandle} onMouseUp={endHandle}>
      {children}
    </div>
  )
})

export const TouchItem = React.memo(FeedBack);