interface MainMenuProps {
    onSelect: (view: 'create' | 'join') => void;
}

export const MainMenu = ({ onSelect }: MainMenuProps) => {
    return (
        <div className="flex flex-col items-start gap-4">
            <button
                onClick={() => onSelect('create')}
                className="hover:line-through cursor-pointer text-lg"
            >
                New Game
            </button>
            <button
                onClick={() => onSelect('join')}
                className="hover:line-through cursor-pointer text-lg"
            >
                Join Game
            </button>
        </div>
    );
};
