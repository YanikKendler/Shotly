export default function ViewPortSwitcher({
    under,
    over,
    breakpoint
}: {
    under: string,
    over: string,
    breakpoint: number
}) {
    const id = `vps-${breakpoint}`;

    return (
        <>
            <style>{`
                .${id}-under { display: inline; }
                .${id}-over  { display: none; }
                
                @media (min-width: ${breakpoint}px) {
                    .${id}-under { display: none; }
                    .${id}-over  { display: inline; }
                }
            `}</style>

            <span className={`${id}-under`}>{under}</span>
            <span className={`${id}-over`}>{over}</span>
        </>
    );
}