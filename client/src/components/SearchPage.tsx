import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

const userAxios = axios.create();

userAxios.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export default function SearchPage() {

    const [pdfData, setPdfData] = useState<Uint8Array | null>(null)

    console.log(pdfData)
    
    const navigate = useNavigate()

    const handleNavNav = () => {
        navigate('/nav')
    }

    const retrievePdfData = async () => {
        const response = await userAxios.get('/api/protected/file/6532de1e604ad8302335ef86')
        setPdfData(response.data.data.data as Uint8Array)
    }

    return (
        <div>
            <button 
                className="absolute top-0 right-0 p-10 m-3 rounded-md bg-rose-300 transition ease-in-out delay-10 hover:bg-rose-500 w-36"
                onClick={handleNavNav}
            >
                Back
            </button>
            <button onClick={retrievePdfData}>retrieve binary data from mongodb and display pdf</button>
            {pdfData &&
            <div className="overflow-y-scroll h-pdfcalc w-fit bg-blue-500">
                    <Document
                        className="w-fit max-w-5xl"
                        file={{data: pdfData}}
                        loading={<div className="h-pdfcalc w-[628px] bg-blue-700"></div>}
                    >
                    <Page className="w-[400px] m-2" pageNumber={1} key={1}/>
                </Document>
            </div>}
        </div>
    )
}