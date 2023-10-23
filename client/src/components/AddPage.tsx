import axios from 'axios'
import ProcessHeader from './ProcessHeader.tsx'
import LogEntry from './LogEntry.tsx'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { IconContext } from "react-icons";
import { BsFileEarmarkPdf } from 'react-icons/bs'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const userAxios = axios.create();

userAxios.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export default function AddPage() {

    const [processUndergoing, setProcessUndergoing] = useState<boolean>(false);
    const [finishedProcesses, setFinishedProcesses] = useState<Array<FinalMusik>>([])
    const [currentFile, setCurrentFile] = useState<{thisFile: File, fileSetIndex: number}>({thisFile: new File([""], ''), fileSetIndex: 0});
    const [fileSet, setFileSet] = useState<FileList | null>(null)
    const [currentPdfData, setCurrentPdfData] = useState<{data: Uint8Array} | null>(null)
    const [pages, setPages] = useState<number>(0)
    const navigate = useNavigate()



    interface MusikType {
        file: {
            bucketName: 'd',
            chunkSize: number,
            contentType: 'application/pdf',
            encoding: '7bit',
            fieldname: 'file',
            filename: string,
            id: string,
            metadata: null,
            mimetype: 'application/pdf',
            originalname: string,
            size: number,
            uploadDate: Date
        },
        savedMusik: {
            createdAt: Date,
            gridFileName: string,
            gridId: string,
            originalName: String,
            updatedAt: Date,
            __v: 0,
            _id: string
        }
    }

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

    const becomeHighlighted = (name: string, size: number) => {
        let fileIndex: number = -1;
        for (let i = 0; i < (fileSet as FileList).length; i++) {
            if ((fileSet as FileList)[i].name === name && (fileSet as FileList)[i].size === size) {
                fileIndex = i
                break;
            }
        }
        if (fileIndex != -1) {
            fileNavigate(null, false, true, fileIndex)
        } else {
            console.log("Failed to find highlighted file in fileIndex.")
        }
    }

    const buildPageArray = () => {
        let pageArray = [];
        for (let i = 1; i <= pages; i++) {
            pageArray.push(<Page className="w-[400px] m-2" pageNumber={i} key={i}/>)
        }
        return pageArray;
    }

    const buildProcessElements = (): Array<JSX.Element> => {
        const logEntryArray: Array<JSX.Element> = [];
        (finishedProcesses as Array<FinalMusik>).forEach((musik, i) => logEntryArray.push(<LogEntry musik={musik} currentFile={currentFile} becomeHighlighted={becomeHighlighted} processUndergoing={processUndergoing} key={i}/>))
        return logEntryArray;
    }

    const trueProcessUndergoing = buildProcessElements().length != 0 ? (processUndergoing || (buildProcessElements().length != (fileSet as FileList).length && buildProcessElements().length > 0)) : false;

    const handleNavNav = () => {
        navigate('/nav')
    }

    const handleUpload = (files: FileList) => {
        setFileSet(files)
        setFinishedProcesses([])
        setCurrentFile({thisFile: files[0], fileSetIndex: 0})
        handleDisplay(files[0])
    }

    const handleDisplay = (file: File) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file)
        reader.onloadend = function() {
        setCurrentPdfData({data: new Uint8Array(reader.result as ArrayBuffer)})
        }
    }

    const handleFileExtractAndUpdate = async (discoveryId: string): Promise<void | FinalMusik> => {
        let formData = new FormData()
        formData.append('file', currentFile.thisFile as File)
        try {
            const response = await userAxios.post(`/api/protected/document_manip/extract_and_update/${discoveryId}`, {});
            return response.data as FinalMusik;
        } catch (err) {
            console.log(err)
        }
    }

    const handleFileInsert = async (): Promise<void | MusikType> => {
        let formData = new FormData()
        formData.append('file', currentFile.thisFile as File)
        try {
            const response = await userAxios.post('/api/protected/insert_file', formData, {
                headers: { enctype: "multipart/form-data" }
            })
            return response.data as MusikType;
        } catch (err) {
            console.error('File upload failed:', err)
        }
    }

    const fileNavigate = (direction: 1 | -1 | null, wasButton: boolean = false, wasClick: boolean = false, navIndex: number | null = null) => {
        if (!wasClick) {
            setCurrentFile(prevFile => ({
                thisFile: (fileSet as FileList)[prevFile.fileSetIndex + (direction as 1 | -1)],
                fileSetIndex: prevFile.fileSetIndex + (direction as 1 | -1)
                })
            )
        } else {
            setCurrentFile({
                thisFile: (fileSet as FileList)[navIndex as number],
                fileSetIndex: navIndex as number
            })
            handleDisplay((fileSet as FileList)[navIndex as number])
        }
        
        if (wasButton) {
            handleDisplay((fileSet as FileList)[currentFile.fileSetIndex + (direction as 1 | -1)])
        }
        
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/pdf': ['.pdf']
        },
        onDrop: (acceptedFiles) => handleUpload(acceptedFiles as unknown as FileList)
    })

    const documentRender = useMemo(() => {
        return (
            currentPdfData &&
            <div className="overflow-y-scroll h-pdfcalc w-fit min-w-[643px] bg-blue-500">
                    <Document 
                        className="w-fit max-w-4xl"
                        file={currentPdfData}
                        loading={<div className="h-pdfcalc w-[628px] bg-blue-700"></div>}
                        onLoadSuccess={({ numPages }) => {
                            setPages(numPages)
                        }}
                    >
                    {buildPageArray()}
                </Document>
            </div>
    )}, [currentPdfData, pages])

    let isAscendDisabled;
    let isDescendDisabled;
    if(fileSet && fileSet.length >= 2) {
        isDescendDisabled = currentFile.fileSetIndex === fileSet.length - 1 ? true : false;
        isAscendDisabled = currentFile.fileSetIndex === 0 ? true : false;
    }

    const determineProcess = async () => {
        if (processUndergoing && (currentFile.fileSetIndex < (fileSet as FileList).length - 1) && (fileSet as FileList).length != 1) {
            await processFile()
        } else if (processUndergoing && currentFile.fileSetIndex === (fileSet as FileList).length - 1) {
            await processFile()
            setProcessUndergoing(false)
            if ((fileSet as FileList).length != 1) {
                setCurrentFile({thisFile: (fileSet as FileList)[0], fileSetIndex: 0})
            }
        }
    }

    const processStart = () => {
        processFile()
        if ((fileSet as FileList).length != 1) {
            setProcessUndergoing(true)
        }
    }

    const processFile = async (): Promise<void> => {
        const fileAndMusikData: void | MusikType = await handleFileInsert()
        if (fileAndMusikData) {
            const updatedDocument: void | FinalMusik = await handleFileExtractAndUpdate(fileAndMusikData.savedMusik._id)
            if (updatedDocument) {
                setFinishedProcesses(prev => [...prev, updatedDocument])
                if (currentFile.fileSetIndex != (fileSet as FileList).length - 1) {
                    fileNavigate(1)
                }
            }
        }
    }

    useEffect(() => {
        determineProcess()
    }, [currentFile])

    

    const decideDisplayedFilename = () => {
        if (trueProcessUndergoing && (fileSet as FileList)[0].name.length > 30) {
            return (fileSet as FileList)[0].name.slice(0, 26) + "...";
        } else if (trueProcessUndergoing) {
            return (fileSet as FileList)[0].name.slice(0, (fileSet as FileList)[0].name.length - 4);
        } else if (currentFile.thisFile.name.length > 30) {
            return (currentFile.thisFile as File).name.slice(0, 26) + "..."
        }
        return (currentFile.thisFile as File).name.slice(0, (currentFile.thisFile).name.length - 4);
    }

    const decideProcessButtonText = () => {
        if (processUndergoing || (buildProcessElements().length != (fileSet as FileList).length && buildProcessElements().length > 0)) {
            return 'Process in Progress';
        } else if (!processUndergoing && buildProcessElements().length === (fileSet as FileList).length) {
            return 'Process Ended'
        }
        return 'Process Start';
    }



    return (
        <div>
            <div className="flex justify-between items-center bg-slate-700 p-3 shadow-lg">
                <div className="flex items-center">
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className={`!h-[106px] rounded-md transition ease-in-out delay-10 bg-teal-600 hover:!bg-teal-700 outline outline-2 !outline-white splash-text-white outline-dashed w-[720px] p-5 hover:cursor-pointer flex justify-between items-center`}>
                    <div className="flex items-center">
                        <IconContext.Provider value={{ className: 'text-6xl' }}>
                            <BsFileEarmarkPdf />
                        </IconContext.Provider>
                        <div className="ml-3 splash-text-white">
                            {pages > 0 ? <span>{`Embed successful. Displaying \xa0"`}<span className="!text-stone-950 font-bold">{currentFile && decideDisplayedFilename()}</span>{`", \xa0\xa0 ${currentFile.fileSetIndex + 1}/${(fileSet as FileList).length}`}</span> : <span>Click or drag and drop to upload file</span>}
                        </div>
                    </div>
                    <div className="font-medium">
                        PDF
                    </div> 
                    </div>
                </div>
                {pages > 0 && 
                <>
                    <button 
                        className={`p-5 rounded-md ml-3  transition ease-in-out delay-10 w-36 h-28${(currentFile.fileSetIndex != 0) || (buildProcessElements().length > 0) || processUndergoing as true | false ? ' cursor-not-allowed !bg-amber-200' : ' hover:!bg-amber-400 !bg-amber-300'}`}
                        onClick={processStart}
                        disabled={(currentFile.fileSetIndex != 0) || (buildProcessElements().length > 0) || processUndergoing as true | false}
                    >
                        {decideProcessButtonText()}
                    </button>
                    {/* <button 
                        className="p-5 rounded-md ml-3 bg-slate-200 transition ease-in-out delay-10 hover:bg-slate-500 w-36 h-28"
                        onClick={handleFileExtractAndUpdate}
                    >
                        Extract File
                    </button>
                    <button 
                        className="p-5 rounded-md ml-3 bg-slate-200 transition ease-in-out delay-10 hover:bg-slate-500 w-36 h-28"
                        onClick={handleFileInsert}
                    >
                        Insert Into Database
                    </button> */}
                    {fileSet && fileSet.length >= 2 && <div className="flex flex-col justify-center items-center w-36 h-28 ml-3"><button 
                        className={`p-[13px] rounded-md  transition ease-in-out delay-10 w-36 mb-2${isAscendDisabled ? ' cursor-not-allowed !bg-sky-200' : ' hover:!bg-sky-400 !bg-sky-300'}`}
                        onClick={() => fileNavigate(-1, true)}
                        disabled={isAscendDisabled}
                    >
                        Ascend
                    </button>
                    <button 
                        className={`p-[13px] rounded-md transition !hover:bg-emerald-400 ease-in-out delay-10 w-36 mt-1${isDescendDisabled ? ' cursor-not-allowed !bg-sky-200' : ' hover:!bg-sky-400 !bg-sky-300'}`}
                        onClick={() => fileNavigate(1, true)}
                        disabled={isDescendDisabled}
                    >
                        Descend
                    </button></div>}
                </>}
                </div>
                <button 
                    className="p-10 rounded-md bg-slate-300 transition ease-in-out delay-10 hover:bg-stone-400 w-36 h-28"
                    onClick={handleNavNav}
                >
                    Back
                </button>
            </div>
            <div className="h-pdfcalc w-full flex flex-row">
                { documentRender }
                <div className="w-full h-full">
                    {fileSet != null && <ProcessHeader />}
                    <div className="w-full h-plh flex flex-col overflow-y-scroll pb-3" id="process_bag">
                        { finishedProcesses != null && buildProcessElements() as Array<JSX.Element> }
                    </div>
                </div>
            </div>
            
        </div>
    )
}