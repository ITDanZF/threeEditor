import ModelList from './ModelList';
import ModelEdit from './ModelEdit';

export default function EditPanel() {
    return (
        <div className="w-full h-full flex flex-row">
            <div className="w-20 text-amber-50 bg-gradient-to-b from-slate-800 to-slate-900">
                <ModelEdit />
            </div>
            <div className="flex-1">
                <ModelList />
            </div>
        </div>
    );
}
