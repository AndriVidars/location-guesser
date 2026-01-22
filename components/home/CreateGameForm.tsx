import { ContinentData, CountryData } from "@/lib/types/geo";

interface CreateGameFormProps {
    name: string;
    setName: (name: string) => void;
    rounds: number;
    setRounds: (rounds: number) => void;
    time: number;
    setTime: (time: number) => void;
    region: 'world' | 'continent' | 'country';
    setRegion: (region: 'world' | 'continent' | 'country') => void;
    regionId: string;
    setRegionId: (id: string) => void;
    continents: ContinentData[];
    countries: CountryData[];
    onSubmit: () => void;
    onCancel: () => void;
    loading: boolean;
}

export const CreateGameForm = ({
    name, setName,
    rounds, setRounds,
    time, setTime,
    region, setRegion,
    regionId, setRegionId,
    continents, countries,
    onSubmit, onCancel, loading
}: CreateGameFormProps) => {
    return (
        <div className="flex flex-col gap-6">
            <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border-b outline-none py-1"
            />

            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="w-full">
                        <label className="text-[10px] text-zinc-400 uppercase">Rounds</label>
                        <input
                            type="number"
                            value={rounds}
                            onChange={e => setRounds(Number(e.target.value))}
                            onBlur={() => setRounds(Math.min(Math.max(rounds, 5), 20))}
                            className="w-full border-b outline-none text-sm py-1"
                        />
                    </div>
                    <div className="w-full">
                        <label className="text-[10px] text-zinc-400 uppercase">Time/Round (s)</label>
                        <input
                            type="number"
                            value={time}
                            onChange={e => setTime(Number(e.target.value))}
                            onBlur={() => setTime(Math.min(Math.max(time, 30), 120))}
                            className="w-full border-b outline-none text-sm py-1"
                        />
                    </div>
                </div>

                <div className="flex justify-between text-[10px]">
                    {['world', 'continent', 'country'].map(m => (
                        <button
                            key={m}
                            onClick={() => setRegion(m as any)}
                            className={`${region === m ? 'font-bold' : 'text-zinc-300'} cursor-pointer hover:text-zinc-900 transition-colors`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {region !== 'world' && (
                    <select
                        value={regionId}
                        onChange={e => setRegionId(e.target.value)}
                        className="w-full border-b bg-transparent outline-none cursor-pointer"
                    >
                        <option value="">Select...</option>
                        {(region === 'continent' ? continents : countries).map(i => (
                            <option key={i.code} value={i.code}>{i.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="bg-zinc-900 text-white py-2 cursor-pointer hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? '...' : 'Create'}
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
