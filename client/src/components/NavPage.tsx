import { useNavigate } from "react-router-dom"

export default function NavPage(props: {updateToken: (updatedToken: string) => void}) {

    const navigate = useNavigate()

    const handleExit = () => {
        localStorage.removeItem("token")
        props.updateToken('')
    }

    const handleAddPageNav = () => {
        navigate('/insert_document')
    }

    const handleSearchPageNav = () => {
        navigate('/search_documents')
    }

    return(
        <div className="h-screen flex flex-col justify-center items-center">
            <button 
                className="absolute top-0 right-0 p-10 m-3 rounded-md bg-rose-300 transition ease-in-out delay-10 hover:bg-rose-500 w-60"
                onClick={handleExit}
            >
                Exit
            </button>
            <button
                className="shadow-xl rounded-md bg-slate-200 p-5 text-center w-60 m-2 transition ease-in-out delay-10 hover:bg-slate-500"
                onClick={handleAddPageNav}
            >
                Insert Document
            </button>
            <button
                className="shadow-xl rounded-md bg-slate-200 p-5 text-center w-60 transition ease-in-out delay-10 hover:bg-slate-500"
                onClick={handleSearchPageNav}
            >
                Search Documents
            </button>
        </div>
    )
}