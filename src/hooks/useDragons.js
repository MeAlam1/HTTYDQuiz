import {useEffect, useMemo, useState} from "react";

export default function useDragons() {
    const [dragons, setDragons] = useState([]);

    useEffect(() => {
        async function fetchDragons() {
            const apiFiles = [
                '/api/boulder.json',
                '/api/mystery.json',
                '/api/sharp.json',
                '/api/stoker.json',
                '/api/strike.json',
                '/api/tidal.json',
                '/api/tracker.json',
                '/api/unknown.json',
            ];

            const allDragons = await Promise.all(
                apiFiles.map(async (file) => {
                    const response = await fetch(file);
                    return await response.json();
                })
            );

            const flattenedDragons = allDragons.flat().map((d) => ({
                name: d.name,
                image: d.img,
                class: d.class,
                film: d.origin,
            }));

            setDragons(flattenedDragons);
        }

        fetchDragons();
    }, []);

    const classes = useMemo(() => {
        return [...new Set(dragons.map((d) => d.class))];
    }, [dragons]);

    return {dragons, classes};
}