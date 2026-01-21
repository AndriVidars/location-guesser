interface JoinGameFormProps {
    name: string;
    setName: (name: string) => void;
    code: string;
    setCode: (code: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    loading: boolean;
}

export const JoinGameForm = ({
    name, setName,
    code, setCode,
    onSubmit, onCancel, loading
}: JoinGameFormProps) => {
    return (
        <div className="flex flex-col gap-6">
            <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border-b outline-none py-1"
            />

            <input
                placeholder="Code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="border-b outline-none py-1"
            />

            <div className="flex flex-col gap-2 pt-4">
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="bg-zinc-900 text-white py-2 cursor-pointer hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? '...' : 'Join'}
                </button>
                <button
                    onClick={onCancel}
                    className="text-zinc-400 text-[10px] cursor-pointer hover:text-zinc-600 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
