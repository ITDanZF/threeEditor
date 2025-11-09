import Image from 'next/image';
const IconList = [
    {
        path: '/svg/rotate.svg',
        name: '旋转物体',
    },
    {
        path: '/svg/translate.svg',
        name: '平移物体',
    },
    {
        path: '/svg/zoom.svg',
        name: '缩放物体',
    },
];
export default function ModelEdit() {
    return (
        <div className="flex flex-col items-center">
            {IconList.map((icon) => {
                return (
                    <div
                        key={icon.name}
                        className="group relative w-full h-15 flex justify-center items-center rounded-md bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer mb-2"
                        title={icon.name}
                    >
                        <Image
                            src={icon.path}
                            alt={icon.name}
                            width={24}
                            height={24}
                        />
                        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap text-xs px-2 py-1 rounded bg-slate-900/90 text-amber-100 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 z-10 shadow border border-slate-700">
                            {icon.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
