import { useState } from 'react';

export default function usePointerStyle() {
    const [pointerStyle, setPointerStyle] = useState<'grab' | 'grabbing'>('grab');

    const handleMouseDown = () => {
        setPointerStyle('grabbing');
    };
    const handleMouseUp = () => {
        setPointerStyle('grab');
    };
    return {
        pointerStyle,
        handleMouseDown,
        handleMouseUp,
    };
}
