import {useEffect, useMemo, useState} from "react";
import {DRAGON_DATA_B64} from "../data/dragonsData.js";

export default function useDragons() {
    const [dragons, setDragons] = useState([]);

    useEffect(() => {
        const decodeBase64 = (value) => {
            if (typeof atob === "function") return atob(value);
            return Buffer.from(value, "base64").toString("utf8");
        };

        const decoded = JSON.parse(decodeBase64(DRAGON_DATA_B64));
        const flattenedDragons = decoded.map((d) => ({
            name: d.name,
            image: d.img,
            class: d.class,
            film: d.origin,
        }));

        setDragons(flattenedDragons);
    }, []);

    const classes = useMemo(() => {
        return [...new Set(dragons.map((d) => d.class))];
    }, [dragons]);

    return {dragons, classes};
}