import useCounter from "@popup/src/services/counter"

export default function DevConsole() {
    const [counter, updateCounter] = useCounter();

    const handleCounterUpdate = () => {
        updateCounter();
    }
    return (
        <div className="fixed z-[1000] top-4 right-4 border-2">
            <h3 className="p-2">Dev Console</h3>
            <hr />
            <div className="p-2">
                <span>New Comments Counter</span>
                <div>
                    <p>Counter: <span>{counter}</span></p>
                    <button 
                        className="rounded border-2 bg-webtoon hover:bg-webtoon-dark p-2 text-white font-medium"
                        role="button" 
                        onClick={handleCounterUpdate}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}