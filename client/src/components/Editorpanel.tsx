import { X } from 'lucide-react';
import React, { use } from 'react'


interface EditorPanelProps {
  selectedElement:{
     tagName: string;
     className: string;
     text: string;
     styles:{
         padding:string;
         margin:string;
         backgroundColor:string;
          color:string;
          fontSize:string;
     };
  } | null;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const Editorpanel = ({ selectedElement,onUpdate,onClose }: EditorPanelProps) => {

  const [values, setValues] = React.useState(selectedElement)
 

  React.useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);
  if (!selectedElement || !values) return null;

    const handleChange=(field:string, value:string) => {
     const newValues={...values, [field]: value};
     if(field in values.styles){
       newValues.styles={...values.styles, [field]: value};
     }
     setValues(newValues);
     onUpdate({[field]: value});
  }

  const handleStyleChange=(stylename:string, value:string) => {
    const newStyles={...values, styles:{...values.styles, [stylename]: value}};
    setValues({...values, styles:newStyles.styles});
    onUpdate({styles: {[stylename]: value}});
  }

  return (
    <div className='absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in fade-in'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-gray-800 font-semibold'>
          Edit Element
        </h3>
        <button className='p-1 hover:bg-gray-100 rounded-full' onClick={onClose}>
          <X className='w-4 h-4 text-gray-500'/>
        </button>
      </div>
      <div className='space-y-4 text-black'>
        <div>
          <label className='block text-sm font-medium text-gray-500 mb-1'>Text Content</label>
          <textarea 
            name="textContent" 
            id="textContent" 
            className='w-full text-sm p-2 border border-rounded border-gray-400 rounded-md focus:ring-indigo-500 outline-none min-h-20'
            value={values.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />
        </div>
         <div>
          <label className='block text-sm font-medium text-gray-500 mb-1'>Class Name</label>
          <input 
            type='text'
            className='w-full text-sm p-2 border border-rounded border-gray-400 rounded-md focus:ring-indigo-500 outline-none min-h-20'
            value={values.className || ''}
            onChange={(e) => handleChange("className", e.target.value)}
          />
        </div>
         
         <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-500 mb-1'>Padding</label>

              <input 
            type='text'
            className='w-full text-sm p-2 border border-rounded border-gray-400 rounded-md focus:ring-indigo-500 outline-none min-h-20'
            value={values.styles.padding || ''}
            onChange={(e) => handleStyleChange("padding", e.target.value)}
          />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-500 mb-1'>Margin</label>

              <input 
            type='text'
            className='w-full text-sm p-2 border border-rounded border-gray-400 rounded-md focus:ring-indigo-500 outline-none min-h-20'
            value={values.styles.margin || ''}
            onChange={(e) => handleStyleChange("margin", e.target.value)}
          />
            </div>
         </div>


          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-500 mb-1'>Font Size</label>

              <input 
            type='text'
            className='w-full text-sm p-2 border border-rounded border-gray-400 rounded-md focus:ring-indigo-500 outline-none min-h-20'
            value={values.styles.fontSize || ''}
            onChange={(e) => handleStyleChange("fontSize", e.target.value)}
          />
            </div>
           </div> 
           

            <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-500 mb-1'>Background</label>
               <div className='flex items-center gap-2 border border-gray-400 rounded-md p-1'>
              
              <input 
            type='text'
            className='w-6 h-6 cursor-pointer '
            value={values.styles.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : values.styles.backgroundColor}
            onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
          />
          <span className='text-xs text-gray-600 truncate'>{values.styles.backgroundColor}</span>
           </div>
            </div>


             <div>
              <label className='block text-sm font-medium text-gray-500 mb-1'>Text Color</label>
               <div className='flex items-center gap-2 border border-gray-400 rounded-md p-1'>
              
              <input 
            type='text'
            className='w-6 h-6 cursor-pointer '
            value={values.styles.color === 'rgba(0, 0, 0, 0)' ? '#ffffff' : values.styles.color}
            onChange={(e) => handleStyleChange("color", e.target.value)}
          />
           <span className='text-xs text-gray-600 truncate'>{values.styles.color}</span>
           </div>


            </div>
            </div>
      </div>
    </div>
  )
}

export default Editorpanel