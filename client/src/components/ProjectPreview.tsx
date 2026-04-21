import React, { forwardRef, useImperativeHandle } from 'react'
import type { Project } from '../assets';
import { iframeScript } from '../assets/assets.ts';
import EditorPanel from '../components/Editorpanel';
import LoaderSteps from './LoaderSteps.tsx';




export interface ProjectPreviewProps {
 project: Project;
 isGenerating: boolean;
 device?: 'phone' | 'tablet' | 'desktop';
 showEditorPanel?: boolean;
}
export interface ProjectPreviewRef {
 getCode: () => string | undefined;
}

const ProjectPreview =forwardRef<ProjectPreviewRef,ProjectPreviewProps>
(( {project,isGenerating,device='desktop',showEditorPanel=true},ref) => {
    

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [selectedElement,setSelectedElement]=React.useState<any>(null);

    const resolutions = {
        phone:'w-[412px]',
        tablet:'w-[768px]',
        desktop:'w-full'

    }

    useImperativeHandle(ref, () => ({
        getCode: () => {
            const doc=iframeRef.current ?.contentDocument;
            if(!doc) return undefined;
            
            //1. Remove our selection class/attributes/outline /outline from all elements before getting the code
            doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el) => {
                el.classList.remove('ai-selected-element');
                el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            
            })

            //2. Remove injected style script from the document

            const previewStyle= doc.getElementById('ai-preview-style');
            if(previewStyle)  previewStyle.remove();
          return doc.documentElement.outerHTML;
        }
    }))
    React.useEffect(() => {
            const handleMessage = (event: MessageEvent) => {
                if (event.data && event.data.type === 'ELEMENT_SELECTED') {
                    setSelectedElement(event.data.payload);
                }else if(event.data.type === 'CLEAR_SELECTION'){
                    setSelectedElement(null)
                }
            }
            window.addEventListener('message', handleMessage);
            return () => 
                window.removeEventListener('message', handleMessage);
    }, [])

    const handleUpdate=(updates:any) => {
        if(iframeRef.current ?.contentWindow){
            iframeRef.current.contentWindow.postMessage({type:'UPDATE_ELEMENT_REQUEST', payload:updates}, '*');
        }
    }
    const injectPreview = (html: string) => {
        if(!html) return '';
        if(!showEditorPanel) return html

        if(html.includes('</body>')){
            return html.replace('</body>',iframeScript+'</body>');
        }else{
            return html+iframeScript;
        }
    }
  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ? (
        <>
            <iframe ref={iframeRef} srcDoc={injectPreview(project.current_code)} className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`} />
            {showEditorPanel && (<EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={() => {setSelectedElement(null);
                if(iframeRef.current ?.contentWindow){
                    iframeRef.current.contentWindow.postMessage({type:'CLEAR_SELECTION_REQUEST'}, '*');
                }
             } } />
        )}
        </>
):isGenerating && (
    <LoaderSteps/>
)}

    </div>
  )
})

export default ProjectPreview