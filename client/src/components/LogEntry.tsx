import { useState } from 'react';

interface FinalMusik {
    createdAt: Date,
    gridFileName: string,
    gridId: string,
    originalName: string,
    updatedAt: Date,
    __v: 0,
    _id: string
    batesIndices: Array<number>,
    batesNumbers: Array<string>,
    batesPrefix: string,
    textPiece: string
    size: number
}

export default function LogEntry (props: {musik: FinalMusik, currentFile: { fileSetIndex: number, thisFile: File }, becomeHighlighted: (name: string, size: number) => void, processUndergoing: boolean, key: number}) {

    const [contentToggle, setContentToggle] = useState<boolean>(true);

    const isHighlighted = (props.musik.originalName === props.currentFile.thisFile.name) && (props.musik.size === props.currentFile.thisFile.size);

    const operateBecomeHighlighted = () => {
        setContentToggle(true)
        props.becomeHighlighted(props.musik.originalName, props.musik.size)
    }

    return (
        <div className={`${props.processUndergoing ? 'hover:cursor-default ' : ''}hover:cursor-pointer mt-3 mx-3 min-h-[80px] shadow-lg bg-teal-200 shrink-0${isHighlighted ? ' !bg-sky-700 text-slate-100' : ''}`} onClick={() => (!isHighlighted && !props.processUndergoing) ? operateBecomeHighlighted() : setContentToggle(prev => !prev)}>
            <div className={`bg-teal-600 shadow-lg p-1 font-bold text-lg${isHighlighted ? ' !bg-sky-900' : ''}`}>{props.musik.originalName}</div>
            {!isHighlighted ?
                <div className="p-2 text-xl font-bold">· · ·</div> :
                <>
                    {contentToggle ?
                    <>
                        <div className="p-2 pb-1">
                            hello
                        </div>
                        <div className="p-2 pt-1">
                            Extracted Text Snippet:
                            <div className="rounded-lg max-h-96 overflow-y-scroll bg-slate-800 mt-1 p-1 text-violet-400">
                                <pre>ahoy</pre>
                            </div>
                        </div>
                    </> :
                    <div className="p-2 text-xl font-bold">· · ·</div>
                    }
                    
                </>
            }
        </div>
    )
}