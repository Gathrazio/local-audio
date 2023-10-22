import { useState, FormEvent, ChangeEvent } from 'react'
import axios from 'axios'

export default function Auth(props: {updateToken: (updatedToken: string) => void}) {

    const [authText, setAuthText] = useState('');
    const [authError, setAuthError] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const res = await axios.post('/api/auth/login', { accessKey: authText });
            props.updateToken(res.data.token as string)
        } catch(err: any) {
            setAuthError(true)
            console.log(err.response.data.errMsg)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setAuthError(false)
        setAuthText(e.target.value)
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="bg-slate-500 border border-slate-400 p-5 rounded-md text-center">
                <div className="p-2 pt-0 text-slate-50">
                    Access Key
                </div>
                <form onSubmit={handleSubmit}>
                    <input type="password" className="shadow-xl rounded-md bg-slate-200 p-1 text-center outline-none" value={authText} onChange={handleChange} />
                    {authError && <div className="text-red-800 font-medium animate-pulse pt-3">Incorrect access key.</div>}
                </form>
            </div>
        </div>
    )
}